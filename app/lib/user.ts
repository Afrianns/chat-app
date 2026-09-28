"use server"

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

export async function checkingUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("clerk user not found");
  }
  
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  
  if (!email) {
    throw new Error("User email not found");
  }
  
  const username =
    clerkUser.username ??
    clerkUser.firstName ??
    email.split("@")[0];
  
  const user = await prisma.user.upsert({
    where: {
      clerk_user_id: clerkUser.id,
    },
    update: {
      username,
      email,
      avatar: clerkUser.imageUrl
    },
    create: {
      clerk_user_id: clerkUser.id,
      username,
      email,
    },
  });
  return user;
}


export async function getUser() {
  const clerkUser = await currentUser();

  if(clerkUser && clerkUser.id) {
    const userId = await prisma.user.findFirst({
      where: {
        clerk_user_id: clerkUser.id
      }, 
      select: {
        id: true
      }
    })

    return userId?.id
  }

  return null
}