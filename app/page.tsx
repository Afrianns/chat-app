import { redirect } from "next/navigation";
import { checkingUser } from "./lib/user";
import { getAllUsers } from "./lib/chatActions";
import { NewChatModal } from "./components/NewChatModal";
import ChatWrapper from "./components/chatWrapper";
import { getActiveConversation } from "./lib/conversationActions";
import { ConversationActiveType, PreviewConversationType } from "./types";
import { format } from "date-fns";
import Link from "next/link";

export default async function Home() {
  let user;

  let conversations: PreviewConversationType[] = []

  try {
    user = await checkingUser();
  } catch {
    redirect("/sign-in");
  }

  const allUsers = await getAllUsers();

  const result = await getActiveConversation()

  if(result.success && result.data) {
    conversations = result.data
  }

  return (
    <div className="flex h-[calc(100vh-57px)] justify-center">
      <div className="bg-zinc-100 dark:bg-zinc-900 shadow-md w-1/3 h-full border-r border-zinc-300 dark:border-zinc-600 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 bg-zinc-200 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">Percakapan</h2>
          <NewChatModal users={allUsers} />
        </div>
        <div className="px-5 py-6 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs uppercase tracking-wider">
            Obrolan Kamu
          </h3>
          {conversations.map((conversation) => {
            return (
              <Link href={`?chatId=${conversation.id}`} key={conversation.id} className="block cursor-pointer p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-1">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-md">{conversation.interlocutor.username}</h3>
                <div className="flex items-center justify-between mt-2">
                  <h3 className="font-medium text-zinc-500 dark:text-zinc-100 text-sm">{conversation.messages[0].content}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-100">{format(conversation.messages[0].created_at, 'HH:mm')}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="bg-zinc-50 dark:bg-zinc-950 w-full h-full flex flex-col items-center justify-center">
        <ChatWrapper />
      </div>
    </div>
  );
}

