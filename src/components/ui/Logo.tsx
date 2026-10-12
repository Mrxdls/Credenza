import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  href?: string;
  variant?: "light" | "dark" | "auto";
}

export function Logo({
  className,
  size = "md",
  showTagline = false,
  href = "/",
  variant = "auto",
}: LogoProps) {
  const sizeMap = {
    sm: { icon: "w-7 h-7", text: "text-lg", tag: "text-[10px]" },
    md: { icon: "w-9 h-9", text: "text-xl", tag: "text-xs" },
    lg: { icon: "w-11 h-11", text: "text-2xl", tag: "text-xs" },
    xl: { icon: "w-14 h-14", text: "text-3xl", tag: "text-sm" },
  };

  const content = (
    <div className={cn("flex items-center gap-2.5 select-none group", className)}>
      {/* Credenza Geometric Emblem: Open book chevron + rising analytical columns */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-1.5 shadow-md shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-105",
          sizeMap[size].icon
        )}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Ascending metric bars */}
          <rect x="12" y="18" width="4" height="10" rx="1.5" fill="currentColor" fillOpacity="0.8" />
          <rect x="18" y="10" width="4" height="18" rx="1.5" fill="currentColor" />
          <rect x="24" y="14" width="4" height="14" rx="1.5" fill="currentColor" fillOpacity="0.9" />
          {/* Open scholarly foundation chevron */}
          <path
            d="M8 26L20 32L32 26"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 32V20"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 2"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={cn(
            "font-extrabold tracking-tight transition-colors",
            sizeMap[size].text,
            variant === "light"
              ? "text-white"
              : variant === "dark"
              ? "text-slate-900"
              : "text-slate-900 dark:text-white"
          )}
        >
          CREDENZA
        </span>
        {showTagline && (
          <span
            className={cn(
              "font-medium tracking-wide text-indigo-600 dark:text-indigo-400 uppercase -mt-1",
              sizeMap[size].tag
            )}
          >
            Accreditation & Faculty Intelligence
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
