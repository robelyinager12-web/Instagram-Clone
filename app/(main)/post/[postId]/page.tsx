import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCommentsPage } from "@/lib/comments/get-comments";
import { prisma } from "@/lib/db/prisma";
import { CommentList } from "@/features/comments/components/comment-list";

export const metadata: Metadata = {
  title: "Post",
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { username: true, avatarUrl: true, isVerified: true } },
      media: { orderBy: { order: "asc" } },
      _count: { select: { likes: true } },
    },
  });

  if (!post) notFound();

  const commentsPage = await getCommentsPage({ postId, viewerId: user.id });
  const primaryMedia = post.media[0];

  return (
    <div className="mx-auto flex h-screen max-w-5xl flex-col md:flex-row">
      <div className="relative flex-1 bg-black md:h-full">
        {primaryMedia && (
          <Image
            src={primaryMedia.url}
            alt={post.caption ?? "Post"}
            fill
            className="object-contain"
          />
        )}
      </div>

      <div className="flex w-full flex-col border-l border-border md:w-96">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Link href={`/profile/${post.author.username}`} className="shrink-0">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
              {post.author.avatarUrl && (
                <Image
                  src={post.author.avatarUrl}
                  alt={post.author.username}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </Link>
          <Link href={`/profile/${post.author.username}`} className="text-sm font-semibold">
            {post.author.username}
          </Link>
        </div>

        {post.caption && (
          <p className="border-b border-border px-4 py-3 text-sm">
            <span className="font-semibold">{post.author.username}</span> {post.caption}
          </p>
        )}

        <p className="border-b border-border px-4 py-2 text-sm font-semibold">
          {post._count.likes.toLocaleString()} likes
        </p>

        <div className="flex-1 overflow-hidden">
          <CommentList postId={postId} initialPage={commentsPage} />
        </div>
      </div>
    </div>
  );
}
