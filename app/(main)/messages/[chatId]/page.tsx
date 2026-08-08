import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMessagesPage } from "@/lib/messages/get-messages";
import { prisma } from "@/lib/db/prisma";
import { MessageThread } from "@/features/messages/components/message-thread";

export const metadata: Metadata = {
  title: "Chat",
};

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const membership = await prisma.chatMember.findUnique({
    where: { chatId_userId: { chatId, userId: user.id } },
  });
  if (!membership) notFound();

  const initialPage = await getMessagesPage({ chatId, viewerId: user.id });

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-screen">
      <MessageThread
        chatId={chatId}
        viewerId={user.id}
        viewerUsername={user.username}
        initialPage={initialPage}
      />
    </div>
  );
}
