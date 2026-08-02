import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
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
