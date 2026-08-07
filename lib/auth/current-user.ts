import { auth, currentUser as getClerkUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { cache } from "react";

/**
 * Resolves the signed-in Clerk session to our own `User` row.
 *
 * The webhook at /api/webhooks/clerk is the primary sync path, but it
 * requires Clerk's servers to reach our own — which only works once this
 * app is deployed somewhere public (or tunneled with something like
 * ngrok in local dev). Rather than make the whole app depend on that
 * being configured correctly, we fall back to creating the row here on
 * first access. This makes auth self-healing regardless of webhook
 * delivery, and is the fix for a real redirect loop: without it, a
 * signed-in Clerk user with no matching DB row bounces between
 * "authenticated" (middleware) and "no user found" (page-level check)
 * forever.
 *
 * Wrapped in React `cache` so multiple server components/actions in the
 * same request share one DB lookup instead of each firing their own.
 */
export const getCurrentUser = cache(async () => {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  const clerkUser = await getClerkUser();
  if (!clerkUser) return null;

  const primaryEmail = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;
  if (!primaryEmail) return null;

  const fallbackUsername = primaryEmail.split("@")[0];
  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  const created = await prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email: primaryEmail,
      username: clerkUser.username ?? fallbackUsername,
      fullName,
      avatarUrl: clerkUser.imageUrl ?? null,
    },
    update: {
      email: primaryEmail,
      avatarUrl: clerkUser.imageUrl ?? null,
    },
  });

  return created;
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
