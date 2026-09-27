import { useEffect, useState } from "react"
import { conversation, sendMessage } from "../lib/conversationActions"
import { ConversationType, InterlocutorType, MessagesType } from "../types";
import { useUser } from "@clerk/nextjs";

import { fromUnixTime, format } from 'date-fns';


export default function Conversation({ chatId }: {chatId: string}) {

  const [message, setMessage] = useState("");

  const user = useUser()

  const [messages, setMessages] = useState<MessagesType[]>([])
  const [conversationData, setConversationData] = useState<InterlocutorType>(
    {
      id: "",
      email: "",
      clerk_user_id: "",
      created_at: new Date(),
      username: "",
    }
  )


  useEffect(() => {

    const getConversation = async () => {
      const result = await conversation(chatId)

      if(result.success && result.data){
        setConversationData(result.data.interlocutor)
        setMessages(result.data.messages)
      }

      console.log("hello", result)
    }

    getConversation()
  }, [])


  const doSendMessage = async () => {
    console.log(message)
    alert(message)

    const result = await sendMessage(message, chatId)

    if(result.success && result.data){
      setMessages((prevVal) => [...prevVal, result.data as MessagesType])
    }
  }

  return (
    <div className="h-full w-full flex flex-col justify-between">
      <div className="py-5 px-10 border-b border-zinc-600">
        <div className="wrapper-style">
          <div>
            <h1 className="font-bold">{conversationData.username}</h1>
            <p className="text-zinc-500 text-sm">{conversationData.email}</p>
          </div>
        </div>
      </div>

      <div className="wrapper-style px-5 bg-red-50 h-full py-5">
        {messages.map((message) => {
          return (
          <div key={message.id} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black py-5 px-6 rounded-2xl max-w-125">
            <p>{message.content}</p>
            <span className="text-right block">{format(message.created_at, 'HH:mm')}</span>
          </div>
          )
        })}
      </div>
      <div className="border-t border-zinc-400">
        <div className="wrapper-style p-5 flex gap-x-5">
          <input type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="inline-block w-full py-3 px-5 border-2 border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-950 rounded-full" placeholder="Tulis pesan" />
          <button
          type="button"
          className="button-style"
          onClick={doSendMessage}
        >
          Kirim
        </button>
        </div>
      </div>
    </div>
  )
}