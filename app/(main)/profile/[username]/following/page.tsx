import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProfile } from "@/lib/profile/get-profile";
import { getFollowingList } from "@/lib/profile/get-follow-list";
import { FollowListRow } from "@/features/profile/components/follow-list-row";

export const metadata: Metadata = { title: "Following" };

export default async function FollowingPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const viewer = await getCurrentUser();
  if (!viewer) redirect("/sign-in");

  const profile = await getProfile(username, viewer.id);
  if (!profile) notFound();

  const following = await getFollowingList(profile.id, viewer.id);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="px-4 py-3 text-lg font-semibold">Following</h1>
      {following.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">Not following anyone yet.</p>
      ) : (
        following.map((u) => <FollowListRow key={u.id} user={u} />)
      )}
    </div>
  );
}
