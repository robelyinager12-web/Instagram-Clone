import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { searchAll } from "@/lib/search/search";

export async function GET(req: Request) {
  try {
    await requireCurrentUser();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") ?? "";

    const results = await searchAll(query);
    return NextResponse.json(results);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    console.error("GET /api/search failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
