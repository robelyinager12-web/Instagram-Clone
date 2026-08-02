"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { SuggestedUser } from "@/types/feed";

async function fetchSuggestions(): Promise<{ users: SuggestedUser[] }> {
  const res = await fetch("/api/users/suggested");
  if (!res.ok) throw new Error("Failed to load suggestions");
  return res.json();
}

export function SuggestedUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ["suggested-users"],
    queryFn: fetchSuggestions,
  });

  if (isLoading || !data || data.users.length === 0) return null;

  return (
    <aside className="hidden w-72 shrink-0 pl-8 lg:block">
      <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
        Suggested for you
      </h2>
      <ul className="space-y-3">
        {data.users.map((user) => (
          <li key={user.id} className="flex items-center gap-3">
            <Link href={`/profile/${user.username}`} className="shrink-0">
              <div className="h-9 w-9 overflow-hidden rounded-full bg-muted">
                {user.avatarUrl && (
                  <Image
                    src={user.avatarUrl}
                    alt={user.username}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/profile/${user.username}`}
                className="block truncate text-sm font-semibold"
              >
                {user.username}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {user.followerCount.toLocaleString()} followers
              </p>
            </div>
            <button className="text-xs font-semibold text-blue-500">
              Follow
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
