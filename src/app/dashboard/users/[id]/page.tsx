"use client";

import React, { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { structureApi } from "@/lib/api/structure";
import { activitiesApi } from "@/lib/api/activities";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Activity, ActivityType, ActivityStatus } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Users,
  Award,
  BookOpen,
  FileCheck,
  TrendingUp,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  FileSpreadsheet,
  PlusCircle,
  Clock,
  AlertCircle,
  Edit,
} from "lucide-react";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user: currentUser, isTenantAdmin } = useAuth();
  const isAdmin = isTenantAdmin;

  // 1. Fetch User Profile
  const { data: targetUser, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: ["user-detail", id],
    queryFn: () => structureApi.getUser(id),
  });

  // 2. Fetch User Achievements
  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["user-activities", targetUser?.username],
    queryFn: () =>
      activitiesApi.getActivities({
        username: targetUser?.username,
        page_size: 100,
      }),
    enabled: Boolean(targetUser?.username),
  });

  const activities: Activity[] =
    activitiesData?.results || (Array.isArray(activitiesData) ? (activitiesData as any) : []);

  const approvedCount = activities.filter((a) => a.status === "approved").length;
  const pendingCount = activities.filter(
    (a) => a.status === "submitted" || a.status === "under_review"
  ).length;

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="success" size="sm" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Audit Ready
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="info" size="sm" className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Submitted
          </Badge>
        );
      case "under_review":
        return (
          <Badge variant="warning" size="sm" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Under Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="danger" size="sm" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Needs Revision
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const getTypeIcon = (type: ActivityType | string) => {
    switch (type) {
      case "journal":
      case "journal_publication":
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case "conference":
      case "conference_publication":
        return <Award className="w-4 h-4 text-purple-500" />;
      case "patent":
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case "fdp":
      case "faculty_participation":
        return <FileCheck className="w-4 h-4 text-amber-500" />;
      default:
        return <Award className="w-4 h-4 text-slate-400" />;
    }
  };

  if (isLoadingUser) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (userError || !targetUser) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <XCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Faculty Member Not Found
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          The requested user account does not exist or you do not have permission to inspect their profile.
        </p>
        <Link href="/dashboard/users">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Users Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/users">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Users Directory
            </Button>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Faculty Profile & Portfolio
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/achievements?username=${targetUser.username}`}>
            <Button variant="outline" size="sm" leftIcon={<Award className="w-4 h-4" />}>
              Open in Achievements Tab
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/dashboard/users">
              <Button variant="primary" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                Manage in User Directory
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Profile Card Header */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/40 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 border-indigo-100/80 dark:border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {(targetUser.first_name?.[0] || targetUser.username[0] || "U").toUpperCase()}
              {(targetUser.last_name?.[0] || "").toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {targetUser.first_name
                    ? `${targetUser.first_name} ${targetUser.last_name || ""}`
                    : targetUser.username}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  @{targetUser.username}
                </span>
              </div>

              <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-600 text-white shadow-xs">
                  {targetUser.role?.name || (targetUser.is_superuser ? "Super Admin" : "Faculty Member")}
                </span>
                {targetUser.is_approved ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active & Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    <XCircle className="w-3.5 h-3.5" /> Pending Approval
                  </span>
                )}
                {targetUser.is_department_head && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    Head of Department
                  </span>
                )}
                {targetUser.is_coordinator && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Accreditation Coordinator
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Uploaded
              </div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                {activities.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Approved
              </div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {approvedCount}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                In Review
              </div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {pendingCount}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Department
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{targetUser.department?.name || targetUser.department_name || "Unassigned"}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Designation
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
              {targetUser.designation?.name || targetUser.designation_name || "Faculty Member"}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Email Address
            </div>
            <div className="text-xs font-mono text-slate-800 dark:text-slate-200 mt-1 truncate flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a href={`mailto:${targetUser.email}`} className="hover:underline truncate">
                {targetUser.email || "No email"}
              </a>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Employee ID & Phone
            </div>
            <div className="text-xs font-mono text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
              <span>ID: {targetUser.employee_id || "N/A"}</span>
              {targetUser.phone && <span>• {targetUser.phone}</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* Academic Achievements Portfolio Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Academic Achievements & Publications Ledger</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified submissions, journal articles, conference papers, and patents for @{targetUser.username}.
            </p>
          </div>

          <Link href="/dashboard/records">
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              className="text-indigo-600 dark:text-indigo-400 font-bold"
            >
              All Records Repository &rarr;
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden">
          {isLoadingActivities ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No academic records found for @{targetUser.username}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                This faculty scholar has not recorded any publications or achievements yet.
              </p>
              <Link href="/dashboard/achievements/new">
                <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Submit New Record
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Record Title & Metadata</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Session</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activities.map((act) => (
                    <tr
                      key={act.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-md">
                        <Link
                          href={`/dashboard/achievements/${act.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2"
                        >
                          {act.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                          {act.metadata?.journal_name && (
                            <span className="truncate max-w-[200px] italic">
                              {String(act.metadata.journal_name)}
                            </span>
                          )}
                          {act.metadata?.doi && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                              DOI: {String(act.metadata.doi)}
                            </span>
                          )}
                          {act.metadata?.patent_number && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                              Patent: {String(act.metadata.patent_number)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-xs text-slate-700 dark:text-slate-300">
                          {getTypeIcon(act.activity_type)}
                          <span className="capitalize">
                            {act.activity_type.replace(/_/g, " ")}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-400">
                        {typeof act.academic_session === "object" ? act.academic_session?.name : act.academic_session || "—"}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(act.status)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <Link href={`/dashboard/achievements/${act.id}`}>
                          <Button size="xs" variant="ghost" leftIcon={<ExternalLink className="w-3 h-3" />}>
                            View Record
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
