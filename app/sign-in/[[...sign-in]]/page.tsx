import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn appearance={{
      elements: {
          rootBox: "bg-white! dark:bg-zinc-900! h-[calc(100vh-57px)]! flex! flex-col! place-center! items-center! justify-center! border-none!",
          cardBox: "w-[600px]! m-auto h-full! justify-center! shadow-none! border-none!",
          card: "bg-white! dark:bg-zinc-900!",
          footerItem: "hidden!"
        }
    }} />
  );
}
