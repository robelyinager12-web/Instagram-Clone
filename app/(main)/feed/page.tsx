import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getFeedPage } from "@/lib/feed/get-feed";
import { FeedList } from "@/features/feed/components/feed-list";
import { SuggestedUsers } from "@/features/feed/components/suggested-users";

export const metadata: Metadata = {
  title: "Home",
};

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const initialPage = await getFeedPage({ viewerId: user.id });

  return (
    <div className="mx-auto flex max-w-4xl justify-center px-4 py-6">
      <FeedList initialPage={initialPage} />
      <SuggestedUsers />
    </div>
  );
}
