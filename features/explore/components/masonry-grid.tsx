"use client";

import { useEffect, useRef } from "react";
import { useExploreQuery } from "../hooks/use-explore-query";
import { ExplorePostTile } from "./explore-post-tile";
import type { ExplorePage } from "@/types/explore";

export function MasonryGrid({ initialPage }: { initialPage: ExplorePage }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useExploreQuery(initialPage);

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
      { rootMargin: "800px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const tiles = data?.pages.flatMap((page) => page.tiles) ?? [];

  if (tiles.length === 0) {
    return (
      <div className="px-4 py-16 text-center text-sm text-muted-foreground">
        Nothing trending right now — check back soon.
      </div>
    );
  }

  return (
    <div className="px-1 pt-1 sm:px-1.5">
      <div className="columns-3 gap-1 sm:gap-1.5 md:columns-4">
        {tiles.map((tile) => (
          <ExplorePostTile key={tile.id} tile={tile} />
        ))}
      </div>

      <div ref={sentinelRef} />

      {isFetchingNextPage && (
        <p className="py-6 text-center text-xs text-muted-foreground">Loading more…</p>
      )}
    </div>
  );
}
