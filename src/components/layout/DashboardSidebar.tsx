"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Award,
  PlusCircle,
  CheckSquare,
  UploadCloud,
  FileSpreadsheet,
  Users,
  Building,
  GraduationCap,
  Calendar,
  UserCheck,
  Shield,
  Layers,
} from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { isTenantAdmin, isDean, isInstitutionalManager, isHOD, isCoordinator, canManageUsers } = useAuth();

  const isElevated = isTenantAdmin || isDean || isHOD || isCoordinator;

  const sections = [
    {
      title: "Workspace",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="w-4 h-4" />,
          exact: true,
        },
        {
          label: "Faculty Achievements",
          href: "/dashboard/achievements",
          icon: <Award className="w-4 h-4" />,
        },
        {
          label: "All Records (Ledger)",
          href: "/dashboard/records",
          icon: <FileSpreadsheet className="w-4 h-4" />,
        },
        {
          label: "Submit New Record",
          href: "/dashboard/achievements/new",
          icon: <PlusCircle className="w-4 h-4" />,
        },
      ],
    },
    ...(isElevated
      ? [
          {
            title: "Accreditation & Review",
            items: [
              {
                label: "Review & Verify",
                href: "/dashboard/reviews",
                icon: <CheckSquare className="w-4 h-4" />,
              },
              {
                label: "Bulk Ingestion (Excel/ZIP)",
                href: "/dashboard/bulk-import",
                icon: <UploadCloud className="w-4 h-4" />,
              },
              {
                label: "NAAC Criteria 3 Export",
                href: "/dashboard/export",
                icon: <FileSpreadsheet className="w-4 h-4" />,
              },
            ],
          },
        ]
      : []),
    ...(canManageUsers
      ? [
          {
            title: isInstitutionalManager ? "Institutional RBAC & Management" : "Department Management",
            items: [
              {
                label: "Users & Faculty",
                href: "/dashboard/users",
                icon: <Users className="w-4 h-4" />,
                exact: true,
              },
              ...(isInstitutionalManager
                ? [
                    {
                      label: "Roles & Permissions",
                      href: "/dashboard/roles",
                      icon: <Shield className="w-4 h-4" />,
                    },
                    {
                      label: "3-Col Bulk Onboard",
                      href: "/dashboard/users/bulk-onboard",
                      icon: <UserCheck className="w-4 h-4" />,
                    },
                    {
                      label: "Departments",
                      href: "/dashboard/structure/departments",
                      icon: <Building className="w-4 h-4" />,
                    },
                    {
                      label: "Designations",
                      href: "/dashboard/structure/designations",
                      icon: <GraduationCap className="w-4 h-4" />,
                    },
                    {
                      label: "Academic Sessions",
                      href: "/dashboard/structure/sessions",
                      icon: <Calendar className="w-4 h-4" />,
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 flex flex-col shrink-0 select-none">
      {/* Brand Logo Header */}
      <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center">
        <Logo size="sm" showTagline />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {sec.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {sec.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group",
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                    )}
                  >
                    <span
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
