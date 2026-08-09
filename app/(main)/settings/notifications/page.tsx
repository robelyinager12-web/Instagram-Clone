"use client";

import { useState } from "react";

const CATEGORIES = [
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "follows", label: "New followers" },
  { key: "messages", label: "Messages" },
];

export default function NotificationsSettingsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
  });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose what you get notified about. (Preferences here are visual only for now — saving them isn&apos;t wired up yet.)
        </p>
      </div>

      <div className="space-y-2">
        {CATEGORIES.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between rounded-xl border border-border p-4">
            <span className="text-sm font-medium">{label}</span>
            <button
              onClick={() => setEnabled((e) => ({ ...e, [key]: !e[key] }))}
              role="switch"
              aria-checked={enabled[key]}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                enabled[key] ? "bg-foreground" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                  enabled[key] ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
