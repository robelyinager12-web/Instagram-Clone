"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/account", label: "Edit profile" },
  { href: "/settings/privacy", label: "Privacy" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/appearance", label: "Appearance" },
  { href: "/settings/security", label: "Security" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full shrink-0 border-b border-border md:w-56 md:border-b-0 md:border-r">
      <ul className="flex overflow-x-auto md:block md:overflow-visible">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <li key={tab.href} className="shrink-0 md:shrink">
              <Link
                href={tab.href}
                className={cn(
                  "block whitespace-nowrap px-4 py-3 text-sm transition-colors hover:bg-muted md:rounded-lg md:mx-2",
                  isActive ? "font-semibold border-b-2 border-foreground md:border-b-0 md:bg-muted" : "text-muted-foreground"
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
