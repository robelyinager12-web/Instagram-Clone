"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Layers, Play, Lock } from "lucide-react";
import type { ProfilePostsPage } from "@/types/profile";

async function fetchPage(username: string, cursor?: string): Promise<ProfilePostsPage> {
  const url = cursor
    ? `/api/users/${username}/posts?cursor=${cursor}`
    : `/api/users/${username}/posts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json();
}

export function ProfilePostGrid({
  username,
  canViewPosts,
  initialPage,
}: {
  username: string;
  canViewPosts: boolean;
  initialPage: ProfilePostsPage;
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["profile-posts", username],
    queryFn: ({ pageParam }) => fetchPage(username, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: { pages: [initialPage], pageParams: [undefined] },
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "800px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!canViewPosts) {
    return (
      <div className="flex flex-col items-center gap-2 border-t border-border py-16 text-center">
        <Lock className="h-10 w-10 text-muted-foreground" />
        <p className="font-semibold">This account is private</p>
        <p className="text-sm text-muted-foreground">Follow to see their photos and videos.</p>
      </div>
    );
  }

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  if (posts.length === 0) {
    return (
      <p className="border-t border-border py-16 text-center text-sm text-muted-foreground">
        No posts yet.
      </p>
    );
  }

  return (
    <div className="border-t border-border">
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
        {posts.map((post) => (
          <Link key={post.id} href={`/post/${post.id}`} className="group relative aspect-square bg-muted">
            <Image src={post.thumbnailUrl} alt="" fill sizes="33vw" className="object-cover" />
            <div className="absolute right-1.5 top-1.5">
              {post.isCarousel && <Layers className="h-4 w-4 text-white drop-shadow" />}
              {post.mediaType === "VIDEO" && <Play className="h-4 w-4 fill-white text-white drop-shadow" />}
            </div>
            <div className="absolute inset-0 hidden items-center justify-center gap-4 bg-black/30 text-white group-hover:flex">
              <span className="flex items-center gap-1 text-sm font-semibold">
                <Heart className="h-4 w-4 fill-white" />
                {post.likeCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold">
                <MessageCircle className="h-4 w-4 fill-white" />
                {post.commentCount.toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div ref={sentinelRef} />
    </div>
  );
}
