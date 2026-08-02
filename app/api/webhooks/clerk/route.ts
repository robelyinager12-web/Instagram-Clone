import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

// Clerk sends user.created / user.updated / user.deleted events here so
// our own database stays in sync with whatever Clerk considers the
// source of truth for auth (email, verification status, avatar, etc).
export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  let event: WebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Clerk webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const {
        id,
        email_addresses,
        username,
        first_name,
        last_name,
        image_url,
      } = event.data;

      const primaryEmail = email_addresses.find(
        (e) => e.id === event.data.primary_email_address_id
      )?.email_address;

      if (!primaryEmail) {
        console.error("Clerk user has no primary email", id);
        break;
      }

      const fallbackUsername = primaryEmail.split("@")[0];
      const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;

      await prisma.user.upsert({
        where: { clerkId: id },
        create: {
          clerkId: id,
          email: primaryEmail,
          username: username ?? fallbackUsername,
          fullName,
          avatarUrl: image_url ?? null,
        },
        update: {
          email: primaryEmail,
          username: username ?? fallbackUsername,
          fullName,
          avatarUrl: image_url ?? null,
        },
      });
      break;
    }

    case "user.deleted": {
      const clerkId = event.data.id;
      if (!clerkId) break;

      // Soft-delete rather than hard-delete so posts/comments/messages
      // authored by this user don't cascade away for other users.
      await prisma.user.updateMany({
        where: { clerkId },
        data: { isActive: false },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
