"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Film, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/create", icon: PlusSquare, label: "Create" },
  { href: "/reels", icon: Film, label: "Reels" },
  { href: "/profile/me", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-border bg-background md:hidden">
      {links.map(({ href, icon: Icon, label }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={cn(
              "flex h-full flex-1 items-center justify-center",
              isActive && "text-foreground",
              !isActive && "text-muted-foreground"
            )}
          >
            <Icon className="h-6 w-6" />
          </Link>
        );
      })}
    </nav>
  );
}
