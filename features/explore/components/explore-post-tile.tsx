"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Layers, Play } from "lucide-react";
import type { ExploreTile } from "@/types/explore";

export function ExplorePostTile({ tile }: { tile: ExploreTile }) {
  const aspectRatio =
    tile.width && tile.height ? tile.width / tile.height : 1;

  return (
    <Link
      href={`/post/${tile.id}`}
      className="group relative mb-1 block break-inside-avoid overflow-hidden bg-muted sm:mb-1.5"
      style={{ aspectRatio }}
    >
      <Image
        src={tile.mediaUrl}
        alt=""
        fill
        sizes="(max-width: 640px) 33vw, 300px"
        className="object-cover transition-transform duration-200 group-hover:scale-105"
      />

      <div className="absolute right-2 top-2">
        {tile.isCarousel && <Layers className="h-5 w-5 text-white drop-shadow" />}
        {tile.mediaType === "VIDEO" && <Play className="h-5 w-5 fill-white text-white drop-shadow" />}
      </div>

      <div className="absolute inset-0 hidden items-center justify-center gap-6 bg-black/30 text-white group-hover:flex">
        <span className="flex items-center gap-1.5 font-semibold">
          <Heart className="h-5 w-5 fill-white" />
          {tile.likeCount.toLocaleString()}
        </span>
        <span className="flex items-center gap-1.5 font-semibold">
          <MessageCircle className="h-5 w-5 fill-white" />
          {tile.commentCount.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
