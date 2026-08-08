"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { followCreator } from "@/actions/follow/follow-creator";
import type { FollowListEntry } from "@/lib/profile/get-follow-list";

export function FollowListRow({ user }: { user: FollowListEntry }) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowedByViewer);

  async function handleToggle() {
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      const result = await followCreator(user.id);
      setIsFollowing(result.following);
    } catch {
      setIsFollowing(!next);
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Link href={`/profile/${user.username}`} className="flex flex-1 items-center gap-3 min-w-0">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted">
          {user.avatarUrl && (
            <Image src={user.avatarUrl} alt={user.username} width={44} height={44} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-sm font-semibold">
            {user.username}
            {user.isVerified && <span className="text-blue-500">✓</span>}
          </p>
          {user.fullName && <p className="truncate text-xs text-muted-foreground">{user.fullName}</p>}
        </div>
      </Link>
      <button
        onClick={handleToggle}
        className={
          isFollowing
            ? "shrink-0 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold"
            : "shrink-0 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white"
        }
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}
