"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

const createStorySchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  caption: z.string().max(200).optional(),
  isCloseFriendsOnly: z.boolean().optional(),
});

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function createStory(input: z.infer<typeof createStorySchema>) {
  const user = await requireCurrentUser();
  const data = createStorySchema.parse(input);

  const story = await prisma.story.create({
    data: {
      authorId: user.id,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      caption: data.caption,
      isCloseFriendsOnly: data.isCloseFriendsOnly ?? false,
      expiresAt: new Date(Date.now() + TWENTY_FOUR_HOURS_MS),
    },
  });

  revalidatePath("/feed");
  return { id: story.id };
}
