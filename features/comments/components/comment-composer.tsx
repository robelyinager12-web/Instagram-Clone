"use client";

import { useState } from "react";
import { EmojiPicker } from "./emoji-picker";

export function CommentComposer({
  onSubmit,
  placeholder = "Add a comment…",
  autoFocus = false,
  initialValue = "",
  submitLabel = "Post",
  onCancel,
}: {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  initialValue?: string;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border px-3 py-2">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent text-sm outline-none"
      />
      <EmojiPicker onSelect={(emoji) => setContent((c) => c + emoji)} />
      {onCancel && (
        <button type="button" onClick={onCancel} className="text-xs text-muted-foreground">
          Cancel
        </button>
      )}
      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="text-sm font-semibold text-blue-500 disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </form>
  );
}
