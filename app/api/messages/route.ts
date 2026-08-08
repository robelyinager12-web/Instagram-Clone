import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { getMessagesPage } from "@/lib/messages/get-messages";

export async function GET(req: Request) {
  try {
    const user = await requireCurrentUser();
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    const cursor = searchParams.get("cursor") ?? undefined;

    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    const membership = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId: user.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const page = await getMessagesPage({ chatId, viewerId: user.id, cursor });
    return NextResponse.json(page);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    console.error("GET /api/messages failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
