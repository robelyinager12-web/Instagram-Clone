"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/profile/update-profile";

export function PrivacyToggle({ initialIsPrivate }: { initialIsPrivate: boolean }) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [isSaving, setIsSaving] = useState(false);

  async function handleToggle() {
    const next = !isPrivate;
    setIsPrivate(next);
    setIsSaving(true);
    try {
      await updateProfile({ isPrivate: next });
    } catch {
      setIsPrivate(!next);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-4">
      <div>
        <p className="text-sm font-semibold">Private account</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          When your account is private, only people you approve can see your photos and videos.
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={isSaving}
        role="switch"
        aria-checked={isPrivate}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isPrivate ? "bg-foreground" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
            isPrivate ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
