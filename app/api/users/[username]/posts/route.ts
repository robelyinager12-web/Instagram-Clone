import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getProfile, getProfilePostsPage } from "@/lib/profile/get-profile";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const viewer = await requireCurrentUser();
    const { username } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") ?? undefined;

    const profile = await getProfile(username, viewer.id);
    if (!profile) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!profile.canViewPosts) {
      return NextResponse.json({ posts: [], nextCursor: null });
    }

    const page = await getProfilePostsPage({ userId: profile.id, cursor });
    return NextResponse.json(page);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    console.error("GET /api/users/[username]/posts failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
