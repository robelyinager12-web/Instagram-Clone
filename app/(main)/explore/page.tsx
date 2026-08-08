import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getExplorePage } from "@/lib/explore/get-explore";
import { MasonryGrid } from "@/features/explore/components/masonry-grid";

export const metadata: Metadata = {
  title: "Explore",
};

export default async function ExplorePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const initialPage = await getExplorePage({ viewerId: user.id });

  return <MasonryGrid initialPage={initialPage} />;
}
