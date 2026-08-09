import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { PrivacyToggle } from "@/features/settings/components/privacy-toggle";

export const metadata: Metadata = { title: "Privacy" };

export default async function PrivacySettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-semibold">Privacy</h1>

      <PrivacyToggle initialIsPrivate={user.isPrivate} />

      <div className="space-y-3 rounded-xl border border-border p-4">
        <p className="text-sm font-semibold">Close Friends, Blocked, and Muted accounts</p>
        <p className="text-sm text-muted-foreground">
          Managing your close friends list, blocked accounts, and muted accounts isn&apos;t available yet — coming in a future update.
        </p>
      </div>
    </div>
  );
}
