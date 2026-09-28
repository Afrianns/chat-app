import PusherClient from "pusher-js";

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY || "5854f11f055684989216",
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
  }
);