"use client"

import { useSearchParams } from "next/navigation"
import Conversation from "./conversations"
import { useEffect, useState } from "react"
import { getActiveConversation } from "../lib/conversationActions"
import { ConversationActiveType } from "../types"



export default function ChatWrapper() {

  // const [conversation, setCoversation] = useState<ConversationActiveType[]>([])

  const searchParams = useSearchParams()
  const chatId = searchParams.get('chatId')

  // useEffect(() => {
    
  //   const doGetActiveConversation = async () => {
  //     const result = await getActiveConversation()

  //     if(result.success && result.data) {
  //       setCoversation(result.data)
  //     }
  //   }


  //   doGetActiveConversation()
  // }, [])

  return (
    <>
      {chatId ? 
        <Conversation chatId={chatId} />
      :
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Selamat Datang di Chat App
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mt-1">
            Klik tombol &quot;Chat Baru&quot; di sisi kiri untuk memilih pengguna dan memulai percakapan.
          </p>
        </div>
      }
    </>
  )
}