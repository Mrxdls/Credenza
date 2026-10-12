"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { Activity, ActivityType, ActivityStatus } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Award,
  BookOpen,
  FileCheck,
  TrendingUp,
  Search,
  PlusCircle,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Building,
  Paperclip,
  ExternalLink,
  Trash2,
} from "lucide-react";

export default function AllRecordsPage() {
  const { user, isTenantAdmin, isHOD, isCoordinator } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<string>("all");

  // Fetch Academic Sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ["academic-sessions"],
    queryFn: () => structureApi.getAcademicSessions(),
  });

  // Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => structureApi.getDepartments(),
  });

  // Fetch All Activities (Institutional Ledger)
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "all-records",
      searchTerm,
      selectedType,
      selectedStatus,
      selectedDept,
      selectedSession,
    ],
    queryFn: () =>
      activitiesApi.getActivities({
        scope: "all",
        search: searchTerm || undefined,
        activity_type: selectedType !== "all" ? selectedType : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        department: selectedDept !== "all" ? selectedDept : undefined,
        academic_session: selectedSession !== "all" ? selectedSession : undefined,
        page_size: 100,
      }),
  });

  const activities: Activity[] = data?.results || (Array.isArray(data) ? (data as any) : []);

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => activitiesApi.deleteActivity(id),
    onSuccess: () => {
      toast.success("Achievement record removed.");
      queryClient.invalidateQueries({ queryKey: ["all-records"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
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
            <XCircle className="w-3 h-3" /> Revision Needed
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            Draft
          </Badge>
        );
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

  const getTypeLabel = (type: ActivityType | string) => {
    switch (type) {
      case "journal":
      case "journal_publication":
        return "Journal Article";
      case "conference":
      case "conference_publication":
        return "Conference Proceeding";
      case "patent":
        return "Patent / IP";
      case "fdp":
      case "faculty_participation":
        return "FDP / Workshop";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Institutional Achievements Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Complete institutional archive of journal publications, conference proceedings, patents, and faculty development.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/export">
            <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet className="w-4 h-4" />}>
              NAAC Export
            </Button>
          </Link>
          <Link href="/dashboard/achievements/new">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Submit Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by title, faculty, or employee ID..."
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
                { value: "all", label: "All Activity Types" },
                { value: "journal_publication", label: "Journal Articles (Crit. 3.4.5)" },
                { value: "conference_publication", label: "Conference Proceedings (Crit. 3.4.6)" },
                { value: "patent", label: "Patents (Crit. 3.4.3)" },
                { value: "faculty_participation", label: "FDP & Workshops (Crit. 6.3.3)" },
              ]}
            />
          </div>

          <div>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: "all", label: "All Audit Statuses" },
                { value: "approved", label: "Audit Ready (Approved)" },
                { value: "submitted", label: "Submitted" },
                { value: "under_review", label: "Under Review" },
                { value: "rejected", label: "Revision Needed" },
                { value: "draft", label: "Drafts" },
              ]}
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

      {/* Activities Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 px-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Unable to load institutional ledger
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {(error as any)?.response?.data?.detail || "You may need reviewer or admin permissions to view all institutional records."}
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No achievement records found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search criteria or submit a new faculty record.
            </p>
            <Link href="/dashboard/achievements/new">
              <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Submit Achievement Record
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Achievement Title & Category</th>
                  <th className="py-3 px-4">Faculty Scholar</th>
                  <th className="py-3 px-4">Academic Session</th>
                  <th className="py-3 px-4 text-center">Proofs</th>
                  <th className="py-3 px-4">Audit Status</th>
                  <th className="py-3 px-4 text-right sticky right-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activities.map((act) => {
                  const facultyId = typeof act.faculty === "object" ? act.faculty?.id : act.faculty;
                  const isOwner = Boolean(user?.id && facultyId === user.id);
                  const userDeptId = typeof user?.department === "object" ? user?.department?.id : (user as any)?.department_id;
                  const userDeptName = typeof user?.department === "object" ? user?.department?.name : undefined;
                  const isDeptManager = Boolean(
                    (isHOD || isCoordinator) &&
                    ((userDeptName && (act.department_name === userDeptName || act.faculty_department_name === userDeptName)) ||
                     (userDeptId && (act as any)?.department_id === userDeptId))
                  );
                  const canDelete = act.status !== "approved" && (isOwner || isTenantAdmin || isDeptManager);

                  return (
                    <tr
                      key={act.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                            {getTypeIcon(act.activity_type)}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/achievements/${act.id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 text-xs sm:text-sm"
                            >
                              {act.title}
                            </Link>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {getTypeLabel(act.activity_type)}
                              </span>
                              <span>•</span>
                              <span>{formatDate(act.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">
                          {act.faculty_name || "Faculty Member"}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{act.department_name || "Unassigned"}</span>
                          {act.faculty_employee_id && (
                            <span className="font-mono text-[10px] text-slate-400">
                              [{act.faculty_employee_id}]
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-300">
                        {act.session_name || "Current Session"}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        {act.documents && act.documents.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                            <Paperclip className="w-3 h-3" />
                            <span>{act.documents.length}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(act.status)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right sticky right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Link href={`/dashboard/achievements/${act.id}`}>
                            <Button size="xs" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                              View Details
                            </Button>
                          </Link>
                          {canDelete && (
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${act.title}"?`)) {
                                  deleteMutation.mutate(act.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
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
      </Card>
    </div>
  );
}

