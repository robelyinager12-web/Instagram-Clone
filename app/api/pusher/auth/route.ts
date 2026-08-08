import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { pusherServer } from "@/services/pusher/server";

export async function POST(req: Request) {
  try {
    const user = await requireCurrentUser();
    const formData = await req.formData();
    const socketId = formData.get("socket_id") as string;
    const channel = formData.get("channel_name") as string;

    if (channel.startsWith("private-user-")) {
      const ownerId = channel.replace("private-user-", "");
      if (ownerId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const authResponse = pusherServer.authorizeChannel(socketId, channel);
      return NextResponse.json(authResponse);
    }

    if (channel.startsWith("presence-chat-")) {
      const chatId = channel.replace("presence-chat-", "");
      const membership = await prisma.chatMember.findUnique({
        where: { chatId_userId: { chatId, userId: user.id } },
      });
      if (!membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const authResponse = pusherServer.authorizeChannel(socketId, channel, {
        user_id: user.id,
        user_info: { username: user.username, avatarUrl: user.avatarUrl },
      });
      return NextResponse.json(authResponse);
    }

    return NextResponse.json({ error: "Unknown channel" }, { status: 400 });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    console.error("POST /api/pusher/auth failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
