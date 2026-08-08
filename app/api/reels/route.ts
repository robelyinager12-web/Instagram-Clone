import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getReelsPage } from "@/lib/reels/get-reels";

export async function GET(req: Request) {
  try {
    const user = await requireCurrentUser();
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") ?? undefined;

    const page = await getReelsPage({ viewerId: user.id, cursor });
    return NextResponse.json(page);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    console.error("GET /api/reels failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
