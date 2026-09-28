"use client"

import { useEffect, useRef, useState } from "react"
import { conversation, sendMessage, markMessagesAsRead } from "../lib/conversationActions"
import { InterlocutorType, MessagesType } from "../types";
import { useUser } from "@clerk/nextjs";
import { pusherClient } from "../lib/pusherClient";

import { format, isToday, isYesterday } from 'date-fns';
import Image from "next/image";

export default function Conversation({ chatId }: { chatId: string }) {
  let lastRenderedDate = "";

  const [message, setMessage] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessagesType[]>([]);
  const [conversationData, setConversationData] = useState<InterlocutorType>({
    id: "",
    avatar: "",
    email: "",
    clerk_user_id: "",
    created_at: new Date(),
    username: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    const getConversation = async () => {
      const result = await conversation(chatId);

      if (isMounted && result.success && result.data) {
        setConversationData(result.data.interlocutor);
        setMessages(result.data.messages);

        // If there are unread incoming messages, mark them as read in DB and notify
        const hasUnread = result.data.messages.some(
          (m) => !m.is_readed && m.sender_clerk_id !== user?.id
        );
        if (hasUnread) {
          markMessagesAsRead(chatId);
        }
      }
    };

    getConversation();

    // Subscribe to Pusher channel for this chat
    const channelName = `conversation-${chatId}`;
    const channel = pusherClient.subscribe(channelName);

    const handleNewMessage = (data: { message: MessagesType }) => {
      const incomingMessage = data.message;

      // Realtime ONLY for receiver:
      // The sender already added their message locally via doSendMessage.
      if (incomingMessage.sender_clerk_id !== user?.id) {
        setMessages((prevVal) => {
          if (prevVal.some((m) => m.id === incomingMessage.id)) {
            return prevVal;
          }
          return [...prevVal, incomingMessage];
        });

        // Since receiver is actively in this chat, mark it as read
        markMessagesAsRead(chatId);
      }
    };

    // When interlocutor reads our messages, update read status in real-time
    const handleMessagesRead = (data: { chatId: string; readByClerkId: string }) => {
      if (data.chatId === chatId) {
        setMessages((prevVal) =>
          prevVal.map((m) =>
            m.sender_clerk_id !== data.readByClerkId
              ? { ...m, is_readed: true }
              : m
          )
        );
      }
    };

    channel.bind("new-message", handleNewMessage);
    channel.bind("messages-read", handleMessagesRead);

    return () => {
      isMounted = false;
      channel.unbind("new-message", handleNewMessage);
      channel.unbind("messages-read", handleMessagesRead);
      pusherClient.unsubscribe(channelName);
    };
  }, [chatId, user?.id]);

  const doSendMessage = async () => {
    if (!message.trim() || loading) return;

    setLoading(true);

    const result = await sendMessage(message, chatId);
    if (result.success && result.data) {
      setLoading(false);
      // Sender adds message to own local state immediately
      setMessages((prevVal) => [...prevVal, result.data as MessagesType]);
      setMessage("");
    } else {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSendMessage();
    }
  };

  return (
    <div className="h-full w-full flex flex-col justify-between">
      <div className="py-5 px-10 border-b border-zinc-300 dark:border-zinc-600">
        <div className="wrapper-style">
          <div className="flex items-center gap-x-5">
            {conversationData.avatar ? (
              <Image
                alt="avatar pengguna"
                src={conversationData.avatar}
                width={50}
                height={50}
                className="rounded-full"
              />
            ) : (
              <div className="w-12.5 h-12.5 bg-zinc-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {(conversationData.username || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-bold">{conversationData.username}</h1>
              <p className="text-zinc-500 text-sm">{conversationData.email}</p>
            </div>
          </div>
        </div>
      </div>

      {messages.length >= 1 ? (
        <div className="wrapper-style px-5 h-full py-5 space-y-5 overflow-y-auto">
          {messages.map((messageItem) => {
            const messageDate = new Date(messageItem.created_at);
            const dateKey = format(messageDate, "yyyy-MM-dd");

            const showSeparator = dateKey !== lastRenderedDate;
            lastRenderedDate = dateKey;

            let label = "";
            if (isToday(messageDate)) {
              label = "Hari ini";
            } else if (isYesterday(messageDate)) {
              label = "Kemarin";
            } else {
              label = format(messageDate, "dd MMMM yyyy");
            }

            const isUnread = !messageItem.is_readed;

            return (
              <div key={messageItem.id}>
                {showSeparator && (
                  <div className="flex items-center my-6">
                    <div className="grow border-t border-zinc-200 dark:border-zinc-700"></div>
                    <span className="mx-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      {label}
                    </span>
                    <div className="grow border-t border-zinc-200 dark:border-zinc-700"></div>
                  </div>
                )}

                <div className={`${(isUnread && user?.id !== messageItem.sender_clerk_id) && "ml-auto text-zinc-900 dark:text-zinc-100 bg-yellow-500/10"} flex items-start justify-between py-5`}>
                  <div
                    className={`${user?.id === messageItem.sender_clerk_id ? "ml-auto text-white dark:text-black bg-zinc-900 dark:bg-zinc-100" : "text-black dark:text-white bg-zinc-200 dark:bg-zinc-800"} py-4 px-6 rounded-2xl w-fit max-w-125 transition-colors`}
                  >
                    <p className="pr-5">{messageItem.content}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className="text-right block text-xs opacity-75">
                        {format(new Date(messageItem.created_at), "HH:mm")}
                      </span>
                    </div>
                  </div>
                  {isUnread && (
                    <span className="text-right block text-[10px] font-semibold text-yellow-600 dark:text-yellow-400">
                      Belum dibaca
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="max-w-200 text-center mx-auto mt-auto mb-10">
          <p className="py-2 px-5 bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-300 rounded-2xl">
            Belum terdapat obrolan, mulai obrolan sekarang!
          </p>
        </div>
      )}

      <div className="border-t border-zinc-300 dark:border-zinc-600">
        <div className="wrapper-style p-5 flex gap-x-5">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="inline-block w-full py-3 px-5 border-2 border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-950 rounded-full outline-none focus:border-zinc-500"
            placeholder="Tulis pesan (tekan Enter untuk kirim)..."
          />
          {!loading ? (
            <button
              type="button"
              className="button-style cursor-pointer"
              onClick={doSendMessage}
            >
              Kirim
            </button>
          ) : (
            <div className="button-disabled-style">Mengirim...</div>
          )}
        </div>
      </div>
    </div>
  );
}