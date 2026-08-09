import type { Metadata } from "next";
import { UserProfile } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Security" };

export default function SecuritySettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Security</h1>
      <UserProfile
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border-none p-0 w-full bg-transparent",
          },
        }}
      />
    </div>
  );
}
