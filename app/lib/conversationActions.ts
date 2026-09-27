"use server"

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { ConversationActiveType, ConversationType, InterlocutorType, MessagesType, PreviewConversationType } from "../types";
import { getUser } from "./user";


interface resultType<T> {
    success: boolean
    message: string
    data?: T
} 


interface PreviewConversationDataType {
  id: string
  user1: {
      username: string
      clerk_user_id: string
  };
  user2: {
      username: string
      clerk_user_id: string
  };
  messages: {
      created_at: Date
      content: string
  }[];
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
      messages: true,
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
        user1: {
          select: {
            clerk_user_id: true,
            username: true
          }
        },
        user2: {
          select: {
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
    })

    result = {
      success: true,
      message: "Successfully send",
      data: send
    }
  } else{
    result = {
      message: "User not found",
      success: false
    }
  }

  return result;
}


const remapConversation = async (currentUserClerkId: string, conversations: PreviewConversationDataType[]): Promise<PreviewConversationType[]> => {
  return conversations.map(conversation => {
    let interlocutor = {
      username: "",
      clerk_user_id: ""
    }
    if(conversation.user1.clerk_user_id != currentUserClerkId) {
      interlocutor = {
        username: conversation.user1.username,
        clerk_user_id: conversation.user1.clerk_user_id
      }
    } else{
      interlocutor = {
        username: conversation.user2.username,
        clerk_user_id: conversation.user2.clerk_user_id
      }
    }
    return {
      id: conversation.id,
      interlocutor: interlocutor,
      messages: conversation.messages
    }
  })
}

interface UserConversationType {
 messages: {
    id: string;
    created_at: Date;
    content: string;
    updated_at: Date;
    conversation_id: string;
    sender_id: string;
 }[];
 user1: {
    id: string;
    created_at: Date;
    username: string;
    email: string;
    clerk_user_id: string;
 };
 user2: {
    id: string;
    created_at: Date;
    username: string;
    email: string;
    clerk_user_id: string;
 };
}


const filterNotCurrentUser = async (clerkId: string, conversation: UserConversationType): Promise<ConversationType> => {

  let interlocutor: InterlocutorType = {
    id: "",
    email: "",
    username: "",
    clerk_user_id: "",
    created_at: new Date()
  }

  if(conversation.user1.clerk_user_id != clerkId) {
    interlocutor = conversation.user1
  } else{
    interlocutor = conversation.user2
  }

  return {
    interlocutor: interlocutor,
    messages: conversation.messages
  }
}