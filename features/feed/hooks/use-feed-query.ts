import { useInfiniteQuery } from "@tanstack/react-query";
import type { FeedPage } from "@/types/feed";

async function fetchFeedPage(cursor?: string): Promise<FeedPage> {
  const url = cursor ? `/api/posts?cursor=${cursor}` : "/api/posts";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load feed");
  return res.json();
}

export function useFeedQuery(initialPage: FeedPage) {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: {
      pages: [initialPage],
      pageParams: [undefined],
    },
  });
}
