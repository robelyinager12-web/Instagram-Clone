import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getCommentsPage } from "@/lib/comments/get-comments";

export async function GET(req: Request) {
  try {
    const user = await requireCurrentUser();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const cursor = searchParams.get("cursor") ?? undefined;

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const page = await getCommentsPage({ postId, viewerId: user.id, cursor });
    return NextResponse.json(page);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    console.error("GET /api/comments failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
