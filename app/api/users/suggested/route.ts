import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/current-user";
import type { SuggestedUser } from "@/types/feed";

export async function GET() {
  try {
    const viewer = await requireCurrentUser();

    const following = await prisma.follow.findMany({
      where: { followerId: viewer.id },
      select: { followingId: true },
    });
    const excludeIds = [viewer.id, ...following.map((f) => f.followingId)];

    const candidates = await prisma.user.findMany({
      where: { id: { notIn: excludeIds }, isActive: true, isBanned: false },
      take: 5,
      orderBy: { followers: { _count: "desc" } },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        isVerified: true,
        _count: { select: { followers: true } },
      },
    });

    const suggestions: SuggestedUser[] = candidates.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl,
      isVerified: u.isVerified,
      followerCount: u._count.followers,
    }));

    return NextResponse.json({ users: suggestions });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    console.error("GET /api/users/suggested failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
