import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        forceRedirectUrl="/feed"
        appearance={{
          elements: {
            rootBox: "w-full max-w-sm",
            card: "shadow-none border border-border rounded-xl",
          },
        }}
      />
    </div>
  );
}
