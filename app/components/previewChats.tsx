"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PreviewConversationType } from "../types";
import { format, isToday, isYesterday } from "date-fns";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { pusherClient } from "../lib/pusherClient";
import { getActiveConversation } from "../lib/conversationActions";

export default function PreviewChats({
  conversations,
}: {
  conversations: PreviewConversationType[];
}) {
  const { user } = useUser();
  const [chatList, setChatList] = useState<PreviewConversationType[]>(conversations);

  useEffect(() => {
    setChatList(conversations);
  }, [conversations]);

  useEffect(() => {
    if (!user?.id) return;

    const userChannelName = `user-${user.id}`;
    const userChannel = pusherClient.subscribe(userChannelName);

    const handleConversationUpdated = async (data: {
      conversationId: string;
      lastMessage: { content: string; created_at: string | Date };
      senderClerkId: string;
    }) => {
      setChatList((prevList) => {
        const index = prevList.findIndex((c) => c.id === data.conversationId);

        if (index !== -1) {
          const updatedConv: PreviewConversationType = {
            ...prevList[index],
            messages: [
              {
                content: data.lastMessage.content,
                created_at: new Date(data.lastMessage.created_at),
              },
            ],
          };

          // Move the updated conversation to the top
          const otherConversations = prevList.filter(
            (c) => c.id !== data.conversationId
          );
          return [updatedConv, ...otherConversations];
        }

        return prevList;
      });

      const res = await getActiveConversation();
      if (res.success && res.data) {
        setChatList(res.data);
      }
    };

    userChannel.bind("conversation-updated", handleConversationUpdated);

    return () => {
      userChannel.unbind("conversation-updated", handleConversationUpdated);
      pusherClient.unsubscribe(userChannelName);
    };
  }, [user?.id]);

  if (chatList.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Belum ada obrolan aktif.
      </div>
    );
  }

  return (
    <>
      {chatList.map((conversation) => {
        const isAnyChat = conversation.messages && conversation.messages.length >= 1;
        let label = "";

        if (isAnyChat) {
          const messageDate = new Date(conversation.messages[0].created_at);

          if (isToday(messageDate)) {
            label = format(messageDate, "HH:mm");
          } else if (isYesterday(messageDate)) {
            label = "Kemarin";
          } else {
            label = format(messageDate, "dd MMMM yyyy");
          }
        }

        return (
          <Link
            href={`?chatId=${conversation.id}`}
            key={conversation.id}
            className="flex items-center gap-x-4 cursor-pointer p-3 rounded-xl hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors"
          >
            {conversation.interlocutor.avatar ? (
              <Image
                alt="avatar pengguna"
                src={conversation.interlocutor.avatar}
                width={48}
                height={48}
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-zinc-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0">
                {(conversation.interlocutor.username || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div className="w-full min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                  {conversation.interlocutor.username}
                </h3>
                {isAnyChat && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0 ml-2">
                    {label}
                  </span>
                )}
              </div>

              <p className="font-medium text-zinc-500 dark:text-zinc-400 text-xs truncate">
                {isAnyChat ? conversation.messages[0].content : "Belum ada obrolan"}
              </p>
            </div>
          </Link>
        );
      })}
    </>
  );
}