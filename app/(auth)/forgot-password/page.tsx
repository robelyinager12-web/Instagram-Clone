"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const emailSchema = z.string().email("Enter a valid email address");
const codeSchema = z.object({
  code: z.string().min(6, "Enter the 6-digit code"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type Step = "request" | "reset";

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (!isLoaded) return;

    setIsSubmitting(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("reset");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't send the reset code. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = codeSchema.safeParse({ code, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (!isLoaded) return;

    setIsSubmitting(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/feed");
      } else {
        setError("Something went wrong verifying that code. Please try again.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "That code didn't work. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border p-8">
        <h1 className="mb-1 text-xl font-semibold">Reset your password</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {step === "request"
            ? "Enter your email and we'll send a reset code."
            : `Enter the code we sent to ${email} and choose a new password.`}
        </p>

        {error && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {step === "request" ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {isSubmitting ? "Sending…" : "Send reset code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {isSubmitting ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
