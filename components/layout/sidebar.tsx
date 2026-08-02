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

  return (
    <nav className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-border px-3 py-6 md:flex">
      <div>
        <Link href="/feed" className="mb-8 block px-3 text-xl font-bold">
          Instagram Clone
        </Link>
        <ul className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-4 rounded-lg px-3 py-3 text-base transition-colors hover:bg-muted",
                    isActive && "font-semibold"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <button className="flex w-full items-center gap-4 rounded-lg px-3 py-3 text-base transition-colors hover:bg-muted">
              <PlusSquare className="h-6 w-6" />
              Create
            </button>
          </li>
        </ul>
      </div>

      <div className="flex items-center gap-3 px-3">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-sm text-muted-foreground">Account</span>
      </div>
    </nav>
  );
}
