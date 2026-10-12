"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" showTagline />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Features
          </Link>
          <Link href="/#accreditation" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            NAAC & NIRF
          </Link>
          <Link href="/#workflow" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Audit Workflow
          </Link>
          <Link href="/#tiers" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Tiers & Pricing
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated && user ? (
            <Link href="/dashboard">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<LayoutDashboard className="w-4 h-4" />}
              >
                Open Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  Sign In
                </Button>
              </Link>
              <Link href="/register-organization">
                <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Register Institution
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 flex flex-col gap-3">
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 py-2"
          >
            Features
          </Link>
          <Link
            href="/#accreditation"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 py-2"
          >
            NAAC & NIRF
          </Link>
          <Link
            href="/#tiers"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 py-2"
          >
            Tiers & Pricing
          </Link>

          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Open Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register-organization" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Register Institution</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
