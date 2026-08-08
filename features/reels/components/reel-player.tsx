"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Send, Bookmark, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoplayInView } from "../hooks/use-autoplay-in-view";
import { toggleReelLike } from "@/actions/reels/toggle-reel-like";
import { followCreator } from "@/actions/follow/follow-creator";
import type { ReelItem } from "@/types/reel";

export function ReelPlayer({ reel }: { reel: ReelItem }) {
  const { containerRef, videoRef } = useAutoplayInView();
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(reel.isLikedByViewer);
  const [likeCount, setLikeCount] = useState(reel.likeCount);
  const [isFollowing, setIsFollowing] = useState(reel.isFollowingAuthor);

  async function handleLike() {
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      const result = await toggleReelLike(reel.id);
      setIsLiked(result.liked);
    } catch {
      setIsLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  }

  async function handleFollow() {
    setIsFollowing(true);
    try {
      const result = await followCreator(reel.author.id);
      setIsFollowing(result.following);
    } catch {
      setIsFollowing(false);
    }
  }

  function toggleMute() {
    setIsMuted((m) => !m);
    if (videoRef.current) videoRef.current.muted = !isMuted;
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-[calc(100vh-3.5rem)] w-full snap-start items-center justify-center bg-black md:h-screen"
    >
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl ?? undefined}
        loop
        muted={isMuted}
        playsInline
        onClick={toggleMute}
        className="h-full w-full max-w-md object-contain"
      />

      <button
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <div className="absolute bottom-4 left-3 right-16 text-white">
        <div className="mb-2 flex items-center gap-2">
          <Link href={`/profile/${reel.author.username}`} className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
              {reel.author.avatarUrl && (
                <Image
                  src={reel.author.avatarUrl}
                  alt={reel.author.username}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <span className="text-sm font-semibold">{reel.author.username}</span>
          </Link>
          {!isFollowing && (
            <button
              onClick={handleFollow}
              className="rounded-md border border-white px-2 py-0.5 text-xs font-semibold"
            >
              Follow
            </button>
          )}
        </div>
        {reel.caption && <p className="text-sm">{reel.caption}</p>}
        {reel.audioName && (
          <p className="mt-1 truncate text-xs text-white/80">♫ {reel.audioName}</p>
        )}
      </div>

      <div className="absolute bottom-4 right-3 flex flex-col items-center gap-4 text-white">
        <button onClick={handleLike} aria-label={isLiked ? "Unlike" : "Like"} className="flex flex-col items-center gap-1">
          <Heart className={cn("h-7 w-7", isLiked ? "fill-red-500 text-red-500" : "text-white")} />
          <span className="text-xs">{likeCount.toLocaleString()}</span>
        </button>
        <Link href={`/reels/${reel.id}`} className="flex flex-col items-center gap-1" aria-label="Comments">
          <MessageCircle className="h-7 w-7" />
          <span className="text-xs">{reel.commentCount.toLocaleString()}</span>
        </Link>
        <button aria-label="Share" className="flex flex-col items-center gap-1">
          <Send className="h-7 w-7" />
        </button>
        <button aria-label="Save" className="flex flex-col items-center gap-1">
          <Bookmark className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}
