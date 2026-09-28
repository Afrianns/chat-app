"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("chatId");

  const [chatList, setChatList] = useState<PreviewConversationType[]>(conversations);

  // Keep chatList in sync if parent server props change
  useEffect(() => {
    setChatList(conversations);
  }, [conversations]);

  // Clear unread count when user selects/opens a chat
  useEffect(() => {
    if (!activeChatId) return;

    setChatList((prevList) =>
      prevList.map((c) =>
        c.id === activeChatId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, [activeChatId]);

  // Realtime subscription to the current user's channel for sidebar updates
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
          const currentItem = prevList[index];
          const isCurrentlyActive = activeChatId === data.conversationId;
          const isIncoming = data.senderClerkId !== user?.id;

          const newUnreadCount = isCurrentlyActive || !isIncoming
            ? 0
            : (currentItem.unreadCount ?? 0) + 1;

          const updatedConv: PreviewConversationType = {
            ...currentItem,
            messages: [
              {
                content: data.lastMessage.content,
                created_at: new Date(data.lastMessage.created_at),
              },
            ],
            unreadCount: newUnreadCount,
          };

          // Move the updated conversation to the top
          const otherConversations = prevList.filter(
            (c) => c.id !== data.conversationId
          );
          return [updatedConv, ...otherConversations];
        }

        return prevList;
      });

      // If this was a brand new conversation not yet in the list, fetch fresh list
      const res = await getActiveConversation();
      if (res.success && res.data) {
        setChatList(res.data);
      }
    };

    // When messages are read, reset unread badge in sidebar
    const handleConversationRead = (data: { conversationId: string }) => {
      setChatList((prevList) =>
        prevList.map((c) =>
          c.id === data.conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    };

    userChannel.bind("conversation-updated", handleConversationUpdated);
    userChannel.bind("conversation-read", handleConversationRead);

    return () => {
      userChannel.unbind("conversation-updated", handleConversationUpdated);
      userChannel.unbind("conversation-read", handleConversationRead);
      pusherClient.unsubscribe(userChannelName);
    };
  }, [user?.id, activeChatId]);

  if (chatList.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Belum ada obrolan aktif.
      </div>
    );
  }

  const handleSelectChat = (id: string) => {
    window.history.pushState(null, '', `?chatId=${id}`);    
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <>
      {chatList.map((conversation) => {
        const isAnyChat = conversation.messages && conversation.messages.length >= 1;
        const isActive = activeChatId === conversation.id;
        const unreadCount = conversation.unreadCount ?? 0;
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
          <button
            onClick={() => handleSelectChat(conversation.id)}
            key={conversation.id}
            className={`flex items-center gap-x-4 cursor-pointer p-3 rounded-xl border transition-all w-full ${
              isActive
                ? "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 shadow-xs"
                : "hover:bg-white dark:hover:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/60"
            }`}
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
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 shrink-0 ml-2">
                    {label}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-xs truncate ${
                    unreadCount > 0
                      ? "font-semibold text-zinc-900 dark:text-zinc-100"
                      : "font-medium text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {isAnyChat ? conversation.messages[0].content : "Belum ada obrolan"}
                </p>

                {/* Red circle badge with unread count */}
                {unreadCount > 0 && (
                  <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-white bg-red-500 rounded-full shrink-0 shadow-xs animate-in zoom-in duration-150">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </>
  );
}