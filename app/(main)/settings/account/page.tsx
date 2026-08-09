import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { EditProfileForm } from "@/features/settings/components/edit-profile-form";

export const metadata: Metadata = { title: "Edit profile" };

export default async function AccountSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <EditProfileForm
      initial={{
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        website: user.website,
        avatarUrl: user.avatarUrl,
      }}
    />
  );
}
