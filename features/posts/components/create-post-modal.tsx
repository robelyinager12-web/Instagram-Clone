"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCreatePostStore } from "@/store/create-post-store";
import { uploadFileToCloudinary } from "@/lib/upload/upload-file";
import { createPost } from "@/actions/posts/create-post";
import { useTagPeopleSearch } from "../hooks/use-tag-people-search";

type SelectedFile = {
  file: File;
  previewUrl: string;
  type: "IMAGE" | "VIDEO";
};

type Step = "select" | "details";

export function CreatePostModal() {
  const { isOpen, close } = useCreatePostStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("select");
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [taggedUsers, setTaggedUsers] = useState<{ id: string; username: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: tagCandidates } = useTagPeopleSearch(tagQuery);

  function handleClose() {
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setStep("select");
    setFiles([]);
    setPreviewIndex(0);
    setCaption("");
    setLocation("");
    setTagQuery("");
    setTaggedUsers([]);
    setError(null);
    close();
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, 10 - files.length);
    e.target.value = "";

    const withPreviews: SelectedFile[] = selected.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "VIDEO" : "IMAGE",
    }));

    setFiles((f) => [...f, ...withPreviews]);
  }

  function removeFile(index: number) {
    setFiles((f) => {
      URL.revokeObjectURL(f[index].previewUrl);
      return f.filter((_, i) => i !== index);
    });
    setPreviewIndex((i) => Math.max(0, Math.min(i, files.length - 2)));
  }

  function toggleTag(user: { id: string; username: string }) {
    setTaggedUsers((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  }

  async function handleSubmit() {
    if (files.length === 0) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const uploaded = await Promise.all(
        files.map((f) => uploadFileToCloudinary(f.file, "posts"))
      );

      const { id } = await createPost({
        media: uploaded.map((u) => ({
          url: u.url,
          type: u.resourceType === "video" ? "VIDEO" : "IMAGE",
          width: u.width,
          height: u.height,
        })),
        caption: caption || undefined,
        location: location || undefined,
        taggedUserIds: taggedUsers.map((u) => u.id),
      });

      handleClose();
      router.push(`/post/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong posting.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-background">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          {step === "details" ? (
            <button onClick={() => setStep("select")} className="text-sm">
              Back
            </button>
          ) : (
            <span className="w-10" />
          )}
          <h2 className="text-sm font-semibold">Create new post</h2>
          {step === "select" ? (
            <button
              onClick={() => setStep("details")}
              disabled={files.length === 0}
              className="text-sm font-semibold text-blue-500 disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1 text-sm font-semibold text-blue-500 disabled:opacity-40"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Share
            </button>
          )}
          <button onClick={handleClose} aria-label="Close" className="absolute right-4 top-3">
            <X className="h-5 w-5" />
          </button>
        </header>

        {step === "select" && (
          <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            {files.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <p className="text-sm text-muted-foreground">Select photos and videos to share</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  Select from computer
                </button>
              </div>
            ) : (
              <div className="w-full">
                <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-lg bg-black">
                  {files[previewIndex]?.type === "IMAGE" ? (
                    <Image
                      src={files[previewIndex].previewUrl}
                      alt=""
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <video src={files[previewIndex]?.previewUrl} controls className="h-full w-full object-contain" />
                  )}

                  {files.length > 1 && (
                    <>
                      <button
                        onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                        disabled={previewIndex === 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white disabled:opacity-30"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setPreviewIndex((i) => Math.min(files.length - 1, i + 1))}
                        disabled={previewIndex === files.length - 1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white disabled:opacity-30"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => removeFile(previewIndex)}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex justify-center gap-1.5">
                  {files.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${i === previewIndex ? "bg-foreground" : "bg-border"}`}
                    />
                  ))}
                </div>

                {files.length < 10 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mx-auto mt-3 block text-xs font-semibold text-blue-500"
                  >
                    Add more ({files.length}/10)
                  </button>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
          </div>
        )}

        {step === "details" && (
          <div className="flex flex-1 flex-col overflow-y-auto sm:flex-row">
            <div className="relative aspect-square w-full shrink-0 bg-black sm:w-80">
              {files[0]?.type === "IMAGE" ? (
                <Image src={files[0].previewUrl} alt="" fill className="object-contain" />
              ) : (
                <video src={files[0]?.previewUrl} className="h-full w-full object-contain" />
              )}
              {files.length > 1 && (
                <span className="absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
                  1/{files.length}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-4 p-4">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption… use #hashtags"
                maxLength={2200}
                rows={4}
                className="w-full resize-none bg-transparent text-sm outline-none"
              />

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                maxLength={100}
                className="w-full border-b border-border bg-transparent pb-2 text-sm outline-none"
              />

              <div>
                <input
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  placeholder="Tag people"
                  className="w-full border-b border-border bg-transparent pb-2 text-sm outline-none"
                />
                {tagCandidates && tagCandidates.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {tagCandidates.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => toggleTag(u)}
                        className="block text-sm font-semibold text-blue-500"
                      >
                        {taggedUsers.some((t) => t.id === u.id) ? "✓ " : ""}
                        {u.username}
                      </button>
                    ))}
                  </div>
                )}
                {taggedUsers.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Tagged: {taggedUsers.map((u) => u.username).join(", ")}
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
