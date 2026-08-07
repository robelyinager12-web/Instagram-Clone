import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

type TagCandidate = { id: string; username: string; avatarUrl: string | null };

async function searchUsers(query: string): Promise<TagCandidate[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.users ?? [];
}

export function useTagPeopleSearch(rawQuery: string) {
  const query = useDebouncedValue(rawQuery.trim(), 300);
  return useQuery({
    queryKey: ["tag-people-search", query],
    queryFn: () => searchUsers(query),
    enabled: query.length > 0,
  });
}
