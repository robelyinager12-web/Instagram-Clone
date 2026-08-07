"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

const updatePostSchema = z.object({
  postId: z.string(),
  caption: z.string().trim().max(2200).optional(),
  location: z.string().trim().max(100).optional(),
});

export async function updatePost(input: z.infer<typeof updatePostSchema>) {
  const user = await requireCurrentUser();
  const data = updatePostSchema.parse(input);

  const post = await prisma.post.findUnique({
    where: { id: data.postId },
    select: { authorId: true },
  });
  if (!post) throw new Error("Post not found");
  if (post.authorId !== user.id) throw new Error("Not authorized");

  await prisma.post.update({
    where: { id: data.postId },
    data: {
      ...(data.caption !== undefined && { caption: data.caption }),
      ...(data.location !== undefined && { location: data.location }),
    },
  });

  revalidatePath(`/post/${data.postId}`);
  return { ok: true };
}
