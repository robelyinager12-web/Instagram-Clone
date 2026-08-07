import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getUserDrafts } from "@/lib/posts/get-drafts";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const drafts = await getUserDrafts(user.id);
    return NextResponse.json({ drafts });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    console.error("GET /api/drafts failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
