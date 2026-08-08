import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getChatList } from "@/lib/messages/get-chats";
import { ChatList } from "@/features/messages/components/chat-list";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const chats = await getChatList(user.id);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="px-4 py-3 text-lg font-semibold">Messages</h1>
      <ChatList chats={chats} viewerId={user.id} />
    </div>
  );
}
