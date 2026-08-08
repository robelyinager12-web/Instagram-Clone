import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { SearchResults } from "@/types/search";

async function fetchSearch(query: string): Promise<SearchResults> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function useSearchQuery(rawQuery: string) {
  const query = useDebouncedValue(rawQuery.trim(), 300);

  return useQuery({
    queryKey: ["search", query],
    queryFn: () => fetchSearch(query),
    enabled: query.length > 0,
  });
}
