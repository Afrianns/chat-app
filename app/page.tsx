import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-[calc(100vh-57px)] justify-center">
      <div className="bg-zinc-100 dark:bg-zinc-900 shadow-md w-1/3 h-full border-r border-zinc-300 dark:border-zinc-600 px-5 py-10">
        <p>Chatting with people</p>
      </div>
      <div className="bg-blue-300/10 w-full h-full"></div>
    </div>
  );
}

