import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="flex">
      <SignIn appearance={{
        elements: {
          rootBox: "bg-white! dark:bg-zinc-900! h-[calc(100vh-92px)]! flex! flex-col! place-center! items-center! justify-center! border-none!",
          cardBox: "w-[600px]! m-auto h-full! justify-center! shadow-none! border-none!",
          card: "bg-white! dark:bg-zinc-900! border-none!",
          footerItem: "hidden!"
        }
      }} />
      <div className="relative bg-red-300 w-full">
        <Image src="/assets/backgroundBW.jpg" fill alt="background abstaract black & white" className="absolute top-0 left-0 bottom-0 z-2 w-full h-full object-cover"/>
      </div>
    </div>
  );
}
