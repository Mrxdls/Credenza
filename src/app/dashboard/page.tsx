"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { activitiesApi } from "@/lib/api/activities";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Activity, ActivityType, ActivityStatus } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Award,
  BookOpen,
  FileCheck,
  Clock,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  UploadCloud,
  CheckSquare,
  Paperclip,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const { user, tenant, isTenantAdmin, isHOD, isCoordinator } = useAuth();
  const isElevated = isTenantAdmin || isHOD || isCoordinator;

  // Fetch activities
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-activities"],
    queryFn: () => activitiesApi.getActivities({ page_size: 50 }),
  });

  const activities: Activity[] = data?.results || (Array.isArray(data) ? (data as any) : []);

  // Compute metrics
  const totalCount = data?.count ?? activities.length;
  const approvedCount = activities.filter((a) => a.status === "approved").length;
  const pendingCount = activities.filter(
    (a) => a.status === "submitted" || a.status === "under_review"
  ).length;
  const draftCount = activities.filter((a) => a.status === "draft").length;
  const rejectedCount = activities.filter((a) => a.status === "rejected").length;

  const journalsCount = activities.filter(
    (a) => a.activity_type === "journal_publication" || (a.activity_type as string) === "journal"
  ).length;
  const confCount = activities.filter(
    (a) => a.activity_type === "conference_publication" || (a.activity_type as string) === "conference"
  ).length;
  const patentCount = activities.filter((a) => a.activity_type === "patent").length;
  const fdpCount = activities.filter(
    (a) => a.activity_type === "faculty_participation" || (a.activity_type as string) === "fdp"
  ).length;

  const recentActivities = activities.slice(0, 6);

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case "approved":
        return <Badge variant="success" size="sm">Audit Ready</Badge>;
      case "submitted":
        return <Badge variant="info" size="sm">Submitted</Badge>;
      case "under_review":
        return <Badge variant="warning" size="sm">Under Review</Badge>;
      case "rejected":
        return <Badge variant="danger" size="sm">Needs Revision</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Draft</Badge>;
    }
  };

  const getCategoryIcon = (type: ActivityType | string) => {
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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>{tenant ? tenant.name : "Platform Governance Console"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isElevated
                ? `You have administrative oversight for departmental verification and accreditation reporting. There are ${pendingCount} submissions awaiting review.`
                : "Submit, track, and archive your peer-reviewed publications, patents, conference presentations, and FDP certifications with audit-proof R2 verification."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/achievements/new">
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="bg-indigo-500 hover:bg-indigo-400 text-white border-0 shadow-lg shadow-indigo-500/25"
              >
                Submit Record
              </Button>
            </Link>

            {isElevated && (
              <Link href="/dashboard/reviews">
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<CheckSquare className="w-4 h-4" />}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-xs"
                >
                  Review Matrix ({pendingCount})
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Elevated Alert: Pending reviews */}
      {isElevated && pendingCount > 0 && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-200/60 dark:bg-amber-900/60 flex items-center justify-center shrink-0 text-amber-800 dark:text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {pendingCount} Academic Submission{pendingCount > 1 ? "s" : ""} Pending Verification
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Department faculty have submitted proof documents ready for coordinator/HOD audit inspection.
              </p>
            </div>
          </div>
          <Link href="/dashboard/reviews">
            <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Review Queue
            </Button>
          </Link>
        </div>
      )}

      {/* Key Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Records
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {totalCount}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Logged across all sessions</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Audit Verified
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {approvedCount}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Ready for NAAC & NIRF</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-800 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Under Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {pendingCount}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Awaiting coordinator stamp</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Drafts / In Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-300">
                {draftCount}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Pending proof attachment</p>
          </div>
        </Card>
      </div>

      {/* Category Breakdown & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Card */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                NAAC & NIRF Accreditation Categories
              </h2>
              <p className="text-xs text-slate-500">Distribution across active evaluation criteria</p>
            </div>
            <Link href="/dashboard/achievements">
              <Button size="xs" variant="ghost" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Journals</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{journalsCount}</div>
                <span className="text-[11px] text-slate-400">Crit. 3.4.5</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Conferences</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{confCount}</div>
                <span className="text-[11px] text-slate-400">Crit. 3.4.6</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Patents</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{patentCount}</div>
                <span className="text-[11px] text-slate-400">Crit. 3.4.3</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">FDPs</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{fdpCount}</div>
                <span className="text-[11px] text-slate-400">Crit. 6.3.3</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Tools & Shortcuts */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Accreditation Tools
            </h2>
            <p className="text-xs text-slate-500 mb-4">Fast actions for institutional compliance</p>

            <div className="space-y-2">
              <Link
                href="/dashboard/achievements/new"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Submit Achievement</p>
                    <p className="text-[10px] text-slate-500">Attach paper or patent proof</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </Link>

              {isElevated && (
                <>
                  <Link
                    href="/dashboard/export"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">NAAC Criteria 3 Studio</p>
                        <p className="text-[10px] text-slate-500">1-click AQAR formatted export</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  </Link>

                  <Link
                    href="/dashboard/bulk-import"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <UploadCloud className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Bulk Spreadsheet Ingest</p>
                        <p className="text-[10px] text-slate-500">Import Excel / ZIP records</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Audit Standard: <strong>NAAC Manual 2026</strong></span>
            <span>R2 Engine: <strong className="text-emerald-500">Active</strong></span>
          </div>
        </Card>
      </div>

      {/* Recent Submissions Feed */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Academic Submissions</h2>
            <p className="text-xs text-slate-500">Latest records logged in the institutional repository</p>
          </div>
          <Link href="/dashboard/achievements">
            <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Submissions
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No submissions recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Get started by submitting your first research paper, patent, or conference record.
            </p>
            <Link href="/dashboard/achievements/new">
              <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Submit Achievement
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivities.map((act) => {
              const hasProof = (act.documents && act.documents.length > 0) || Boolean(act.proof_document);
              return (
                <div
                  key={act.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 rounded-lg px-2 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                      {getCategoryIcon(act.activity_type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/achievements/${act.id}`}
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                        >
                          {act.title}
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="capitalize font-semibold">{act.activity_type}</span>
                        <span>•</span>
                        <span>{act.faculty_name || (user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username)}</span>
                        <span>•</span>
                        <span>{formatDate(act.created_at)}</span>
                        {hasProof ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <Paperclip className="w-3 h-3" /> Proof Attached
                          </span>
                        ) : (
                          <span className="text-amber-500">No proof attached</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {getStatusBadge(act.status)}
                    <Link href={`/dashboard/achievements/${act.id}`}>
                      <Button size="xs" variant="ghost">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
