import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { createUploadSignature } from "@/services/cloudinary/config";

export async function POST(req: Request) {
  try {
    await requireCurrentUser();
    const { folder } = (await req.json()) as { folder?: string };

    const signature = createUploadSignature(folder ?? "uploads");
    return NextResponse.json(signature);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    console.error("POST /api/upload failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
