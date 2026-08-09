"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { updateProfile } from "@/actions/profile/update-profile";
import { uploadFileToCloudinary } from "@/lib/upload/upload-file";

type InitialProfile = {
  username: string;
  fullName: string | null;
  bio: string | null;
  website: string | null;
  avatarUrl: string | null;
};

export function EditProfileForm({ initial }: { initial: InitialProfile }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [fullName, setFullName] = useState(initial.fullName ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [website, setWebsite] = useState(initial.website ?? "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  async function handleAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const uploaded = await uploadFileToCloudinary(file, "avatars");
      setAvatarUrl(uploaded.url);
      await updateProfile({ avatarUrl: uploaded.url });
    } catch (err) {
      console.error("Avatar upload failed", err);
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSavedMessage(false);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        website: website.trim(),
      });
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2500);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-semibold">Edit profile</h1>

      <div className="mb-6 flex items-center gap-4 rounded-xl bg-muted/50 p-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
          {avatarUrl && (
            <Image src={avatarUrl} alt={initial.username} width={64} height={64} className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">{initial.username}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="text-sm font-semibold text-blue-500 disabled:opacity-50"
          >
            {isUploadingAvatar ? "Uploading…" : "Change profile photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelected}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={100}
            className="h-11 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:bg-background focus:ring-2 focus:ring-foreground/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={150}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:bg-background focus:ring-2 focus:ring-foreground/10"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">{bio.length}/150</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Website</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
            maxLength={200}
            className="h-11 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none focus:bg-background focus:ring-2 focus:ring-foreground/10"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="h-10 rounded-lg bg-foreground px-5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Submit"}
          </button>
          {savedMessage && <span className="text-sm text-muted-foreground">Saved.</span>}
        </div>
      </form>
    </div>
  );
}
