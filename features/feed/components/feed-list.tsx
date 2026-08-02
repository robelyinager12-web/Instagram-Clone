"use client";

import { useEffect, useRef } from "react";
import { useFeedQuery } from "../hooks/use-feed-query";
import { PostCard } from "./post-card";
import { PostCardSkeleton } from "@/components/skeletons/post-card-skeleton";
import type { FeedPage } from "@/types/feed";

export function FeedList({ initialPage }: { initialPage: FeedPage }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeedQuery(initialPage);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (posts.length === 0) {
    return (
      <div className="px-4 py-16 text-center text-sm text-muted-foreground">
        Follow some people to start seeing posts here.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[470px]">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      <div ref={sentinelRef} />

      {isFetchingNextPage && (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      )}

      {!hasNextPage && (
        <p className="py-8 text-center text-xs text-muted-foreground">
          You're all caught up.
        </p>
      )}
    </div>
  );
}
