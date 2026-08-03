"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleCommentLike } from "@/actions/comments/toggle-comment-like";
import { deleteComment } from "@/actions/comments/delete-comment";
import { editComment } from "@/actions/comments/edit-comment";
import { CommentComposer } from "./comment-composer";
import type { CommentItem, ReplyItem } from "@/types/comment";

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60, "s"], [60, "m"], [24, "h"], [7, "d"], [4.345, "w"], [12, "mo"], [Infinity, "y"],
  ];
  let value = seconds;
  for (const [amount, label] of units) {
    if (value < amount) return `${Math.floor(value)}${label}`;
    value /= amount;
  }
  return "";
}

function CommentRow({
  comment,
  onDeleted,
  onReplyClick,
}: {
  comment: ReplyItem;
  onDeleted: (id: string) => void;
  onReplyClick?: () => void;
}) {
  const [isLiked, setIsLiked] = useState(comment.isLikedByViewer);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [isEdited, setIsEdited] = useState(comment.isEdited);

  async function handleLike() {
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      const result = await toggleCommentLike(comment.id);
      setIsLiked(result.liked);
    } catch {
      setIsLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  }

  async function handleDelete() {
    try {
      await deleteComment(comment.id);
      onDeleted(comment.id);
    } catch {
      // Leave the comment in place if deletion failed server-side.
    }
  }

  async function handleEditSubmit(newContent: string) {
    await editComment({ commentId: comment.id, content: newContent });
    setContent(newContent);
    setIsEdited(true);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="px-3 py-2">
        <CommentComposer
          initialValue={content}
          submitLabel="Save"
          autoFocus
          onCancel={() => setIsEditing(false)}
          onSubmit={handleEditSubmit}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-3 px-3 py-2">
      <Link href={`/profile/${comment.author.username}`} className="shrink-0">
        <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
          {comment.author.avatarUrl && (
            <Image
              src={comment.author.avatarUrl}
              alt={comment.author.username}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <Link href={`/profile/${comment.author.username}`} className="font-semibold">
            {comment.author.username}
          </Link>{" "}
          {content}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{timeAgo(comment.createdAt)}</span>
          {isEdited && <span>Edited</span>}
          {likeCount > 0 && <span>{likeCount} likes</span>}
          {onReplyClick && (
            <button onClick={onReplyClick} className="font-semibold">
              Reply
            </button>
          )}
          {comment.isOwnComment && (
            <>
              <button onClick={() => setIsEditing(true)} className="font-semibold">
                Edit
              </button>
              <button onClick={handleDelete} className="font-semibold">
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <button
        onClick={handleLike}
        aria-label={isLiked ? "Unlike" : "Like"}
        className="shrink-0 pt-1"
      >
        <Heart className={cn("h-3.5 w-3.5", isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
      </button>
    </div>
  );
}

export function CommentThread({
  comment,
  postId,
  onDeleted,
}: {
  comment: CommentItem;
  postId: string;
  onDeleted: (id: string) => void;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replies, setReplies] = useState(comment.replies);
  const [replyCount, setReplyCount] = useState(comment.replyCount);

  async function handleReplySubmit(content: string) {
    const { createComment } = await import("@/actions/comments/create-comment");
    const newReply = await createComment({ postId, content, parentId: comment.id });
    setReplies((r) => [...r, newReply]);
    setReplyCount((c) => c + 1);
    setIsReplying(false);
  }

  function handleReplyDeleted(replyId: string) {
    setReplies((r) => r.filter((reply) => reply.id !== replyId));
    setReplyCount((c) => c - 1);
  }

  const hiddenReplyCount = replyCount - replies.length;

  return (
    <div>
      <CommentRow
        comment={comment}
        onDeleted={onDeleted}
        onReplyClick={() => setIsReplying((v) => !v)}
      />

      {replies.length > 0 && (
        <div className="ml-11 border-l border-border pl-3">
          {replies.map((reply) => (
            <CommentRow key={reply.id} comment={reply} onDeleted={handleReplyDeleted} />
          ))}
          {hiddenReplyCount > 0 && (
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground">
              View {hiddenReplyCount} more {hiddenReplyCount === 1 ? "reply" : "replies"}
            </p>
          )}
        </div>
      )}

      {isReplying && (
        <div className="ml-11 pl-3">
          <CommentComposer
            placeholder={`Reply to ${comment.author.username}…`}
            autoFocus
            submitLabel="Reply"
            onCancel={() => setIsReplying(false)}
            onSubmit={handleReplySubmit}
          />
        </div>
      )}
    </div>
  );
}
