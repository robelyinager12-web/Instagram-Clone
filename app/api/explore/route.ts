import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getExplorePage } from "@/lib/explore/get-explore";

export async function GET(req: Request) {
  try {
    const user = await requireCurrentUser();
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") ?? undefined;

    const page = await getExplorePage({ viewerId: user.id, cursor });
    return NextResponse.json(page);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    console.error("GET /api/explore failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
