"use server";

import { checkingUser } from "./user";
import { prisma } from "./prisma";

export async function createOrGetConversation(partnerId: string) {
  const currentUser = await checkingUser();

  if (currentUser.id === partnerId) {
    throw new Error("Cannot start conversation with yourself");
  }

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { first_user_id: currentUser.id, second_user_id: partnerId },
        { first_user_id: partnerId, second_user_id: currentUser.id },
      ],
    },
    include: {
      user1: {
        select: { id: true, username: true, email: true },
      },
      user2: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  if (existingConversation) {
    return { success: true, conversation: existingConversation };
  }

  // Create new conversation
  const newConversation = await prisma.conversation.create({
    data: {
      first_user_id: currentUser.id,
      second_user_id: partnerId,
    },
    include: {
      user1: {
        select: { id: true, username: true, email: true },
      },
      user2: {
        select: { id: true, username: true, email: true },
      },
    },
  });

  return { success: true, conversation: newConversation };
}

export async function getAllUsers() {
  const currentUser = await checkingUser();

  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUser.id },
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
    orderBy: {
      username: "asc",
    },
  });

  return users;
}
