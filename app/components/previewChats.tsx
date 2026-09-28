"use client"

import Link from "next/link"
import { PreviewConversationType } from "../types"
import { format, isToday, isYesterday } from "date-fns"
import { conversation } from "../lib/conversationActions"
import Image from "next/image"


export default function PreviewChats({ conversations }: {conversations: PreviewConversationType[]}) {

  return (
    <>
      {conversations.map((conversation) => {
        const isAnyChat = conversation.messages.length >= 1
        let label = ""

        if(isAnyChat) {
          const messageDate = new Date(conversation.messages[0].created_at);
  
          if (isToday(messageDate)) {
            label = format(messageDate, 'HH:mm');
          } else if (isYesterday(messageDate)) {
            label = "Kemarin";
          } else {
            label = format(messageDate, 'dd MMMM yyyy');
          }
        }

        return (
          <Link href={`?chatId=${conversation.id}`} key={conversation.id} className="flex items-center gap-x-5 cursor-pointer p-3 rounded-xl hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-1">
            <Image alt="avatar pengguna" src={conversation.interlocutor.avatar} width={50} height={50} className="rounded-full"/>
            <div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-lg">{conversation.interlocutor.username}</h3>
                {isAnyChat && 
                  <p className="text-xs text-zinc-500 dark:text-zinc-100">{label}</p>
                }
              </div>

              <p className="font-medium text-zinc-500 dark:text-zinc-100 text-sm">
                {isAnyChat ?
                  <>{conversation.messages[0].content}</>
                : 
                  <>Belum ada obrolan</>
                }
              </p>
            </div>
          </Link>
        )
        
      })}
    </>
  )
}