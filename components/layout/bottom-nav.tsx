"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Film, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreatePostStore } from "@/store/create-post-store";

export function BottomNav() {
  const pathname = usePathname();
  const openCreatePost = useCreatePostStore((s) => s.open);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-border bg-background md:hidden">
      <Link
        href="/feed"
        aria-label="Home"
        className={cn(
          "flex h-full flex-1 items-center justify-center",
          pathname.startsWith("/feed") ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <Home className="h-6 w-6" />
      </Link>
      <Link
        href="/search"
        aria-label="Search"
        className={cn(
          "flex h-full flex-1 items-center justify-center",
          pathname.startsWith("/search") ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <Search className="h-6 w-6" />
      </Link>
      <button
        onClick={openCreatePost}
        aria-label="Create"
        className="flex h-full flex-1 items-center justify-center text-muted-foreground"
      >
        <PlusSquare className="h-6 w-6" />
      </button>
      <Link
        href="/reels"
        aria-label="Reels"
        className={cn(
          "flex h-full flex-1 items-center justify-center",
          pathname.startsWith("/reels") ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <Film className="h-6 w-6" />
      </Link>
      <Link
        href="/profile/me"
        aria-label="Profile"
        className={cn(
          "flex h-full flex-1 items-center justify-center",
          pathname.startsWith("/profile") ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <User className="h-6 w-6" />
      </Link>
    </nav>
  );
}
