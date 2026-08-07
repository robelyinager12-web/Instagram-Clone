"use server";

import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";

export async function deleteDraft(draftId: string) {
  const user = await requireCurrentUser();

  await prisma.draft.deleteMany({
    where: { id: draftId, userId: user.id },
  });

  return { ok: true };
}
