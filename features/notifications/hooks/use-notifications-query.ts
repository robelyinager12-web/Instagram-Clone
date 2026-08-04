import { useInfiniteQuery } from "@tanstack/react-query";
import type { NotificationsPage } from "@/types/notification";

async function fetchNotificationsPage(cursor?: string): Promise<NotificationsPage> {
  const url = cursor ? `/api/notifications?cursor=${cursor}` : "/api/notifications";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load notifications");
  return res.json();
}

export function useNotificationsQuery(initialPage: NotificationsPage) {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) => fetchNotificationsPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: {
      pages: [initialPage],
      pageParams: [undefined],
    },
    refetchInterval: 30 * 1000,
  });
}
