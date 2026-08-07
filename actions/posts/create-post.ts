"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

const mediaSchema = z.object({
  url: z.string().url(),
  type: z.enum(["IMAGE", "VIDEO"]),
  width: z.number().optional(),
  height: z.number().optional(),
});

const createPostSchema = z.object({
  media: z.array(mediaSchema).min(1).max(10),
  caption: z.string().trim().max(2200).optional(),
  location: z.string().trim().max(100).optional(),
  taggedUserIds: z.array(z.string()).max(20).optional(),
  visibility: z.enum(["PUBLIC", "FOLLOWERS_ONLY", "CLOSE_FRIENDS"]).default("PUBLIC"),
});

const HASHTAG_PATTERN = /#(\w+)/g;

export async function createPost(input: z.infer<typeof createPostSchema>) {
  const user = await requireCurrentUser();
  const data = createPostSchema.parse(input);

  const hashtags = data.caption
    ? [...data.caption.matchAll(HASHTAG_PATTERN)].map((m) => m[1].toLowerCase())
    : [];

  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      caption: data.caption,
      location: data.location,
      visibility: data.visibility,
      media: {
        create: data.media.map((m, index) => ({
          url: m.url,
          type: m.type,
          width: m.width,
          height: m.height,
          order: index,
        })),
      },
      taggedUsers: data.taggedUserIds?.length
        ? { create: data.taggedUserIds.map((userId) => ({ userId })) }
        : undefined,
    },
  });

  for (const tag of hashtags) {
    const hashtag = await prisma.hashtag.upsert({
      where: { tag },
      create: { tag, postCount: 1 },
      update: { postCount: { increment: 1 } },
    });
    await prisma.postHashtag.create({
      data: { postId: post.id, hashtagId: hashtag.id },
    });
  }

  if (data.taggedUserIds?.length) {
    await prisma.notification.createMany({
      data: data.taggedUserIds
        .filter((id) => id !== user.id)
        .map((recipientId) => ({
          recipientId,
          actorId: user.id,
          type: "TAGGED" as const,
          postId: post.id,
        })),
    });
  }

  revalidatePath("/feed");
  revalidatePath(`/profile/${user.username}`);

  return { id: post.id };
}
