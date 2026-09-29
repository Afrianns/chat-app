"use client"

import { useTheme } from "next-themes";
import Image from "next/image"

export default function LogoWrapper() {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <Image src="/logo/akselera-logo.png" width={120} height={100} alt="akselera tech logo" className="hidden dark:block" />
      <Image src="/logo/akselera-logo-dark.png" width={120} height={100} alt="akselera tech logo" className="block dark:hidden" />
      
    </>
  )
}