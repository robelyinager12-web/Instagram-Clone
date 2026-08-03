import { useInfiniteQuery } from "@tanstack/react-query";
import type { CommentsPage } from "@/types/comment";

async function fetchCommentsPage(postId: string, cursor?: string): Promise<CommentsPage> {
  const url = cursor
    ? `/api/comments?postId=${postId}&cursor=${cursor}`
    : `/api/comments?postId=${postId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load comments");
  return res.json();
}

export function useCommentsQuery(postId: string, initialPage: CommentsPage) {
  return useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) => fetchCommentsPage(postId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: {
      pages: [initialPage],
      pageParams: [undefined],
    },
  });
}
