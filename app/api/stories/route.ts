import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getActiveStoryGroups } from "@/lib/stories/get-stories";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const groups = await getActiveStoryGroups(user.id);
    return NextResponse.json({ groups });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    console.error("GET /api/stories failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
