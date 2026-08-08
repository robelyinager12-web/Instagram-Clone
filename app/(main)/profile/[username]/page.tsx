import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProfile, getProfilePostsPage } from "@/lib/profile/get-profile";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { ProfilePostGrid } from "@/features/profile/components/profile-post-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const viewer = await getCurrentUser();
  if (!viewer) redirect("/sign-in");

  const profile = await getProfile(username, viewer.id);
  if (!profile) notFound();

  const initialPostsPage = profile.canViewPosts
    ? await getProfilePostsPage({ userId: profile.id })
    : { posts: [], nextCursor: null };

  return (
    <div className="mx-auto max-w-3xl">
      <ProfileHeader profile={profile} />
      <ProfilePostGrid
        username={profile.username}
        canViewPosts={profile.canViewPosts}
        initialPage={initialPostsPage}
      />
    </div>
  );
}
