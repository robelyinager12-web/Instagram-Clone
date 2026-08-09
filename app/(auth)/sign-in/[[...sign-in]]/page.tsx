import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthLayout } from "@/features/auth/components/auth-layout";

export const metadata: Metadata = {
  title: "Log in",
};

export default function SignInPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to see photos and videos from people you follow.">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
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
