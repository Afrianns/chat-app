import { useEffect, useState } from "react"
import { conversation, sendMessage } from "../lib/conversationActions"
import { InterlocutorType, MessagesType } from "../types";
import { useUser } from "@clerk/nextjs";

import { format, isToday, isYesterday } from 'date-fns';
import Image from "next/image";


export default function Conversation({ chatId }: {chatId: string}) {

  let lastRenderedDate = ""; 

  const [message, setMessage] = useState("");

  const {user} = useUser()

  const [loading, setLoading] = useState<boolean>(false)

  const [messages, setMessages] = useState<MessagesType[]>([])
  const [conversationData, setConversationData] = useState<InterlocutorType>(
    {
      id: "",
      avatar: "",
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
    setLoading(true)
    
    const result = await sendMessage(message, chatId)
    if(result.success && result.data){
      setLoading(false)
      setMessages((prevVal) => [...prevVal, result.data as MessagesType])
      setMessage("")
    }
  }

  return (
    <div className="h-full w-full flex flex-col justify-between">
      <div className="py-5 px-10 border-b border-zinc-300 dark:border-zinc-600">
        <div className="wrapper-style">
          <div className="flex items-center gap-x-5">
            <Image alt="avatar pengguna" src={conversationData.avatar || ""} width={50} height={50} className="rounded-full"/>
            <div>
              <h1 className="font-bold">{conversationData.username}</h1>
              <p className="text-zinc-500 text-sm">{conversationData.email}</p>
            </div>
          </div>
        </div>
      </div>

      {messages.length >= 1 ? 
          <div className="wrapper-style px-5 h-full py-5 space-y-5 overflow-y-auto">
            {messages.map((message) => {
              const messageDate = new Date(message.created_at);
              const dateKey = format(messageDate, 'yyyy-MM-dd');
              
              const showSeparator = dateKey !== lastRenderedDate;
              
              lastRenderedDate = dateKey;

              let label = "";
              if (isToday(messageDate)) {
                label = "Hari ini";
              } else if (isYesterday(messageDate)) {
                label = "Kemarin";
              } else {
                label = format(messageDate, 'dd MMMM yyyy');
              }
              return (
                <div key={message.id}>
                  {showSeparator && (
                    <div className="flex items-center my-6">
                      <div className="grow border-t border-zinc-200 dark:border-zinc-700"></div>
                      <span className="mx-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        {label}
                      </span>
                      <div className="grow border-t border-zinc-200 dark:border-zinc-700"></div>
                    </div>
                  )}
                  <div className={`${user?.id == message.sender_clerk_id ? "ml-auto text-white dark:text-black bg-zinc-900 dark:bg-zinc-100" : "text-black dark:text-white bg-zinc-200 dark:bg-zinc-800" } py-4 px-6 rounded-2xl w-fit max-w-125`}>
                    <p className="pr-5">{message.content}</p>
                    <span className="text-right block">{format(message.created_at, 'HH:mm')}</span>
                  </div>
                </div>
              )
            })}
          </div>
        :
          <div className="max-w-200 text-center mx-auto mt-auto mb-10">
            <p className="py-2 px-5 bg-zinc-200 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-300 rounded-2xl">
              Belum terdapat obrolan, mulai obrolan sekarang!
            </p>
          </div>
      }

      <div className="border-t border-zinc-300 dark:border-zinc-600">
        <div className="wrapper-style p-5 flex gap-x-5">
        <input type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="inline-block w-full py-3 px-5 border-2 border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-950 rounded-full" placeholder="Tulis pesan" />
        {!loading ?
          <button
            type="button"
            className="button-style"
            onClick={doSendMessage}
          >
            Kirim
          </button>
          :
          <div className="button-disabled-style">
            Mengirim...
          </div>
        }
        </div>
      </div>
    </div>
  )
}