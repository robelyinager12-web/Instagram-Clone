import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes anyone can hit without being signed in.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/verify-email(.*)",
  "/api/webhooks(.*)",
]);

// Routes that require an authenticated ADMIN/MODERATOR role — enforced
// again server-side in each admin page, this is just the first gate.
const isAdminRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (!isPublicRoute(req) && !userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (isAdminRoute(req)) {
    const role = sessionClaims?.metadata as { role?: string } | undefined;
    if (role?.role !== "ADMIN" && role?.role !== "MODERATOR") {
      return NextResponse.redirect(new URL("/feed", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next internals and static files, always run for API routes.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
