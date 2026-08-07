"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";

const saveDraftSchema = z.object({
  caption: z.string().trim().max(2200).optional(),
  mediaUrls: z.array(z.string().url()),
  location: z.string().trim().max(100).optional(),
});

export async function saveDraft(input: z.infer<typeof saveDraftSchema>) {
  const user = await requireCurrentUser();
  const data = saveDraftSchema.parse(input);

  const draft = await prisma.draft.create({
    data: {
      userId: user.id,
      caption: data.caption,
      mediaUrls: data.mediaUrls,
      location: data.location,
    },
  });

  return { id: draft.id };
}
