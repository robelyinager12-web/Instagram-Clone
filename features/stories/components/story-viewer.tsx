"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useStoryViewer } from "../hooks/use-story-viewer";
import type { StoryGroup } from "@/types/story";

export function StoryViewer({
  groups,
  initialGroupIndex,
  onClose,
}: {
  groups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}) {
  const {
    currentGroup,
    currentStory,
    storyIndex,
    progress,
    goToNextStory,
    goToPrevStory,
    pause,
    resume,
  } = useStoryViewer(groups, initialGroupIndex, onClose);

  if (!currentGroup || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative h-full w-full max-w-md">
        <div className="absolute inset-x-2 top-2 z-10 flex gap-1">
          {currentGroup.stories.map((story, i) => (
            <div
              key={story.id}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full bg-white transition-[width] duration-100 ease-linear"
                style={{
                  width:
                    i < storyIndex ? "100%" : i === storyIndex ? `${progress * 100}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-x-2 top-6 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
              {currentGroup.author.avatarUrl && (
                <Image
                  src={currentGroup.author.avatarUrl}
                  alt={currentGroup.author.username}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <span className="text-sm font-semibold text-white">
              {currentGroup.author.username}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="relative h-full w-full">
          {currentStory.mediaType === "IMAGE" ? (
            <Image
              src={currentStory.mediaUrl}
              alt={currentGroup.author.username}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              className="h-full w-full object-contain"
            />
          )}

          {currentStory.caption && (
            <p className="absolute bottom-6 left-0 right-0 px-4 text-center text-sm text-white">
              {currentStory.caption}
            </p>
          )}

          <button
            aria-label="Previous story"
            onClick={goToPrevStory}
            onPointerDown={pause}
            onPointerUp={resume}
            className="absolute inset-y-0 left-0 w-1/3"
          />
          <button
            aria-label="Next story"
            onClick={goToNextStory}
            onPointerDown={pause}
            onPointerUp={resume}
            className="absolute inset-y-0 right-0 w-2/3"
          />
        </div>
      </div>
    </div>
  );
}
