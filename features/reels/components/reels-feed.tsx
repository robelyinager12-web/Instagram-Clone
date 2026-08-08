"use client";

import { useEffect, useRef } from "react";
import { useReelsQuery } from "../hooks/use-reels-query";
import { ReelPlayer } from "./reel-player";
import type { ReelsPage } from "@/types/reel";

export function ReelsFeed({ initialPage }: { initialPage: ReelsPage }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useReelsQuery(initialPage);

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
      { rootMargin: "200% 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const reels = data?.pages.flatMap((page) => page.reels) ?? [];

  if (reels.length === 0) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-sm text-muted-foreground md:h-screen">
        No reels yet.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] snap-y snap-mandatory overflow-y-scroll md:h-screen">
      {reels.map((reel) => (
        <ReelPlayer key={reel.id} reel={reel} />
      ))}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
