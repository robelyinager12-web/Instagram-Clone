"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Send } from "lucide-react";
import { uploadFileToCloudinary } from "@/lib/upload/upload-file";

export function MessageComposer({
  onSendText,
  onSendMedia,
  onTyping,
}: {
  onSendText: (content: string) => void;
  onSendMedia: (url: string, type: "IMAGE" | "VIDEO") => void;
  onTyping: () => void;
}) {
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setContent("");
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadFileToCloudinary(file, "messages");
      onSendMedia(uploaded.url, uploaded.resourceType === "video" ? "VIDEO" : "IMAGE");
    } catch (err) {
      console.error("Message media upload failed", err);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border px-3 py-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        aria-label="Attach image or video"
        className="text-muted-foreground"
      >
        <ImageIcon className="h-5 w-5" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      <input
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onTyping();
        }}
        placeholder={isUploading ? "Uploading…" : "Message…"}
        disabled={isUploading}
        className="flex-1 rounded-full bg-muted px-4 py-2 text-sm outline-none"
      />

      <button
        type="submit"
        disabled={!content.trim()}
        aria-label="Send"
        className="text-blue-500 disabled:opacity-40"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
}
