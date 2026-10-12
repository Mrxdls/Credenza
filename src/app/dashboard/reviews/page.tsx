"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesApi } from "@/lib/api/activities";
import { documentsApi } from "@/lib/api/documents";
import { useAuth } from "@/context/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Drawer } from "@/components/ui/Drawer";
import { Modal } from "@/components/ui/Modal";
import { Activity, ActivityStatus, ActivityType } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  CheckSquare,
  Square,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Paperclip,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Award,
  TrendingUp,
  FileCheck,
  User,
  Building,
  Calendar,
  Lock,
  ArrowRight,
  Filter,
  Download,
  FileText,
} from "lucide-react";

export default function ReviewMatrixPage() {
  const queryClient = useQueryClient();
  const { user, isTenantAdmin, isDean, isHOD, isCoordinator, canApprove } = useAuth();

  const [activeTab, setActiveTab] = useState<"pending" | "under_review" | "approved" | "rejected">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Selection state for batch operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Split-Screen Review Drawer state
  const [reviewActivity, setReviewActivity] = useState<Activity | null>(null);

  // Batch rejection modal
  const [batchRejectModalOpen, setBatchRejectModalOpen] = useState(false);
  const [batchRejectionReason, setBatchRejectionReason] = useState("");

  // Single rejection modal inside drawer
  const [singleRejectModalOpen, setSingleRejectModalOpen] = useState(false);
  const [singleRejectionReason, setSingleRejectionReason] = useState("");

  // Determine query status parameter
  const statusParam =
    activeTab === "pending"
      ? undefined // will filter client-side for submitted + under_review
      : activeTab;

  // Fetch activities
  const { data, isLoading } = useQuery({
    queryKey: ["review-activities", activeTab, searchTerm, selectedCategory],
    queryFn: () =>
      activitiesApi.getActivities({
        status: statusParam,
        search: searchTerm || undefined,
        activity_type: selectedCategory !== "all" ? selectedCategory : undefined,
        page_size: 150,
      }),
  });

  const allActivities: Activity[] = data?.results || (Array.isArray(data) ? (data as any) : []);

  // Filter pending items
  const activities =
    activeTab === "pending"
      ? allActivities.filter((a) => a.status === "submitted" || a.status === "under_review")
      : allActivities;

  // Select all handler
  const handleSelectAll = () => {
    if (selectedIds.length === activities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activities.map((a) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Batch Status Update Mutation
  const batchUpdateMutation = useMutation({
    mutationFn: (payload: { status: ActivityStatus; reason?: string }) =>
      activitiesApi.batchStatusUpdate({
        activity_ids: selectedIds,
        status: payload.status,
        rejection_reason: payload.reason,
        verification_notes: payload.reason,
        verify_documents: payload.status === "approved",
      }),
    onSuccess: (res, vars) => {
      toast.success(`Batch updated ${res.updated_count || selectedIds.length} achievements to '${vars.status}'.`);
      setSelectedIds([]);
      setBatchRejectModalOpen(false);
      setBatchRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["review-activities"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-activities"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Batch update failed.");
    },
  });

  // Single Approve Mutation
  const singleApproveMutation = useMutation({
    mutationFn: (id: string) => activitiesApi.approveActivity(id),
    onSuccess: () => {
      toast.success("Record approved and locked for accreditation!");
      setReviewActivity(null);
      queryClient.invalidateQueries({ queryKey: ["review-activities"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-activities"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Approval failed.");
    },
  });

  // Single Reject Mutation
  const singleRejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      activitiesApi.rejectActivity(id, reason),
    onSuccess: () => {
      toast.success("Revision requested from faculty member.");
      setSingleRejectModalOpen(false);
      setSingleRejectionReason("");
      setReviewActivity(null);
      queryClient.invalidateQueries({ queryKey: ["review-activities"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-activities"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Rejection failed.");
    },
  });

  // Single Mark Under Review Mutation
  const markUnderReviewMutation = useMutation({
    mutationFn: (id: string) =>
      activitiesApi.batchStatusUpdate({
        activity_ids: [id],
        status: "under_review",
      }),
    onSuccess: () => {
      toast.success("Record marked as under review.");
      if (reviewActivity) {
        setReviewActivity({ ...reviewActivity, status: "under_review" });
      }
      queryClient.invalidateQueries({ queryKey: ["review-activities"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update status.");
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

  return (
    <RouteGuard allowed={canApprove} requiredRoleName="Department Coordinator, HOD, Dean, or Administrator">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Accreditation Review & Verification Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit, cross-examine proofs, and batch-certify submissions for NAAC AQAR & NIRF data submission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            Coordinator Review Mode
          </Badge>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab("pending");
              setSelectedIds([]);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "pending"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Pending Verification Queue
          </button>

          <button
            onClick={() => {
              setActiveTab("approved");
              setSelectedIds([]);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "approved"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Audit-Ready (Approved)
          </button>

          <button
            onClick={() => {
              setActiveTab("rejected");
              setSelectedIds([]);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "rejected"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Needs Revision
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-48 sm:w-64">
            <Input
              placeholder="Search author or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
            />
          </div>

          <div className="w-40">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: "all", label: "All Categories" },
                { value: "journal_publication", label: "Journals" },
                { value: "conference_publication", label: "Conferences" },
                { value: "patent", label: "Patents" },
                { value: "faculty_participation", label: "FDPs" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Floating Batch Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white dark:bg-indigo-950 border border-indigo-700 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold">
              {selectedIds.length} Record{selectedIds.length !== 1 ? "s" : ""} Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setSelectedIds([])}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Clear Selection
            </Button>

            <Button
              size="xs"
              variant="outline"
              disabled={batchUpdateMutation.isPending}
              onClick={() => batchUpdateMutation.mutate({ status: "under_review" })}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/30"
              leftIcon={<Clock className="w-3.5 h-3.5" />}
            >
              Mark Under Review
            </Button>

            <Button
              size="xs"
              variant="outline"
              disabled={batchUpdateMutation.isPending}
              onClick={() => setBatchRejectModalOpen(true)}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border-rose-400/30"
              leftIcon={<XCircle className="w-3.5 h-3.5" />}
            >
              Reject Selected
            </Button>

            <Button
              size="xs"
              variant="primary"
              disabled={batchUpdateMutation.isPending}
              onClick={() => batchUpdateMutation.mutate({ status: "approved" })}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-0 shadow-md"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Mass Approve & Lock
            </Button>
          </div>
        </div>
      )}

      {/* Verification Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No records in this verification state
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {activeTab === "pending"
                ? "All submitted achievements in your department have been reviewed. Outstanding work!"
                : "No matching records found for this status."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="p-1 hover:text-slate-900 dark:hover:text-white"
                    >
                      {selectedIds.length > 0 && selectedIds.length === activities.length ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Achievement & Bibliographic Info</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Submitting Faculty</th>
                  <th className="py-3 px-4">Proof Attachment</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activities.map((act) => {
                  const isSelected = selectedIds.includes(act.id);
                  const hasProof =
                    (act.documents && act.documents.length > 0) || Boolean(act.proof_document);
                  const isRowSelfAuthored = Boolean(
                    user?.id && (
                      (typeof act.faculty === "object" && (act.faculty as any)?.id === user.id) ||
                      act.faculty === user.id ||
                      (act as any).faculty_id === user.id
                    )
                  );

                  return (
                    <tr
                      key={act.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors ${
                        isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isRowSelfAuthored && activeTab !== "approved"}
                          title={isRowSelfAuthored ? "Self-authored records cannot be self-approved." : undefined}
                          onChange={() => toggleSelect(act.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <button
                          onClick={() => setReviewActivity(act)}
                          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left line-clamp-2"
                        >
                          {act.title}
                        </button>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          {act.metadata?.journal_name && (
                            <span className="truncate max-w-[180px] italic">
                              {act.metadata.journal_name}
                            </span>
                          )}
                          {act.metadata?.doi && (
                            <span className="font-mono text-indigo-600 dark:text-indigo-400">
                              DOI: {act.metadata.doi}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {getTypeIcon(act.activity_type)}
                          <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                            {act.activity_type}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {act.faculty_name || "Faculty Member"}
                          </div>
                          {isRowSelfAuthored && (
                            <Badge variant="warning" size="sm">Self-Authored</Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {act.faculty_department_name || user?.department?.name || "Department"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {hasProof ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            <Paperclip className="w-3 h-3" /> Attached
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                            <AlertTriangle className="w-3 h-3" /> Missing Proof
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(act.status)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setReviewActivity(act)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Review & Verify
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Split-Screen Review Drawer */}
      {reviewActivity && (
        <Drawer
          isOpen={Boolean(reviewActivity)}
          onClose={() => setReviewActivity(null)}
          size="2xl"
          title={`Accreditation Inspection: ${reviewActivity.title}`}
          description={`Submitted by ${reviewActivity.faculty_name || "Faculty"} • Category: ${reviewActivity.activity_type.toUpperCase()}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-slate-500">
                Current Status: <strong>{reviewActivity.status.toUpperCase()}</strong>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSingleRejectModalOpen(true)}
                  className="text-rose-600 border-rose-300 dark:border-rose-900"
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Request Revisions
                </Button>

                {reviewActivity.status !== "under_review" && (
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={markUnderReviewMutation.isPending}
                    onClick={() => markUnderReviewMutation.mutate(reviewActivity.id)}
                    leftIcon={<Clock className="w-4 h-4 text-amber-500" />}
                  >
                    Mark Under Review
                  </Button>
                )}

                {(() => {
                  const isReviewActivitySelfAuthored = Boolean(
                    reviewActivity && user?.id && (
                      (typeof reviewActivity.faculty === "object" && (reviewActivity.faculty as any)?.id === user.id) ||
                      reviewActivity.faculty === user.id ||
                      (reviewActivity as any).faculty_id === user.id
                    )
                  );

                  return (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={singleApproveMutation.isPending}
                      disabled={(!reviewActivity.documents?.length && !reviewActivity.proof_document) || isReviewActivitySelfAuthored}
                      title={isReviewActivitySelfAuthored ? "Self-approval is strictly prohibited by accreditation policy." : undefined}
                      onClick={() => singleApproveMutation.mutate(reviewActivity.id)}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      className={isReviewActivitySelfAuthored ? "bg-slate-400 cursor-not-allowed text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"}
                    >
                      {isReviewActivitySelfAuthored ? "Peer Review Required" : "Approve & Certify"}
                    </Button>
                  );
                })()}
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Pane: Bibliographic Metadata */}
            <div className="space-y-5 overflow-y-auto pr-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Full Title
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {reviewActivity.title}
                </h3>
                {reviewActivity.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                    {reviewActivity.description}
                  </p>
                )}
              </div>

              {/* Specific metadata breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Accreditation Parameters
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {reviewActivity.metadata?.journal_name && (
                    <div className="col-span-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400">Journal Name</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {String(reviewActivity.metadata.journal_name)}
                      </p>
                    </div>
                  )}

                  {reviewActivity.metadata?.doi && (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400">DOI</span>
                      <p className="font-mono text-indigo-600 dark:text-indigo-400 truncate">
                        {String(reviewActivity.metadata.doi)}
                      </p>
                    </div>
                  )}

                  {reviewActivity.metadata?.issn && (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400">ISSN</span>
                      <p className="font-mono text-slate-800 dark:text-slate-200">
                        {String(reviewActivity.metadata.issn)}
                      </p>
                    </div>
                  )}

                  {reviewActivity.metadata?.patent_number && (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400">Patent Number</span>
                      <p className="font-mono text-emerald-600 dark:text-emerald-400">
                        #{String(reviewActivity.metadata.patent_number)}
                      </p>
                    </div>
                  )}

                  {reviewActivity.metadata?.indexing && (
                    <div className="col-span-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400">Indexing Stamped</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(reviewActivity.metadata.indexing)
                          ? reviewActivity.metadata.indexing.map((i: string) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold"
                              >
                                {i}
                              </span>
                            ))
                          : String(reviewActivity.metadata.indexing)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Pane: Authenticated Proof Document Inspection */}
            <div className="flex flex-col h-full rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950">
              <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                  Audit Proof Document ({reviewActivity.documents?.length || 0})
                </span>

                {reviewActivity.documents && reviewActivity.documents[0] && (
                  <button
                    type="button"
                    onClick={() => {
                      const docId = reviewActivity.documents?.[0]?.id;
                      if (docId) window.open(documentsApi.getViewUrl(docId), "_blank");
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  >
                    Open in New Window <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex-1 min-h-[400px] flex flex-col justify-center p-4">
                {reviewActivity.documents?.[0] ? (
                  (() => {
                    const doc = reviewActivity.documents[0];
                    const isImg = Boolean(doc.mime_type?.startsWith("image/") || doc.file_name?.match(/\.(png|jpe?g|webp)$/i));

                    return (
                      <div className="flex flex-col h-full justify-between space-y-4">
                        {/* Document Metadata Card */}
                        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                                  {doc.title || doc.file_name || "Supporting Proof"}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : "File attached"} • {doc.document_type || "published_paper"}
                                </p>
                              </div>
                            </div>
                            <Badge variant={doc.is_verified ? "success" : "warning"} size="sm">
                              {doc.is_verified ? "Verified" : "Pending Verification"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="xs"
                              variant="primary"
                              onClick={() => window.open(documentsApi.getViewUrl(doc.id), "_blank")}
                              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                              className="flex-1"
                            >
                              Inspect Document
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  toast.loading("Downloading proof document...", { id: `dl-${doc.id}` });
                                  await documentsApi.downloadDocument(doc.id, doc.file_name || "proof_document");
                                  toast.success("Download started", { id: `dl-${doc.id}` });
                                } catch (err: any) {
                                  toast.error(err.message || "Download failed", { id: `dl-${doc.id}` });
                                }
                              }}
                              leftIcon={<Download className="w-3.5 h-3.5" />}
                            >
                              Download
                            </Button>
                          </div>
                        </div>

                        {/* Visual Display or Verification Box */}
                        <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-4 bg-white/50 dark:bg-slate-900/40">
                          {isImg ? (
                            <img
                              src={documentsApi.getViewUrl(doc.id)}
                              alt="Proof Document"
                              className="max-h-[300px] object-contain rounded border border-slate-200 dark:border-slate-800 shadow-xs"
                            />
                          ) : (
                            <div className="text-center py-6 px-4">
                              <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-2 opacity-80" />
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Digital Certificate / PDF Manuscript
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 mb-3">
                                To ensure security and prevent clickjacking, embedded PDFs are viewed via authenticated viewer tab.
                              </p>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => window.open(documentsApi.getViewUrl(doc.id), "_blank")}
                                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                              >
                                Open in Secure Viewer
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center p-6">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No document attachment found
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      Under NAAC accreditation regulations, achievements without verified certificates cannot be approved.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* Batch Rejection Modal */}
      <Modal
        isOpen={batchRejectModalOpen}
        onClose={() => setBatchRejectModalOpen(false)}
        title={`Request Revisions on ${selectedIds.length} Selected Submissions`}
        description="Provide a uniform audit revision notice that will be recorded across all selected achievements."
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Audit Comments / Revision Instructions
            </label>
            <textarea
              rows={3}
              value={batchRejectionReason}
              onChange={(e) => setBatchRejectionReason(e.target.value)}
              placeholder="e.g. Please re-upload proof document with clear ISSN and publisher details visible."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setBatchRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!batchRejectionReason.trim()}
              isLoading={batchUpdateMutation.isPending}
              onClick={() =>
                batchUpdateMutation.mutate({
                  status: "rejected",
                  reason: batchRejectionReason.trim(),
                })
              }
            >
              Submit Batch Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Single Rejection Modal inside Drawer */}
      <Modal
        isOpen={singleRejectModalOpen}
        onClose={() => setSingleRejectModalOpen(false)}
        title="Request Revisions from Faculty"
        description="Provide specific comments explaining why this submission requires revision."
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Audit Comments
            </label>
            <textarea
              rows={3}
              value={singleRejectionReason}
              onChange={(e) => setSingleRejectionReason(e.target.value)}
              placeholder="e.g. Paper title in the proof PDF does not match the entered title."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setSingleRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!singleRejectionReason.trim()}
              isLoading={singleRejectMutation.isPending}
              onClick={() => {
                if (reviewActivity) {
                  singleRejectMutation.mutate({
                    id: reviewActivity.id,
                    reason: singleRejectionReason.trim(),
                  });
                }
              }}
            >
              Send Revision Request
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </RouteGuard>
  );
}
