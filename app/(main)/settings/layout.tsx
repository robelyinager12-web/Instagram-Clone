import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SettingsNav } from "@/features/settings/components/settings-nav";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="mx-auto flex max-w-4xl flex-col md:flex-row">
      <SettingsNav />
      <div className="flex-1 px-4 py-6 md:px-8">{children}</div>
    </div>
  );
}
