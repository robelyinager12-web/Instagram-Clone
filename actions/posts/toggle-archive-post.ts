"use server";

import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

export async function toggleArchivePost(postId: string) {
  const user = await requireCurrentUser();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, isArchived: true },
  });
  if (!post) throw new Error("Post not found");
  if (post.authorId !== user.id) throw new Error("Not authorized");

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { isArchived: !post.isArchived },
  });

  revalidatePath("/feed");
  revalidatePath(`/profile/${user.username}`);
  return { isArchived: updated.isArchived };
}
