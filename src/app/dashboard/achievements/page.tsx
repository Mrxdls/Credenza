"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesApi } from "@/lib/api/activities";
import { structureApi } from "@/lib/api/structure";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Activity, ActivityType, ActivityStatus, UserAchievementSummary } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Award,
  BookOpen,
  FileCheck,
  TrendingUp,
  Search,
  PlusCircle,
  Filter,
  Paperclip,
  ExternalLink,
  Trash2,
  Edit,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Building,
  Lock,
  Unlock,
  Users,
  ArrowLeft,
  ArrowRight,
  Mail,
  Shield,
  Layers,
  FileSpreadsheet,
} from "lucide-react";

function AchievementsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, isTenantAdmin, isHOD, isCoordinator } = useAuth();

  // Selected faculty username (from URL query parameter ?username=<clicked_username>)
  const [selectedUsername, setSelectedUsername] = useState<string>(
    searchParams?.get("username") || ""
  );

  useEffect(() => {
    const uname = searchParams?.get("username") || "";
    setSelectedUsername(uname);
  }, [searchParams]);

  const activeUsername = selectedUsername || searchParams?.get("username") || "";

  // View state: defaults to "directory" so EVERY user sees the list of faculty along with achievements_count!
  const [scope, setScope] = useState<"directory" | "mine" | "all_ledger">("directory");
  const [adminViewMode, setAdminViewMode] = useState<"directory" | "raw">("directory");

  // Filters for activities ledger
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<string>("all");

  // Filters for faculty summary directory
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");

  // Permissions check for institution-wide raw activities
  const canViewAllRaw = Boolean(
    isTenantAdmin ||
    (user?.rank ?? (typeof user?.role === "object" ? user?.role?.rank : undefined) ?? 10) >= 70 ||
    (user?.scope ?? (typeof user?.role === "object" ? user?.role?.scope : undefined)) === "organization"
  );

  // Fetch Academic Sessions for filter
  const { data: sessions = [] } = useQuery({
    queryKey: ["academic-sessions"],
    queryFn: () => structureApi.getAcademicSessions(),
  });

  // Fetch Departments for directory filter
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => structureApi.getDepartments(),
  });

  // Fetch User Achievement Summaries: EVERY user sees the list of faculty along with achievements_count
  const { data: userSummaries = [], isLoading: isLoadingSummaries } = useQuery({
    queryKey: ["user-achievement-summaries", userSearchTerm, selectedDept],
    queryFn: () =>
      activitiesApi.getUserSummary({
        search: userSearchTerm || undefined,
        department_id: selectedDept !== "all" ? selectedDept : undefined,
      }),
  });

  // Selected user summary details (when filtered by username)
  const selectedUserSummary: UserAchievementSummary | undefined = React.useMemo(() => {
    if (!activeUsername) return undefined;
    return userSummaries.find((u) => u.username === activeUsername);
  }, [activeUsername, userSummaries]);

  // Determine whether to fetch raw activity records
  const shouldFetchActivities = Boolean(
    activeUsername ||
    scope === "mine" ||
    (scope === "all_ledger" && canViewAllRaw) ||
    (canViewAllRaw && adminViewMode === "raw")
  );

  // Fetch Activities: when username is active, invokes GET /api/activities/?username=<clicked_username>
  const { data, isLoading: isLoadingActivities, error: activitiesError } = useQuery({
    queryKey: [
      "activities",
      scope,
      activeUsername,
      searchTerm,
      selectedType,
      selectedStatus,
      selectedSession,
      adminViewMode,
    ],
    queryFn: () =>
      activitiesApi.getActivities({
        scope: activeUsername ? undefined : scope === "mine" ? "mine" : "all",
        username: activeUsername || undefined,
        search: searchTerm || undefined,
        activity_type: selectedType !== "all" ? selectedType : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        academic_session: selectedSession !== "all" ? selectedSession : undefined,
        page_size: 100,
      }),
    enabled: shouldFetchActivities,
  });

  const activities: Activity[] = data?.results || (Array.isArray(data) ? (data as any) : []);

  // When a username with can_view_details: true is clicked: invokes GET /api/activities/?username=<clicked_username>
  const handleSelectUser = (uname: string) => {
    setSelectedUsername(uname);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("username", uname);
    router.push(`/dashboard/achievements?${params.toString()}`);
  };

  const handleClearUserFilter = () => {
    setSelectedUsername("");
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("username");
    const qs = params.toString();
    router.push(qs ? `/dashboard/achievements?${qs}` : "/dashboard/achievements");
  };

  // Submit for Review Mutation
  const submitMutation = useMutation({
    mutationFn: (id: string) => activitiesApi.submitActivity(id),
    onSuccess: () => {
      toast.success("Activity submitted for departmental review!");
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-activities"] });
      queryClient.invalidateQueries({ queryKey: ["user-achievement-summaries"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to submit activity for review.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => activitiesApi.deleteActivity(id),
    onSuccess: () => {
      toast.success("Achievement record removed.");
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["all-records"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-activities"] });
      queryClient.invalidateQueries({ queryKey: ["user-achievement-summaries"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.response?.data?.detail || "Cannot delete this record.");
    },
  });

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

  // Summary directory metrics calculation
  const totalFacultyCount = userSummaries.length;
  const totalUploadedCount = userSummaries.reduce((sum, u) => sum + (u.achievements_count || 0), 0);
  const totalApprovedCount = userSummaries.reduce((sum, u) => sum + (u.approved_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Faculty Achievements Repository</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Institutional ledger of journal publications, conference proceedings, patents, and faculty development.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/records">
            <Button variant="outline" leftIcon={<FileSpreadsheet className="w-4 h-4" />}>
              All Records Ledger
            </Button>
          </Link>
          <Link href="/dashboard/achievements/new">
            <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Submit New Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Active User Filter Banner (when filtered by ?username=<clicked_username>) */}
      {activeUsername && (
        <div className="p-4 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {activeUsername.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Faculty-Specific Achievement Ledger</span>
                <Badge variant="info" size="sm">@{activeUsername}</Badge>
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <span>{selectedUserSummary?.display_name || activeUsername}</span>
                {selectedUserSummary?.department?.name && (
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    • {selectedUserSummary.department.name}
                  </span>
                )}
                {selectedUserSummary && (
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    ({selectedUserSummary.achievements_count} uploaded, {selectedUserSummary.approved_count} approved)
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleClearUserFilter}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="shrink-0 bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950"
          >
            Back to Faculty List
          </Button>
        </div>
      )}

      {/* Scope Switcher Tabs: Faculty Directory vs My Achievements */}
      {!activeUsername && (
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScope("directory")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                scope === "directory"
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Faculty Scholars & Records</span>
            </button>

            <button
              onClick={() => setScope("mine")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                scope === "mine"
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Award className="w-3.5 h-3.5" />
              <span>My Achievements</span>
            </button>
          </div>

          <Link href="/dashboard/records">
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-bold"
            >
              View Institutional Ledger &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* VIEW CASE 1: FACULTY ACHIEVEMENTS DIRECTORY */}
      {/* Every user sees the list of faculty along with achievements_count.
          Inspect can_view_details:
          - If can_view_details: false: Display just the count / number (not clickable). Username is plain text (not clickable).
          - If can_view_details: true: Render the username as a clickable link or button that invokes:
            GET /api/activities/?username=<clicked_username>
      */}
      {!activeUsername && scope === "directory" && (
        <div className="space-y-4">
          {/* Metrics bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Faculty Scholars
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {totalFacultyCount}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-900 border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Uploads
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {totalUploadedCount}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-100 dark:border-emerald-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Audit Approved
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {totalApprovedCount}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>

          {/* Directory Filter Bar */}
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search faculty by name, username, email, or employee ID..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div>
                <Select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  options={[
                    { value: "all", label: "All Departments" },
                    ...departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` })),
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* Faculty Achievement Summary Table */}
          <Card className="overflow-hidden">
            {isLoadingSummaries ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : userSummaries.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No faculty records found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {userSearchTerm || selectedDept !== "all"
                    ? "No faculty matched your directory search filters."
                    : "No faculty accounts have uploaded records yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Faculty Member / Username</th>
                      <th className="py-3 px-4">Department & Designation</th>
                      <th className="py-3 px-4">Institutional Role</th>
                      <th className="py-3 px-4 text-center">Uploaded Achievements</th>
                      <th className="py-3 px-4 text-center">Audit Approved</th>
                      <th className="py-3 px-4 text-right">Detailed Record Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {userSummaries.map((u) => {
                      const hasAccess = u.can_view_details;

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors"
                        >
                          {/* Faculty Member / Username:
                              Inspect can_view_details:
                              - If can_view_details: true -> Render username as a clickable link or button that invokes GET /api/activities/?username=<clicked_username>
                              - If can_view_details: false -> Plain text (not clickable)
                          */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
                                {u.username.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                {hasAccess ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectUser(u.username)}
                                    className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors text-left cursor-pointer flex items-center gap-1 group"
                                    title={`View achievements for @${u.username}`}
                                  >
                                    <span>@{u.username}</span>
                                    <ArrowRight className="w-3 h-3 text-indigo-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                  </button>
                                ) : (
                                  <span
                                    className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 cursor-default select-none"
                                    title="Achievement record access is restricted"
                                  >
                                    @{u.username}
                                  </span>
                                )}
                                <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5">
                                  {u.display_name}
                                </span>
                                {u.employee_id && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ID: {u.employee_id}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Department & Designation */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {u.department?.name || "Unassigned"}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {u.designation || "Faculty Member"}
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                              {u.role || "Faculty"}
                            </span>
                          </td>

                          {/* Uploaded Achievements Count:
                              Inspect can_view_details:
                              - If can_view_details: false: Display just the count / number (not clickable)
                              - If can_view_details: true: Clickable link/button that invokes GET /api/activities/?username=<clicked_username>
                          */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-center">
                            {hasAccess ? (
                              <button
                                type="button"
                                onClick={() => handleSelectUser(u.username)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors cursor-pointer group"
                                title={`Click to view all ${u.achievements_count} achievements for @${u.username}`}
                              >
                                <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span>{u.achievements_count}</span>
                                <ArrowRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-default select-none"
                                title="Achievement details restricted. Displaying count only."
                              >
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>{u.achievements_count}</span>
                              </span>
                            )}
                          </td>

                          {/* Approved Count */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                              {u.approved_count}
                            </span>
                          </td>

                          {/* Detailed Record Access Action */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            {hasAccess ? (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleSelectUser(u.username)}
                                leftIcon={<Eye className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                                className="bg-indigo-50/50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                              >
                                View Records ({u.achievements_count})
                              </Button>
                            ) : (
                              <div
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 cursor-default select-none"
                                title="Achievement details restricted to department reviewers and administrators. Aggregated counts shown."
                              >
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>Count Only (Restricted)</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer info */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span>Displaying {userSummaries.length} faculty profiles</span>
              <span className="text-[11px] text-slate-400">
                Detailed record inspection requires coordinator or administrator privileges
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* VIEW CASE 2: RAW ACTIVITIES LEDGER */}
      {/* Renders when: filtering by specific user (?username=<clicked_username>), or viewing "mine", or admin explicitly viewing all submissions ledger */}
      {(Boolean(activeUsername) || scope === "mine" || scope === "all_ledger") && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Input
                  placeholder="Search title, DOI, or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  options={[
                    { value: "all", label: "All Categories" },
                    { value: "journal_publication", label: "Journal Publications (3.4.5)" },
                    { value: "conference_publication", label: "Conference Proceedings (3.4.6)" },
                    { value: "patent", label: "Patents (3.4.3)" },
                    { value: "faculty_participation", label: "FDP & Workshops (6.3.3)" },
                  ]}
                />
              </div>

              <div>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "approved", label: "Audit Ready (Approved)" },
                    { value: "submitted", label: "Submitted for Review" },
                    { value: "under_review", label: "Under Review" },
                    { value: "draft", label: "Draft (In Progress)" },
                    { value: "rejected", label: "Needs Revision (Rejected)" },
                  ]}
                />
              </div>

              <div>
                <Select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  options={[
                    { value: "all", label: "All Academic Sessions" },
                    ...sessions.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* Data Table */}
          <Card className="overflow-hidden">
            {isLoadingActivities ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No academic records found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  {activeUsername
                    ? `No achievements were found for @${activeUsername} matching your search filters.`
                    : searchTerm || selectedType !== "all" || selectedStatus !== "all"
                    ? "No submissions matched your search filters. Try clearing your filters."
                    : "You haven't recorded any achievements yet. Begin by adding your first publication."}
                </p>
                {activeUsername ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearUserFilter}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Return to Faculty Directory
                  </Button>
                ) : (
                  <Link href="/dashboard/achievements/new">
                    <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                      Submit Achievement
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Record Title & Metadata</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Faculty / Author</th>
                      <th className="py-3 px-4">Session</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Proof</th>
                      <th className="py-3 px-4 text-right sticky right-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activities.map((act) => {
                      const hasProof =
                        (act.documents && act.documents.length > 0) || Boolean(act.proof_document);
                      const facultyId = typeof act.faculty === "object" ? (act.faculty as any)?.id : act.faculty;
                      const isOwner = Boolean(user?.id && facultyId === user.id);
                      const canManage = isOwner || isTenantAdmin || isHOD || isCoordinator;
                      const canEdit = act.status !== "approved" && canManage;
                      const canDelete = act.status !== "approved" && canManage;

                      return (
                        <tr
                          key={act.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors"
                        >
                          {/* Title & Metadata */}
                          <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
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
                                  Patent #{String(act.metadata.patent_number)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {getTypeIcon(act.activity_type)}
                              <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                                {act.activity_type}
                              </span>
                            </div>
                          </td>

                          {/* Faculty / Author */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {act.faculty_name || (user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {act.faculty_department_name || user?.department?.name || "Academic Dept"}
                            </div>
                          </td>

                          {/* Session */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                            {act.academic_session_name || "—"}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {getStatusBadge(act.status)}
                          </td>

                          {/* Proof Document */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {hasProof ? (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                                <Paperclip className="w-3 h-3" />
                                <span>Attached</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                                <AlertCircle className="w-3 h-3" />
                                <span>Missing</span>
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-right sticky right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]">
                            <div className="inline-flex items-center gap-1">
                              <Link href={`/dashboard/achievements/${act.id}`}>
                                <button
                                  title="View Record Details"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </Link>

                              {act.status === "draft" && hasProof && isOwner && (
                                <button
                                  onClick={() => submitMutation.mutate(act.id)}
                                  disabled={submitMutation.isPending}
                                  title="Submit for Review"
                                  className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors cursor-pointer"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}

                              {canEdit && (
                                <Link href={`/dashboard/achievements/${act.id}`}>
                                  <button
                                    title="Edit Record"
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </Link>
                              )}

                              {canDelete && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${act.title}"?`)) {
                                      deleteMutation.mutate(act.id);
                                    }
                                  }}
                                  disabled={deleteMutation.isPending}
                                  title="Delete Record"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer info */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span>Showing {activities.length} achievements</span>
              <span className="text-[11px] text-slate-400">
                Locked records cannot be edited without Coordinator or Administrator override
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <AchievementsPageContent />
    </Suspense>
  );
}
