"use server";

import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

export async function deletePost(postId: string) {
  const user = await requireCurrentUser();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) throw new Error("Post not found");
  if (post.authorId !== user.id) throw new Error("Not authorized");

  await prisma.post.delete({ where: { id: postId } });

  revalidatePath("/feed");
  revalidatePath(`/profile/${user.username}`);
  return { ok: true };
}
