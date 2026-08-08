import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getReelsPage } from "@/lib/reels/get-reels";
import { ReelsFeed } from "@/features/reels/components/reels-feed";

export const metadata: Metadata = {
  title: "Reels",
};

export default async function ReelsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const initialPage = await getReelsPage({ viewerId: user.id });

  return <ReelsFeed initialPage={initialPage} />;
}
