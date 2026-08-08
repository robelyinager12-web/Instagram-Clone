"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { followCreator } from "@/actions/follow/follow-creator";
import { openDirectChat } from "@/actions/messages/open-direct-chat";
import type { ProfileData } from "@/types/profile";

export function ProfileHeader({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [followStatus, setFollowStatus] = useState(profile.followStatus);
  const [followerCount, setFollowerCount] = useState(profile.followerCount);
  const [isMessaging, setIsMessaging] = useState(false);

  async function handleFollowToggle() {
    const wasFollowing = followStatus === "ACCEPTED";
    const wasPending = followStatus === "PENDING";

    if (wasFollowing || wasPending) {
      setFollowStatus("NONE");
      if (wasFollowing) setFollowerCount((c) => c - 1);
    } else {
      setFollowStatus(profile.isPrivate ? "PENDING" : "ACCEPTED");
      if (!profile.isPrivate) setFollowerCount((c) => c + 1);
    }

    try {
      const result = await followCreator(profile.id);
      setFollowStatus(result.following ? "ACCEPTED" : profile.isPrivate && !wasFollowing && !wasPending ? "PENDING" : "NONE");
    } catch {
      setFollowStatus(profile.followStatus);
      setFollowerCount(profile.followerCount);
    }
  }

  async function handleMessage() {
    setIsMessaging(true);
    try {
      const { chatId } = await openDirectChat(profile.id);
      router.push(`/messages/${chatId}`);
    } finally {
      setIsMessaging(false);
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-6 sm:gap-10">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-muted sm:h-32 sm:w-32">
          {profile.avatarUrl && (
            <Image
              src={profile.avatarUrl}
              alt={profile.username}
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="flex items-center gap-1 text-lg font-semibold">
              {profile.username}
              {profile.isVerified && <span className="text-blue-500">✓</span>}
            </h1>

            {profile.isOwnProfile ? (
              <Link
                href="/settings/account"
                className="rounded-lg bg-muted px-4 py-1.5 text-sm font-semibold"
              >
                Edit profile
              </Link>
            ) : (
              <>
                <button
                  onClick={handleFollowToggle}
                  className={
                    followStatus === "NONE"
                      ? "rounded-lg bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white"
                      : "rounded-lg bg-muted px-4 py-1.5 text-sm font-semibold"
                  }
                >
                  {followStatus === "ACCEPTED" ? "Following" : followStatus === "PENDING" ? "Requested" : "Follow"}
                </button>
                <button
                  onClick={handleMessage}
                  disabled={isMessaging}
                  className="rounded-lg bg-muted px-4 py-1.5 text-sm font-semibold disabled:opacity-50"
                >
                  Message
                </button>
              </>
            )}
          </div>

          <div className="mt-4 hidden gap-8 text-sm sm:flex">
            <span><strong>{profile.postCount.toLocaleString()}</strong> posts</span>
            <Link href={`/profile/${profile.username}/followers`}>
              <strong>{followerCount.toLocaleString()}</strong> followers
            </Link>
            <Link href={`/profile/${profile.username}/following`}>
              <strong>{profile.followingCount.toLocaleString()}</strong> following
            </Link>
          </div>
        </div>
      </div>

      {(profile.fullName || profile.bio || profile.website) && (
        <div className="mt-4 space-y-0.5 text-sm">
          {profile.fullName && <p className="font-semibold">{profile.fullName}</p>}
          {profile.bio && <p className="whitespace-pre-wrap">{profile.bio}</p>}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-500">
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      )}

      <div className="mt-4 flex justify-around border-y border-border py-3 text-sm sm:hidden">
        <span><strong className="block">{profile.postCount.toLocaleString()}</strong>posts</span>
        <Link href={`/profile/${profile.username}/followers`} className="text-center">
          <strong className="block">{followerCount.toLocaleString()}</strong>followers
        </Link>
        <Link href={`/profile/${profile.username}/following`} className="text-center">
          <strong className="block">{profile.followingCount.toLocaleString()}</strong>following
        </Link>
      </div>
    </div>
  );
}
