"use client";

import { useState } from "react";
import { Smile } from "lucide-react";

const QUICK_EMOJIS = [
  "❤️", "🙌", "🔥", "👏", "😍", "😂", "😮", "😢", "🎉", "🤔", "👍", "💯",
];

export function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Add emoji"
        className="text-muted-foreground"
      >
        <Smile className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-8 right-0 z-20 grid grid-cols-6 gap-1 rounded-lg border border-border bg-background p-2 shadow-lg">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onSelect(emoji);
                  setIsOpen(false);
                }}
                className="rounded p-1 text-lg hover:bg-muted"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
