"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";

const updateProfileSchema = z.object({
  fullName: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(150).optional(),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  avatarUrl: z.string().url().optional(),
  isPrivate: z.boolean().optional(),
});

export async function updateProfile(input: z.infer<typeof updateProfileSchema>) {
  const user = await requireCurrentUser();
  const data = updateProfileSchema.parse(input);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.website !== undefined && { website: data.website || null }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      ...(data.isPrivate !== undefined && { isPrivate: data.isPrivate }),
    },
  });

  revalidatePath(`/profile/${user.username}`);
  return { ok: true };
}
