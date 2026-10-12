"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, tenant } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border-2 border-indigo-600 animate-spin border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Initializing Credenza Session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-72 max-w-[85vw] h-full bg-white dark:bg-slate-900 flex flex-col">
            <div className="p-3 flex justify-end border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DashboardSidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with mobile hamburger */}
        <div className="flex items-center w-full">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            aria-label="Toggle navigation"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <DashboardHeader />
          </div>
        </div>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
