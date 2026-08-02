import { useQuery } from "@tanstack/react-query";
import type { StoryGroup } from "@/types/story";

async function fetchStoryGroups(): Promise<{ groups: StoryGroup[] }> {
  const res = await fetch("/api/stories");
  if (!res.ok) throw new Error("Failed to load stories");
  return res.json();
}

export function useStoryGroups() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: fetchStoryGroups,
    staleTime: 60 * 1000,
  });
}
