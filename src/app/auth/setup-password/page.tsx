"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

function SetupPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uid || !token) {
      setError("Invalid or missing setup link. Please contact your institutional administrator.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authApi.setupPassword({
        uid,
        token,
        password,
        password_confirm: passwordConfirm,
      });

      setIsSuccess(true);
      toast.success(res.message || "Password established successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to establish password. Link may be expired.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 shadow-xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">Set Up Your Account Password</CardTitle>
        <CardDescription>
          Welcome to Credenza. Please choose a secure password to activate your institutional profile.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Password Established!
            </h4>
            <p className="text-xs text-slate-500">
              Your account has been activated. Redirecting you to the sign-in portal...
            </p>
            <Button
              size="sm"
              onClick={() => router.push("/login")}
              className="mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In Now
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/80 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!uid || !token ? (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/80 text-amber-800 dark:text-amber-200 text-xs">
                No active token found in URL parameters. Please ensure you clicked the full link sent by your administrator.
              </div>
            ) : null}

            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              helperText="Must be at least 8 characters long"
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-type your password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              disabled={!uid || !token}
            >
              Activate Account & Set Password
            </Button>

            <div className="text-center mt-2">
              <Link
                href="/login"
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Already have a password? Sign in
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function SetupPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50 dark:bg-[#080c14] relative">
      <div className="mb-8 text-center flex flex-col items-center">
        <Logo size="lg" showTagline />
      </div>

      <Suspense fallback={<div className="text-xs text-slate-400">Loading token context...</div>}>
        <SetupPasswordForm />
      </Suspense>
    </div>
  );
}
