import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getFeedPage } from "@/lib/feed/get-feed";
import { FeedList } from "@/features/feed/components/feed-list";
import { SuggestedUsers } from "@/features/feed/components/suggested-users";
import { StoryTray } from "@/features/stories/components/story-tray";

export const metadata: Metadata = {
  title: "Home",
};

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const initialPage = await getFeedPage({ viewerId: user.id });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <StoryTray viewerId={user.id} />
      <div className="flex justify-center">
        <FeedList initialPage={initialPage} />
        <SuggestedUsers />
      </div>
    </div>
  );
}
