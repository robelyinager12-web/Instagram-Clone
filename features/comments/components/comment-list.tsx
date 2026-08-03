"use client";

import { useState } from "react";
import { useCommentsQuery } from "../hooks/use-comments-query";
import { CommentThread } from "./comment-thread";
import { CommentComposer } from "./comment-composer";
import { createComment } from "@/actions/comments/create-comment";
import type { CommentItem, CommentsPage } from "@/types/comment";

export function CommentList({
  postId,
  initialPage,
}: {
  postId: string;
  initialPage: CommentsPage;
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCommentsQuery(postId, initialPage);

  const [localComments, setLocalComments] = useState<CommentItem[]>([]);

  const fetchedComments = data?.pages.flatMap((page) => page.comments) ?? [];
  const allComments = [...fetchedComments, ...localComments];

  async function handleSubmit(content: string) {
    const newComment = await createComment({ postId, content });
    setLocalComments((c) => [...c, newComment]);
  }

  function handleDeleted(commentId: string) {
    setLocalComments((c) => c.filter((comment) => comment.id !== commentId));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {allComments.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to comment.
          </p>
        )}

        {allComments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            postId={postId}
            onDeleted={handleDeleted}
          />
        ))}

        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-3 text-center text-xs font-semibold text-muted-foreground"
          >
            {isFetchingNextPage ? "Loading…" : "Load more comments"}
          </button>
        )}
      </div>

      <CommentComposer onSubmit={handleSubmit} />
    </div>
  );
}
