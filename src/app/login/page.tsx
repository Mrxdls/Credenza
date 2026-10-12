"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { toast } from "sonner";
import { Lock, User as UserIcon, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please provide both your username and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await login(username.trim(), password);
      toast.success(`Welcome back, ${user.first_name || user.username}!`);

      // Route all users to User Console (/dashboard) by default for friendly, unified UX
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Please check your credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-slate-50 via-slate-100 to-indigo-50/20 dark:from-[#080c14] dark:via-[#0c1220] dark:to-[#10172a] relative overflow-hidden">
      {/* Background ambient glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="mb-8 text-center flex flex-col items-center">
        <Logo size="lg" showTagline />
      </div>

      <Card className="w-full max-w-md backdrop-blur-md bg-white/95 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">Sign in to your portal</CardTitle>
          <CardDescription>
            Enter your institutional credentials
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/80 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <Input
              label="Username or Email"
              placeholder="e.g. anjuli.dubey or myadmin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<UserIcon className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Credenza
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 text-center text-xs text-slate-500">
          <div>
            Need to register your university or college?{" "}
            <Link
              href="/register-organization"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Register Institution
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
