"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore } from "@/store/theme-store";

const OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System default", icon: Monitor },
];

export function ThemeSwitcher() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="space-y-2">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
            theme === value ? "border-foreground" : "border-border hover:bg-muted"
          }`}
        >
          <Icon className="h-5 w-5" />
          <span className="flex-1 text-sm font-medium">{label}</span>
          {theme === value && <span className="h-2 w-2 rounded-full bg-foreground" />}
        </button>
      ))}
    </div>
  );
}
