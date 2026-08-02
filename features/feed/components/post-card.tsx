"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleLike } from "@/actions/likes/toggle-like";
import type { FeedPost } from "@/types/feed";

const DOUBLE_TAP_WINDOW_MS = 300;

export function PostCard({ post }: { post: FeedPost }) {
  const [isLiked, setIsLiked] = useState(post.isLikedByViewer);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showBurst, setShowBurst] = useState(false);
  const lastTapRef = useRef(0);

  async function commitLike(nextLiked: boolean) {
    // Optimistic UI: flip state immediately, reconcile with the server
    // in the background, roll back only if the action actually fails.
    setIsLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));
    try {
      const result = await toggleLike(post.id);
      setIsLiked(result.liked);
    } catch {
      setIsLiked(!nextLiked);
      setLikeCount((c) => c + (nextLiked ? -1 : 1));
    }
  }

  function handleLikeButtonClick() {
    commitLike(!isLiked);
  }

  function handleImageTap() {
    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < DOUBLE_TAP_WINDOW_MS;
    lastTapRef.current = now;

    if (isDoubleTap) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 700);
      if (!isLiked) commitLike(true);
    }
  }

  const primaryMedia = post.media[0];

  return (
    <article className="border-b border-border pb-4 sm:mb-6 sm:rounded-lg sm:border sm:pb-0">
      <header className="flex items-center gap-3 px-3 py-3">
        <Link href={`/profile/${post.author.username}`} className="shrink-0">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
            {post.author.avatarUrl && (
              <Image
                src={post.author.avatarUrl}
                alt={post.author.username}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link href={`/profile/${post.author.username}`} className="font-semibold">
            {post.author.username}
          </Link>
          {post.author.isVerified && (
            <span className="text-blue-500" aria-label="Verified">
              ✓
            </span>
          )}
          {post.location && (
            <span className="text-muted-foreground"> · {post.location}</span>
          )}
        </div>
      </header>

      {primaryMedia && (
        <div
          className="relative aspect-square w-full select-none bg-muted"
          onClick={handleImageTap}
        >
          <Image
            src={primaryMedia.url}
            alt={post.caption ?? "Post image"}
            fill
            sizes="(max-width: 640px) 100vw, 470px"
            className="object-cover"
            priority={false}
          />
          <AnimatePresence>
            {showBurst && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <Heart className="h-24 w-24 fill-white text-white drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex items-center justify-between px-3 pt-2">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLikeButtonClick}
            aria-label={isLiked ? "Unlike" : "Like"}
            className="transition-transform active:scale-90"
          >
            <motion.span
              key={isLiked ? "liked" : "unliked"}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="block"
            >
              <Heart
                className={cn(
                  "h-6 w-6",
                  isLiked ? "fill-red-500 text-red-500" : "text-foreground"
                )}
              />
            </motion.span>
          </button>
          <Link href={`/post/${post.id}`} aria-label="Comment">
            <MessageCircle className="h-6 w-6" />
          </Link>
          <button aria-label="Share">
            <Send className="h-6 w-6" />
          </button>
        </div>
        <button aria-label="Save">
          <Bookmark
            className={cn(
              "h-6 w-6",
              post.isBookmarkedByViewer && "fill-foreground"
            )}
          />
        </button>
      </div>

      <div className="px-3 pt-2">
        <p className="text-sm font-semibold">
          {likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"}
        </p>
        {post.caption && (
          <p className="mt-1 text-sm">
            <Link href={`/profile/${post.author.username}`} className="font-semibold">
              {post.author.username}
            </Link>{" "}
            {post.caption}
          </p>
        )}
        {post.commentCount > 0 && (
          <Link
            href={`/post/${post.id}`}
            className="mt-1 block text-sm text-muted-foreground"
          >
            View all {post.commentCount} comments
          </Link>
        )}
      </div>
    </article>
  );
}
