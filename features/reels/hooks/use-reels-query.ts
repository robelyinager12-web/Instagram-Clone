import { useInfiniteQuery } from "@tanstack/react-query";
import type { ReelsPage } from "@/types/reel";

async function fetchReelsPage(cursor?: string): Promise<ReelsPage> {
  const url = cursor ? `/api/reels?cursor=${cursor}` : "/api/reels";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load reels");
  return res.json();
}

export function useReelsQuery(initialPage: ReelsPage) {
  return useInfiniteQuery({
    queryKey: ["reels"],
    queryFn: ({ pageParam }) => fetchReelsPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: {
      pages: [initialPage],
      pageParams: [undefined],
    },
  });
}
