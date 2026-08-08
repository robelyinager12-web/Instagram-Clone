import { useInfiniteQuery } from "@tanstack/react-query";
import type { ExplorePage } from "@/types/explore";

async function fetchExplorePage(cursor?: string): Promise<ExplorePage> {
  const url = cursor ? `/api/explore?cursor=${cursor}` : "/api/explore";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load explore");
  return res.json();
}

export function useExploreQuery(initialPage: ExplorePage) {
  return useInfiniteQuery({
    queryKey: ["explore"],
    queryFn: ({ pageParam }) => fetchExplorePage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: {
      pages: [initialPage],
      pageParams: [undefined],
    },
  });
}
