import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SearchPanel } from "@/features/search/components/search-panel";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <SearchPanel />;
}
