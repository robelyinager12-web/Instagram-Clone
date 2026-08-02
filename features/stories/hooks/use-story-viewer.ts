import { useCallback, useEffect, useRef, useState } from "react";
import type { StoryGroup } from "@/types/story";
import { markStoryViewed } from "@/actions/stories/mark-story-viewed";

const STORY_DURATION_MS = 5000;

export function useStoryViewer(
  groups: StoryGroup[],
  initialGroupIndex: number,
  onClose: () => void
) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const rafRef = useRef<number>();
  const startRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];

  const goToNextStory = useCallback(() => {
    if (!currentGroup) return;
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }, [currentGroup, storyIndex, groupIndex, groups.length, onClose]);

  const goToPrevStory = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((i) => i - 1);
      setStoryIndex(prevGroup.stories.length - 1);
    }
  }, [storyIndex, groupIndex, groups]);

  useEffect(() => {
    if (currentStory && !currentStory.isSeenByViewer) {
      markStoryViewed(currentStory.id).catch(() => {
        // Non-critical — a failed view-tracking call shouldn't block playback.
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStory?.id]);

  useEffect(() => {
    setProgress(0);
    elapsedBeforePauseRef.current = 0;
    if (!currentStory) return;

    function tick(now: number) {
      if (!startRef.current) startRef.current = now;
      const elapsed = elapsedBeforePauseRef.current + (now - startRef.current);
      const pct = Math.min(elapsed / STORY_DURATION_MS, 1);
      setProgress(pct);

      if (pct >= 1) {
        goToNextStory();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    if (!isPaused) {
      startRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStory?.id, isPaused]);

  function pause() {
    setIsPaused(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  function resume() {
    setIsPaused(false);
  }

  return {
    currentGroup,
    currentStory,
    groupIndex,
    storyIndex,
    progress,
    goToNextStory,
    goToPrevStory,
    pause,
    resume,
  };
}
