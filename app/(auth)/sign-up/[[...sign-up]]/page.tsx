import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthLayout } from "@/features/auth/components/auth-layout";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <AuthLayout title="Create your account" subtitle="Join to start sharing photos and videos.">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        forceRedirectUrl="/feed"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border-none p-0 w-full bg-transparent",
            formButtonPrimary:
              "h-11 rounded-lg bg-foreground text-background hover:bg-foreground/90 text-sm font-semibold normal-case shadow-none",
            formFieldInput:
              "h-11 rounded-lg border-border bg-muted/40 focus:bg-background",
            footerActionLink: "text-foreground font-semibold",
          },
        }}
      />
    </AuthLayout>
  );
}
