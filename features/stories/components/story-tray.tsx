"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useStoryGroups } from "../hooks/use-story-groups";
import { StoryRing } from "./story-ring";
import { StoryViewer } from "./story-viewer";
import { createStory } from "@/actions/stories/create-story";
import { uploadFileToCloudinary } from "@/lib/upload/upload-file";
import type { StoryGroup } from "@/types/story";

export function StoryTray({ viewerId }: { viewerId: string }) {
  const { data, isLoading, refetch } = useStoryGroups();
  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const groups: StoryGroup[] = data?.groups ?? [];
  const viewerGroup = groups.find((g) => g.author.id === viewerId);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadFileToCloudinary(file, "stories");
      await createStory({
        mediaUrl: uploaded.url,
        mediaType: uploaded.resourceType === "video" ? "VIDEO" : "IMAGE",
      });
      await refetch();
    } catch (err) {
      console.error("Story upload failed", err);
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto px-4 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto px-4 py-4">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <button
            onClick={() =>
              viewerGroup
                ? setOpenGroupIndex(groups.indexOf(viewerGroup))
                : fileInputRef.current?.click()
            }
            className="relative"
            disabled={isUploading}
          >
            <StoryRing
              avatarUrl={viewerGroup?.author.avatarUrl ?? null}
              username="Your story"
              hasUnseen={false}
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 ring-2 ring-background">
              <Plus className="h-3 w-3 text-white" />
            </span>
          </button>
          <span className="max-w-[64px] truncate text-xs">
            {isUploading ? "Uploading…" : "Your story"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelected}
          />
        </div>

        {groups
          .filter((g) => g.author.id !== viewerId)
          .map((group) => (
            <button
              key={group.author.id}
              onClick={() => setOpenGroupIndex(groups.indexOf(group))}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <StoryRing
                avatarUrl={group.author.avatarUrl}
                username={group.author.username}
                hasUnseen={group.hasUnseen}
              />
              <span className="max-w-[64px] truncate text-xs">
                {group.author.username}
              </span>
            </button>
          ))}
      </div>

      {openGroupIndex !== null && (
        <StoryViewer
          groups={groups}
          initialGroupIndex={openGroupIndex}
          onClose={() => setOpenGroupIndex(null)}
        />
      )}
    </>
  );
}
