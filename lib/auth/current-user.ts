import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { cache } from "react";

/**
 * Resolves the signed-in Clerk session to our own `User` row.
 * Wrapped in React `cache` so multiple server components/actions in the
 * same request share one DB lookup instead of each firing their own.
 */
export const getCurrentUser = cache(async () => {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  return user;
});

/**
 * Same as getCurrentUser but throws if there's no session — use in
 * Server Actions / route handlers where an unauthenticated call should
 * never reach business logic.
 */
export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}
