"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Home,
  Search,
  Compass,
  Film,
  MessageCircle,
  Heart,
  PlusSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreatePostStore } from "@/store/create-post-store";

const links = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/reels", label: "Reels", icon: Film },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/notifications", label: "Notifications", icon: Heart },
];

export function Sidebar() {
  const pathname = usePathname();
  const openCreatePost = useCreatePostStore((s) => s.open);

  return (
    <nav className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-border px-3 py-6 lg:w-72 md:flex">
      <div>
        <Link href="/feed" className="mb-6 block px-3 py-2 text-2xl font-semibold tracking-tight">
          Instagram Clone
        </Link>
        <ul className="space-y-0.5">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-4 rounded-xl px-3 py-3 text-[15px] transition-colors hover:bg-muted",
                    isActive ? "font-semibold" : "font-normal"
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={isActive ? 2.25 : 1.75} />
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={openCreatePost}
              className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-[15px] transition-colors hover:bg-muted"
            >
              <PlusSquare className="h-6 w-6" strokeWidth={1.75} />
              Create
            </button>
          </li>
        </ul>
      </div>

      <div className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-sm font-medium text-muted-foreground">Account</span>
      </div>
    </nav>
  );
}
