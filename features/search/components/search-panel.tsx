"use client";

import { useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { useSearchQuery } from "../hooks/use-search-query";
import { SearchResults } from "./search-results";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const { data, isFetching } = useSearchQuery(query);

  return (
    <div className="mx-auto max-w-lg">
      <div className="sticky top-0 z-10 bg-background px-4 pb-3 pt-4">
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-sm outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <SearchResults results={data} isLoading={isFetching} query={query} />
    </div>
  );
}
