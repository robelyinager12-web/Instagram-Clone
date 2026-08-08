"use client";

import Image from "next/image";
import Link from "next/link";
import { Hash, MapPin } from "lucide-react";
import type { SearchResults as SearchResultsType } from "@/types/search";

export function SearchResults({
  results,
  isLoading,
  query,
}: {
  results: SearchResultsType | undefined;
  isLoading: boolean;
  query: string;
}) {
  if (query.trim().length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        Search for people, hashtags, or places.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3 px-4 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-11 w-11 rounded-full bg-muted" />
            <div className="h-3 w-32 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  const hasNoResults =
    results &&
    results.users.length === 0 &&
    results.hashtags.length === 0 &&
    results.locations.length === 0;

  if (hasNoResults) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        No results for &ldquo;{query}&rdquo;.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {results && results.users.length > 0 && (
        <section className="py-2">
          {results.users.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 px-4 py-2 hover:bg-muted"
            >
              <div className="h-11 w-11 overflow-hidden rounded-full bg-muted">
                {user.avatarUrl && (
                  <Image
                    src={user.avatarUrl}
                    alt={user.username}
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate text-sm font-semibold">
                  {user.username}
                  {user.isVerified && <span className="text-blue-500">✓</span>}
                </p>
                {user.fullName && (
                  <p className="truncate text-xs text-muted-foreground">{user.fullName}</p>
                )}
              </div>
            </Link>
          ))}
        </section>
      )}

      {results && results.hashtags.length > 0 && (
        <section className="py-2">
          {results.hashtags.map((h) => (
            <Link
              key={h.id}
              href={`/explore/tags/${h.tag}`}
              className="flex items-center gap-3 px-4 py-2 hover:bg-muted"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                <Hash className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">#{h.tag}</p>
                <p className="text-xs text-muted-foreground">
                  {h.postCount.toLocaleString()} posts
                </p>
              </div>
            </Link>
          ))}
        </section>
      )}

      {results && results.locations.length > 0 && (
        <section className="py-2">
          {results.locations.map((loc) => (
            <Link
              key={loc.location}
              href={`/explore/locations/${encodeURIComponent(loc.location)}`}
              className="flex items-center gap-3 px-4 py-2 hover:bg-muted"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{loc.location}</p>
                <p className="text-xs text-muted-foreground">
                  {loc.postCount.toLocaleString()} posts
                </p>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
