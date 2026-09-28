"use server"

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { ConversationType, InterlocutorType, MessagesType, PreviewConversationType } from "../types";
import { getUser } from "./user";
import { pusher } from "./pusher";


interface resultType<T> {
    success: boolean
    message: string
    data?: T
} 


interface PreviewConversationDataType {
  id: string
  user1: {
      avatar: string
      username: string
      clerk_user_id: string
  };
  user2: {
      avatar: string
      username: string
      clerk_user_id: string
  };
  messages: {
      created_at: Date
      content: string
  }[];
  _count?: {
      messages: number
  };
}


export async function conversation(chatId: string): Promise<resultType<ConversationType>> {
  
  let result: resultType<ConversationType> = {
    success: true,
    message: "success"
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("User email not found");
  }


  const user = await prisma.conversation.findFirst({
    where: {
      id: chatId,
    },
    select: {
      messages: {
        select: {
          id: true,
          content: true,
          created_at: true,
          conversation_id: true,
          sender: {
            select: {
              clerk_user_id: true
            }
          },
          updated_at: true,
          is_readed: true
        }
      },
      user1: true,
      user2: true
    }
  });

  if(user != null) { 
    result = {
      success: true,
      message: "successfuly retrieved",
      data: await filterNotCurrentUser(clerkUser.id, user)
    }
  } else{
    result = {
      success: false,
      message: "failed to retrieved"
    }

  }
  
  return result;
}

export async function getActiveConversation(): Promise<resultType<PreviewConversationType[]>> {
  let result: resultType<PreviewConversationType[]> = {
    success: true,
    message: "success"
  }

  const clerkUser = await currentUser();
  const userId = await getUser()

  if(userId && clerkUser && clerkUser.id) {
    const conversation = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            first_user_id: userId
          },
          {
            second_user_id: userId
          }
        ]
      }, 
      select: {
        id: true,
        messages: {
          select: {
            content: true,
            created_at: true
          },
          orderBy: {
            created_at: "desc"
          },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                sender_id: { not: userId },
                is_readed: false
              }
            }
          }
        }, 
        user1: {
          select: {
            avatar: true,
            clerk_user_id: true,
            username: true
          }
        },
        user2: {
          select: {
            avatar: true,
            clerk_user_id: true,
            username: true
          }
        }
      }
    })
    result = {
      success: true,
      message: "Successfully send",
      data: await remapConversation(clerkUser.id as string, conversation as PreviewConversationDataType[])
    }
  } else{
    result = {
      message: "User not found",
      success: false
    }
  }

  return result
}


export async function sendMessage(message: string, chatId: string): Promise<resultType<MessagesType>> {

  let result: resultType<MessagesType> = {
    success: true,
    message: "success"
  }

   const clerkUser = await currentUser();
   

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("User email not found");
  }

  const userId = await getUser()

  if(userId){    
    const send = await prisma.message.create({
      data: {
        conversation_id: chatId,
        sender_id: userId,
        content: message
      },
      select: {
        id: true,
        content: true,
        created_at: true,
        conversation_id: true,
        sender: {
          select: {
            clerk_user_id: true
          }
        },
        updated_at: true,
        is_readed: true
      }
    })

    result = {
      success: true,
      message: "Successfully send",
      data: {
        ...send,
        sender_clerk_id: send.sender.clerk_user_id,
        is_readed: send.is_readed
      }
    }
  } else{
    result = {
      message: "User not found",
      success: false
    }
  }

  if (result.success && result.data) {
    // 1. Trigger realtime message for the active chat room
    await pusher.trigger(`conversation-${chatId}`, "new-message", {
      message: result.data,
    });

    // 2. Find participants to update their sidebar in real-time
    const conversationInfo = await prisma.conversation.findUnique({
      where: { id: chatId },
      select: {
        user1: { select: { clerk_user_id: true } },
        user2: { select: { clerk_user_id: true } },
      },
    });

    if (conversationInfo) {
      const updatePayload = {
        conversationId: chatId,
        lastMessage: {
          content: result.data.content,
          created_at: result.data.created_at,
        },
        senderClerkId: clerkUser.id,
      };

      // Trigger sidebar update for receiver
      const receiverClerkId =
        conversationInfo.user1.clerk_user_id === clerkUser.id
          ? conversationInfo.user2.clerk_user_id
          : conversationInfo.user1.clerk_user_id;

      if (receiverClerkId) {
        await pusher.trigger(`user-${receiverClerkId}`, "conversation-updated", updatePayload);
      }

      // Also trigger sidebar update for sender (for sync across tabs)
      await pusher.trigger(`user-${clerkUser.id}`, "conversation-updated", updatePayload);
    }
  }

  return result;
}


export async function markMessagesAsRead(chatId: string): Promise<resultType<boolean>> {
  const clerkUser = await currentUser();
  const userId = await getUser();

  if (!clerkUser || !userId) {
    return { success: false, message: "Unauthorized" };
  }

  // Mark all messages from the interlocutor in this chat as read
  await prisma.message.updateMany({
    where: {
      conversation_id: chatId,
      sender_id: { not: userId },
      is_readed: false,
    },
    data: {
      is_readed: true,
    },
  });

  // Notify chat room that messages were read
  await pusher.trigger(`conversation-${chatId}`, "messages-read", {
    chatId,
    readByClerkId: clerkUser.id,
  });

  // Notify user's sidebar so unread badge clears
  await pusher.trigger(`user-${clerkUser.id}`, "conversation-read", {
    conversationId: chatId,
  });

  return { success: true, message: "Marked as read" };
}


const remapConversation = async (currentUserClerkId: string, conversations: PreviewConversationDataType[]): Promise<PreviewConversationType[]> => {
  return conversations.map(conversation => {
    let interlocutor = {
      avatar: "",
      username: "",
      clerk_user_id: ""
    }
    if(conversation.user1.clerk_user_id != currentUserClerkId) {
      interlocutor = {
        avatar: conversation.user1.avatar,
        username: conversation.user1.username,
        clerk_user_id: conversation.user1.clerk_user_id
      }
    } else{
      interlocutor = {
        avatar: conversation.user2.avatar,
        username: conversation.user2.username,
        clerk_user_id: conversation.user2.clerk_user_id
      }
    }

    return {
      id: conversation.id,
      interlocutor: interlocutor,
      messages: conversation.messages,
      unreadCount: conversation._count?.messages ?? 0
    }
  })
}

interface UserConversationMessageMapType {
  id: string;
  conversation_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  is_readed: boolean;
  sender: {
    clerk_user_id: string;
  };
}

interface UserConversationType {
 messages: UserConversationMessageMapType[]
 user1: {
    id: string
    created_at: Date
    username: string
    avatar: string | null
    email: string
    clerk_user_id: string
 };
 user2: {
    id: string;
    created_at: Date
    username: string
    avatar: string | null
    email: string
    clerk_user_id: string
 };
}


const filterNotCurrentUser = async (clerkId: string, conversation: UserConversationType): Promise<ConversationType> => {

  let interlocutor: InterlocutorType = {
    id: "",
    email: "",
    username: "",
    avatar: "",
    clerk_user_id: "",
    created_at: new Date()
  }

  if(conversation.user1.clerk_user_id != clerkId) {
    interlocutor = {...conversation.user1, avatar: conversation.user1.avatar as string}
  } else{
    interlocutor = {...conversation.user2, avatar: conversation.user2.avatar as string}
  }

  return {
    interlocutor: interlocutor,
    messages: remapMessages(conversation.messages)
  }
}


const remapMessages = (messages: UserConversationMessageMapType[]) => {
  return messages.map((message) => {
    return {
      ...message,
      sender_clerk_id: message.sender.clerk_user_id,
      is_readed: message.is_readed
    }
  })
}