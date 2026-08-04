import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getNotificationsPage } from "@/lib/notifications/get-notifications";
import { NotificationList } from "@/features/notifications/components/notification-list";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const initialPage = await getNotificationsPage({ userId: user.id });

  return <NotificationList initialPage={initialPage} />;
}
