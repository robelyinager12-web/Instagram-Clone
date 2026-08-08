import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function MyProfileRedirect() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  redirect(`/profile/${user.username}`);
}
