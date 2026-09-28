"use server"

import { redirect } from "next/navigation";
import { checkingUser } from "./lib/user";
import { getAllUsers } from "./lib/chatActions";
import { NewChatModal } from "./components/NewChatModal";
import { getActiveConversation } from "./lib/conversationActions";
import { PreviewConversationType } from "./types";

import ChatWrapper from "./components/chatWrapper";
import PreviewChats from "./components/previewChats";

export default async function Home() {
  
  let conversations: PreviewConversationType[] = []
  
  let user;
  try {
    user = await checkingUser();
  } catch(err) {
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
          <PreviewChats conversations={conversations} />
        </div>
      </div>
      <div className="bg-zinc-50 dark:bg-zinc-950 w-full h-full flex flex-col items-center justify-center">
        <ChatWrapper />
      </div>
    </div>
  );
}

