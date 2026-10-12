"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  User as UserIcon,
  LogOut,
  ExternalLink,
  ChevronDown,
  Shield,
  FileCheck,
} from "lucide-react";

export function DashboardHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { user, tenant, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-between sticky top-0 z-20">
      {/* Title / Breadcrumbs */}
      <div>
        {title ? (
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {tenant ? tenant.name : "Platform Governance"}
            </span>
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Active Tenant Badge */}
        {tenant && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-xs">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-indigo-950 dark:text-indigo-200 truncate max-w-[200px]">
              {tenant.name}
            </span>
            <span className="px-1 py-0.2 bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-[10px] font-bold">
              {tenant.code}
            </span>
          </div>
        )}

        {/* Django Admin Fallback link for staff */}
        {user?.is_staff && (
          <a
            href="http://localhost:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Django Unfold Console"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <span>Django Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[130px]">
                {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {user?.role?.name || (user?.is_superuser ? "Super Admin" : "Faculty")}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1.5 z-40">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-1.5">
                    <Badge variant="primary" size="sm">
                      {user?.role?.name || (user?.is_superuser ? "Super Admin" : "Faculty")}
                    </Badge>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile & Stats</span>
                  </Link>

                  <Link
                    href="/dashboard/achievements"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Submissions</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
