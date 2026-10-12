"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  allowed: boolean;
  requiredRoleName?: string;
  fallbackUrl?: string;
}

export function RouteGuard({
  children,
  allowed,
  requiredRoleName = "Institutional Administrator",
  fallbackUrl = "/dashboard",
}: RouteGuardProps) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto p-4 sm:p-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-lg" />
        <Card className="p-8 space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-4">
        <Card className="p-8 text-center space-y-4 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Authentication Required</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your academic session has expired or you are not signed in.
            </p>
          </div>
          <Link href="/login" className="block pt-2">
            <Button variant="primary" size="sm" className="w-full">
              Sign In to Credenza
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="max-w-lg mx-auto my-12 p-4">
        <Card className="p-8 text-center space-y-4 border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Restricted</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
              You do not possess the required RBAC elevation or institutional scope to access this section.
            </p>
            <div className="inline-block mt-3 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-[11px] font-semibold">
              Requires: {requiredRoleName}
            </div>
          </div>
          <div className="pt-2">
            <Link href={fallbackUrl}>
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Workspace
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

