"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { activitiesApi } from "@/lib/api/activities";
import { structureApi } from "@/lib/api/structure";
import { useAuth } from "@/context/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Activity, ActivityType } from "@/types";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  BookOpen,
  Award,
  TrendingUp,
  FileCheck,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";

export default function ExportStudioPage() {
  const { canExport } = useAuth();
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("approved");
  const [selectedDept, setSelectedDept] = useState<string>("all");

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

  // Fetch Preview Data
  const { data, isLoading } = useQuery({
    queryKey: ["export-preview", selectedSession, selectedCategory, selectedStatus, selectedDept],
    queryFn: () =>
      activitiesApi.getActivities({
        academic_session: selectedSession !== "all" ? selectedSession : undefined,
        activity_type: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        department: selectedDept !== "all" ? selectedDept : undefined,
        page_size: 20,
      }),
  });

  const previewActivities: Activity[] = data?.results || (Array.isArray(data) ? (data as any) : []);
  const totalCount = data?.count ?? previewActivities.length;

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    toast.info("Generating formatted NAAC AQAR Excel workbook...");
    try {
      await activitiesApi.downloadExport({
        academic_session: selectedSession !== "all" ? selectedSession : undefined,
        activity_type: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        department: selectedDept !== "all" ? selectedDept : undefined,
      });
      toast.success("NAAC Criteria 3 workbook downloaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to download export workbook.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <RouteGuard allowed={canExport} requiredRoleName="Faculty with Export Privileges, Coordinator, or Administrator">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            NAAC AQAR Criteria 3 & NIRF Export Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Generate compliant multi-tabbed Excel workbooks formatted according to official NAAC Manual standards.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          isLoading={isDownloading}
          onClick={handleDownload}
          leftIcon={<Download className="w-4 h-4" />}
          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
        >
          Download NAAC Criteria 3 Workbook (.xlsx)
        </Button>
      </div>

      {/* Filter Matrix Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Accreditation Criteria Parameters
            </h2>
          </div>
          <Badge variant="success" size="sm">
            NAAC Manual 2026 Compatible
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Select
              label="Academic Session"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              options={[
                { value: "all", label: "All Recorded Sessions" },
                ...sessions.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
          </div>

          <div>
            <Select
              label="NAAC AQAR Evaluation Metric"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: "all", label: "All Criteria (Criteria 3 & 6)" },
                { value: "journal_publication", label: "Criterion 3.4.5 (Research Journals)" },
                { value: "conference_publication", label: "Criterion 3.4.6 (Conferences/Books)" },
                { value: "patent", label: "Criterion 3.4.3 (Patents Awarded)" },
                { value: "faculty_participation", label: "Criterion 6.3.3 (Faculty Development)" },
              ]}
            />
          </div>

          <div>
            <Select
              label="Audit Verification Filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: "approved", label: "Audit-Ready & Verified Only (Official)" },
                { value: "all", label: "Include Submitted & Under Review (Draft Report)" },
              ]}
            />
          </div>

          <div>
            <Select
              label="Department Scope"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              options={[
                { value: "all", label: "All Institutional Departments" },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Active matching records: <strong>{totalCount}</strong></span>
          <span className="text-[11px] text-slate-400">Columns include DOI links, ISSN, Scopus indexing, and proof status</span>
        </div>
      </Card>

      {/* Live NAAC Table Preview */}
      <Card className="overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Live NAAC AQAR Data Sheet Preview (Top 20 Records)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {previewActivities.length} rows previewed
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : previewActivities.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No verified records match current export parameters
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Try switching the verification filter to "Include Submitted & Under Review" to see draft entries.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Title of Paper / Record</th>
                  <th className="py-2.5 px-3">Name of Author(s)</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Journal / Body</th>
                  <th className="py-2.5 px-3">ISSN / ISBN</th>
                  <th className="py-2.5 px-3">Indexing</th>
                  <th className="py-2.5 px-3">Session</th>
                  <th className="py-2.5 px-3 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {previewActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {act.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {act.faculty_name || "Faculty Member"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {act.faculty_department_name || "Academic"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 max-w-[150px] truncate">
                      {String(
                        act.metadata?.journal_name ||
                          act.metadata?.conference_name ||
                          act.metadata?.organizing_body ||
                          "—"
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {String(
                        act.metadata?.issn ||
                          act.metadata?.isbn ||
                          act.metadata?.patent_number ||
                          "—"
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {act.metadata?.indexing ? (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                          {Array.isArray(act.metadata.indexing)
                            ? act.metadata.indexing.join(", ")
                            : String(act.metadata.indexing)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {act.academic_session_name || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        {act.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      </div>
    </RouteGuard>
  );
}
