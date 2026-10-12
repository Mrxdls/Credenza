"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesApi } from "@/lib/api/activities";
import { documentsApi } from "@/lib/api/documents";
import { structureApi } from "@/lib/api/structure";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { CustomFieldsEditor, CustomFieldItem } from "@/components/achievements/CustomFieldsEditor";
import { ActivityStatus, ActivityType, ActivityMetadata, ActivityDocument } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Award,
  BookOpen,
  FileCheck,
  TrendingUp,
  FileText,
  Paperclip,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Send,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Building,
  Globe,
  UploadCloud,
  Edit3,
  X,
  Sparkles,
  KeyRound,
  Save,
  Download,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Layers,
  Check,
  CheckCircle2,
  Users,
  GraduationCap,
  Briefcase,
} from "lucide-react";

// Standard metadata keys to distinguish from user-defined custom attributes
const DISPLAYED_META_KEYS = new Set([
  "description",
  "journal_name", "name_of_journal",
  "issn", "isbn_issn_(if_applicable)",
  "doi",
  "volume", "volume_no",
  "issue", "issue_no",
  "page_numbers", "page_no",
  "publication_date", "date_of_publication",
  "indexing",
  "conference_name", "name_of_conference",
  "proceedings_name", "proceedings_title",
  "isbn",
  "location", "conference_location_(if_applicable)",
  "conference_date", "date_of_conference",
  "publisher", "name_of_the_publisher",
  "types_of_conference_(national_conference",
  "publication_through_conference_(yes_no)",
  "patent_number", "patent_or_application_number", "application_number",
  "patent_status",
  "country",
  "filing_date",
  "grant_date",
  "program_title", "title_of_the_program",
  "organizing_body", "organized_by",
  "fdp_type", "type_of_program_(fdp__workshop_conferenc",
  "start_date",
  "end_date",
  "duration_days", "duration_of_the_program",
  "authors_name_in_sequence_as_shown_in_pub",
  "name_of_faculty",
  "current_designation",
  "affiliating_institute_at_the_time_of_pub",
  "deparment", "emp_id", "s_no", "sr_no", "session"
]);

export default function AchievementDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;
  const { user, isCoordinator, isHOD, isTenantAdmin, isDean } = useAuth();
  const isElevated = isTenantAdmin || isDean || isHOD || isCoordinator;

  // Editing mode state
  const [isEditing, setIsEditing] = useState(searchParams?.get("edit") === "true");

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Request Access modal state
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessReason, setAccessReason] = useState("");

  // Edit form state
  const [title, setTitle] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [activityType, setActivityType] = useState<string>("journal_publication");
  const [description, setDescription] = useState("");

  // Journal specific form state
  const [journalName, setJournalName] = useState("");
  const [issn, setIssn] = useState("");
  const [doi, setDoi] = useState("");
  const [volume, setVolume] = useState("");
  const [issue, setIssue] = useState("");
  const [pageNumbers, setPageNumbers] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [indexing, setIndexing] = useState<string[]>([]);
  const [isEnrichingDoi, setIsEnrichingDoi] = useState(false);

  // Conference specific form state
  const [conferenceName, setConferenceName] = useState("");
  const [proceedingsName, setProceedingsName] = useState("");
  const [isbn, setIsbn] = useState("");
  const [location, setLocation] = useState("");
  const [conferenceDate, setConferenceDate] = useState("");
  const [publisher, setPublisher] = useState("");

  // Patent specific form state
  const [patentNumber, setPatentNumber] = useState("");
  const [patentStatus, setPatentStatus] = useState("filed");
  const [country, setCountry] = useState("India");
  const [filingDate, setFilingDate] = useState("");
  const [grantDate, setGrantDate] = useState("");

  // FDP specific form state
  const [programTitle, setProgramTitle] = useState("");
  const [organizingBody, setOrganizingBody] = useState("");
  const [fdpType, setFdpType] = useState("attended");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [durationDays, setDurationDays] = useState<number>(5);
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);

  // New Proof upload state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Fetch record
  const { data: activity, isLoading, error } = useQuery({
    queryKey: ["activity", id],
    queryFn: () => activitiesApi.getActivity(id),
    enabled: Boolean(id),
  });

  // Fetch academic sessions for dropdown
  const { data: sessions = [] } = useQuery({
    queryKey: ["academic-sessions"],
    queryFn: () => structureApi.getAcademicSessions(),
  });

  // Fetch attached documents
  const { data: queriedDocuments = [] } = useQuery({
    queryKey: ["activity-documents", id],
    queryFn: () => documentsApi.getDocuments({ activity: id }),
    enabled: Boolean(id),
  });

  // Prefill edit form state when activity is loaded
  useEffect(() => {
    if (activity) {
      setTitle(activity.title || "");
      const sessId = typeof activity.academic_session === "object"
        ? (activity.academic_session as any)?.id
        : activity.academic_session;
      setAcademicSession(sessId || "");
      setActivityType(activity.activity_type || "journal_publication");
      setDescription(activity.description || (activity.metadata?.description as string) || "");

      const m = (activity.metadata || {}) as Record<string, any>;
      setJournalName(String(m.journal_name || m.name_of_journal || ""));
      setIssn(String(m.issn || m["isbn_issn_(if_applicable)"] || ""));
      setDoi(String(m.doi || ""));
      setVolume(String(m.volume || m.volume_no || ""));
      setIssue(String(m.issue || m.issue_no || ""));
      setPageNumbers(String(m.page_numbers || m.page_no || ""));
      setPublicationDate(String(m.publication_date || m.date_of_publication || ""));
      if (Array.isArray(m.indexing)) {
        setIndexing(m.indexing.map(String));
      } else if (typeof m.indexing === "string" && m.indexing) {
        setIndexing(m.indexing.split(",").map((s: string) => s.trim()));
      } else {
        setIndexing([]);
      }

      setConferenceName(String(m.conference_name || m.name_of_conference || ""));
      setProceedingsName(String(m.proceedings_name || m.proceedings_title || ""));
      setIsbn(String(m.isbn || m["isbn_issn_(if_applicable)"] || ""));
      setLocation(String(m.location || m["conference_location_(if_applicable)"] || ""));
      setConferenceDate(String(m.conference_date || m.date_of_conference || ""));
      setPublisher(String(m.publisher || m.name_of_the_publisher || ""));

      setPatentNumber(String(m.patent_number || m.patent_or_application_number || m.application_number || ""));
      const rawPatentStatus = String(m.patent_status || "Filed");
      setPatentStatus(rawPatentStatus.charAt(0).toUpperCase() + rawPatentStatus.slice(1).toLowerCase());
      setCountry(String(m.country || "India"));
      setFilingDate(String(m.filing_date || ""));
      setGrantDate(String(m.grant_date || ""));

      setProgramTitle(String(m.program_title || m.title_of_the_program || activity.title || ""));
      setOrganizingBody(String(m.organizing_body || m.organized_by || ""));
      setFdpType(String(m.fdp_type || m["type_of_program_(fdp__workshop_conferenc"] || "attended"));
      setStartDate(String(m.start_date || ""));
      setEndDate(String(m.end_date || ""));
      setDurationDays(Number(m.duration_days || m.duration_of_the_program) || 5);

      // Extract user-defined dynamic custom fields
      const existingCustom: CustomFieldItem[] = [];
      Object.entries(m).forEach(([k, v]) => {
        if (!DISPLAYED_META_KEYS.has(k) && v !== null && v !== undefined && v !== "") {
          existingCustom.push({
            id: k,
            key: k,
            value: typeof v === "object" ? JSON.stringify(v) : String(v),
          });
        }
      });
      setCustomFields(existingCustom);
    }
  }, [activity]);

  // Handle DOI auto-enrichment
  const handleAutoEnrich = async () => {
    if (!doi.trim()) {
      toast.error("Please enter a valid DOI to enrich.");
      return;
    }
    setIsEnrichingDoi(true);
    try {
      const enriched: any = await activitiesApi.autoEnrichDoi(doi.trim());
      if (enriched.title && !title) setTitle(enriched.title);
      if (enriched.journal_name) setJournalName(enriched.journal_name);
      if (enriched.issn) setIssn(enriched.issn);
      if (enriched.publication_date) setPublicationDate(enriched.publication_date);
      if (enriched.volume) setVolume(enriched.volume);
      if (enriched.issue) setIssue(enriched.issue);
      if (enriched.page_numbers) setPageNumbers(enriched.page_numbers);
      toast.success("Bibliographic metadata enriched via CrossRef!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Could not retrieve CrossRef metadata for this DOI.");
    } finally {
      setIsEnrichingDoi(false);
    }
  };

  const toggleIndexing = (tag: string) => {
    setIndexing((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Update Activity Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload: any) => activitiesApi.updateActivity(id, payload),
    onSuccess: () => {
      toast.success("Achievement details saved successfully!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err: any) => {
      toast.error(err.message || err.response?.data?.error || "Failed to update achievement details.");
    },
  });

  const handleSaveChanges = () => {
    if (isApproved) {
      toast.error("This achievement record is sealed and locked for NAAC accreditation. Unlock the record first before making revisions.");
      return;
    }

    if (!title.trim()) {
      toast.error("Title cannot be blank.");
      return;
    }

    const metadata: ActivityMetadata = {
      description: description.trim(),
    };

    if (activityType === "journal_publication" || activityType === "journal") {
      metadata.journal_name = journalName.trim();
      metadata.issn = issn.trim();
      metadata.doi = doi.trim();
      metadata.volume = volume.trim();
      metadata.issue = issue.trim();
      metadata.page_numbers = pageNumbers.trim();
      metadata.publication_date = publicationDate;
      metadata.indexing = indexing;
    } else if (activityType === "conference_publication" || activityType === "conference") {
      metadata.conference_name = conferenceName.trim();
      metadata.proceedings_title = proceedingsName.trim();
      metadata.isbn = isbn.trim();
      metadata.location = location.trim();
      metadata.conference_date = conferenceDate;
      metadata.publisher = publisher.trim();
    } else if (activityType === "patent") {
      metadata.patent_number = patentNumber.trim();
      metadata.patent_or_application_number = patentNumber.trim();
      metadata.application_number = patentNumber.trim();
      metadata.patent_status = patentStatus.charAt(0).toUpperCase() + patentStatus.slice(1).toLowerCase();
      metadata.country = country.trim();
      metadata.filing_date = filingDate;
      metadata.grant_date = grantDate;
    } else if (activityType === "faculty_participation" || activityType === "fdp") {
      metadata.program_title = programTitle.trim() || title.trim();
      metadata.organizing_body = organizingBody.trim();
      metadata.start_date = startDate;
      metadata.end_date = endDate;
      metadata.duration_days = durationDays;
      metadata.participation_type = fdpType;
    }

    // Merge custom dynamic key-value fields
    customFields.forEach((cf) => {
      const k = cf.key.trim();
      if (k) {
        metadata[k] = cf.value.trim();
      }
    });

    updateMutation.mutate({
      title: title.trim(),
      academic_session: academicSession,
      activity_type: activityType as ActivityType,
      description: description.trim(),
      metadata,
    });
  };

  // Request Access Mutation
  const requestAccessMutation = useMutation({
    mutationFn: (reason: string) => activitiesApi.requestAccess(id, reason),
    onSuccess: (res) => {
      toast.success(res.message || "Edit access request sent to coordinator and faculty author.");
      setAccessModalOpen(false);
      setAccessReason("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to submit access request.");
    },
  });

  // Unlock Record Mutation
  const unlockMutation = useMutation({
    mutationFn: () => activitiesApi.unlockActivity(id),
    onSuccess: () => {
      toast.success("Record unlocked for revisions.");
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to unlock record.");
    },
  });

  // Verify Document Mutation
  const verifyDocumentMutation = useMutation({
    mutationFn: (docId: string) => documentsApi.verifyDocument(docId),
    onSuccess: () => {
      toast.success("Proof document verified for accreditation audit.");
      queryClient.invalidateQueries({ queryKey: ["activity-documents", id] });
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to verify document.");
    },
  });

  // Delete Document Mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: (docId: string) => documentsApi.deleteDocument(docId),
    onSuccess: () => {
      toast.success("Document attachment removed.");
      queryClient.invalidateQueries({ queryKey: ["activity-documents", id] });
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to delete document.");
    },
  });

  // Submit for Review Mutation
  const submitMutation = useMutation({
    mutationFn: () => activitiesApi.submitActivity(id),
    onSuccess: () => {
      toast.success("Activity submitted for department review!");
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to submit activity.");
    },
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: () => activitiesApi.approveActivity(id),
    onSuccess: () => {
      toast.success("Achievement approved and locked for accreditation!");
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Approval failed.");
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: (reason: string) => activitiesApi.rejectActivity(id, reason),
    onSuccess: () => {
      toast.success("Achievement marked as needing revision.");
      setRejectModalOpen(false);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Rejection failed.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => activitiesApi.deleteActivity(id),
    onSuccess: () => {
      toast.success("Record deleted successfully.");
      router.push("/dashboard/achievements");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || err.response?.data?.detail || "Failed to delete record.");
    },
  });

  // Upload proof document directly
  const handleUploadAdditionalProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProof(true);
    setUploadProgress(0);
    try {
      try {
        const presigned = await documentsApi.getPresignedUploadUrl({
          activity: id,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || "application/octet-stream",
          document_type: "published_paper",
          title: file.name,
        });

        await documentsApi.uploadDirectToR2(
          presigned.upload_url,
          file,
          (pct) => setUploadProgress(pct)
        );

        await documentsApi.confirmUpload(presigned.document_id);
      } catch (r2Err) {
        await documentsApi.uploadMultipart(id, file);
      }

      toast.success("Proof document attached successfully!");
      queryClient.invalidateQueries({ queryKey: ["activity-documents", id] });
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
    } catch (err: any) {
      toast.error(err.message || "Failed to attach proof document.");
    } finally {
      setIsUploadingProof(false);
      setUploadProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This achievement record either does not exist or you do not have permission to view it.
        </p>
        <Link href="/dashboard/achievements">
          <Button variant="outline">Back to Achievements</Button>
        </Link>
      </div>
    );
  }

  const facultyOwnerId = typeof activity.faculty === "object"
    ? (activity.faculty as any)?.id
    : activity.faculty;

  const isOwner = Boolean(user?.id && facultyOwnerId === user.id);
  const isApproved = activity.status === "approved";
  const isRejected = activity.status === "rejected";
  const isDraft = activity.status === "draft";

  // Comprehensive document resolution: merge queried documents with nested serializer documents
  const documents: ActivityDocument[] = (queriedDocuments && queriedDocuments.length > 0)
    ? queriedDocuments
    : (activity.documents && activity.documents.length > 0)
      ? activity.documents
      : [];

  const hasDocuments = documents.length > 0;

  // Editing is permitted only when NOT approved, and user is owner or tenant admin.
  // Approved records are sealed for accreditation and require explicit unlocking.
  const canSelfEdit = !isApproved && (isOwner || isTenantAdmin);
  const canRequestAccess = !canSelfEdit;

  const meta = (activity.metadata || {}) as Record<string, any>;
  const authorsList = activity.activity_authors || [];

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case "approved":
        return <Badge variant="success" size="md">Audit Ready (Approved)</Badge>;
      case "submitted":
        return <Badge variant="info" size="md">Submitted for Review</Badge>;
      case "under_review":
        return <Badge variant="warning" size="md">Under Review</Badge>;
      case "rejected":
        return <Badge variant="danger" size="md">Needs Revision</Badge>;
      default:
        return <Badge variant="neutral" size="md">Draft</Badge>;
    }
  };

  // Helper to format metadata keys into clean human titles
  const formatKeyTitle = (key: string) => {
    return key
      .replace(/_/g, " ")
      .replace(/\(.*\)/g, "")
      .trim()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Determine unhandled metadata keys to ensure 100% of data is shown
  const displayedMetaKeys = DISPLAYED_META_KEYS;


  const extraMetaEntries = Object.entries(meta).filter(
    ([k, v]) => !displayedMetaKeys.has(k) && v !== null && v !== undefined && v !== ""
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link href="/dashboard/achievements">
          <Button size="sm" variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Achievements
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {getStatusBadge(activity.status)}

          {!isEditing && canSelfEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-indigo-500" />}
            >
              Enable Editing
            </Button>
          )}

          {!isEditing && canRequestAccess && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAccessModalOpen(true)}
              leftIcon={<KeyRound className="w-3.5 h-3.5 text-amber-500" />}
            >
              Need Edit Access
            </Button>
          )}

          {isEditing && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                isLoading={updateMutation.isPending}
                onClick={handleSaveChanges}
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Audit Lock Banner */}
      {isApproved && (
        <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs">
              <strong>Verified & Locked for Accreditation:</strong> This record has received coordinator verification and is immutable.
              {activity.verified_at && (
                <span className="block text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Verified by {activity.verified_by_name || "Department Coordinator"} on {formatDate(activity.verified_at)}
                </span>
              )}
            </div>
          </div>
          {isElevated && (
            <Button
              size="xs"
              variant="outline"
              isLoading={unlockMutation.isPending}
              onClick={() => {
                if (confirm("Are you sure you want to unlock this record for faculty revisions?")) {
                  unlockMutation.mutate();
                }
              }}
              leftIcon={<Unlock className="w-3.5 h-3.5 text-emerald-600" />}
              className="border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 shrink-0"
            >
              Unlock Record
            </Button>
          )}
        </div>
      )}

      {/* Rejection / Revision Banner */}
      {isRejected && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 flex flex-col gap-1 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Revisions Requested by Department Reviewer:</span>
          </div>
          <p className="text-xs pl-6 text-rose-700 dark:text-rose-300">
            {activity.rejection_reason || "Please verify publication details or re-upload a clearer proof document."}
          </p>
        </div>
      )}

      {/* Editing Mode Banner */}
      {isEditing && (
        <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>
              <strong>Editing Mode Active:</strong> You can edit metadata, bibliographic details, and description. Click <strong>Save Changes</strong> when done.
            </span>
          </div>
        </div>
      )}

      {/* Read-Only Notice Banner for non-owners */}
      {!isEditing && !canSelfEdit && (
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>
              You are viewing this record in <strong>Read-Only Mode</strong>. (Author: {activity.faculty_name || "Faculty Member"}).
            </span>
          </div>
          <button
            onClick={() => setAccessModalOpen(true)}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
          >
            Need Edit Access?
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {!isEditing ? (
        /* ================= VIEW MODE (FULL DETAILS) ================= */
        <div className="space-y-6">
          {/* Card 1: Core Title, Category & Summary */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                <span className="capitalize px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold">
                  {activity.activity_type.replace(/_/g, " ")}
                </span>
                <span>•</span>
                <span>Session: <strong>{activity.session_name || activity.academic_session_name || meta.session || "Active Session"}</strong></span>
                <span>•</span>
                <span>Recorded {formatDate(activity.created_at)}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {activity.title}
              </h1>
              {(activity.description || meta.description) && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-1">Abstract / Key Highlights</p>
                  <p>{String(activity.description || meta.description)}</p>
                </div>
              )}
            </div>

            {/* Author & Institutional Affiliation Profile */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                <span>Faculty Author & Institutional Profile</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Faculty Member</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {activity.faculty_name || meta.name_of_faculty || "Faculty Member"}
                  </p>
                  {activity.faculty_email && (
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{activity.faculty_email}</p>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Employee ID</span>
                  <p className="font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    {activity.faculty_employee_id || meta.emp_id || meta.s_no || meta.sr_no || "—"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Designation</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {activity.faculty_designation || meta.current_designation || "Faculty"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Department</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {activity.department_name || activity.faculty_department_name || meta.deparment || "Academic Department"}
                  </p>
                </div>

                {Boolean(meta.affiliating_institute_at_the_time_of_pub) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 sm:col-span-2 lg:col-span-4">
                    <span className="text-[11px] text-slate-400 font-medium">Affiliating Institute at Time of Publication</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.affiliating_institute_at_the_time_of_pub)}
                    </p>
                  </div>
                )}
              </div>

              {/* Co-Authors List */}
              {(authorsList.length > 0 || Boolean(meta.authors_name_in_sequence_as_shown_in_pub)) && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Author Sequence & Collaborators</span>
                  </h3>

                  {authorsList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {authorsList.map((auth: any) => (
                        <div
                          key={auth.id || auth.author_order}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5"
                        >
                          <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center">
                            {auth.author_order}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{auth.author_name}</span>
                          {auth.is_corresponding && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold ml-1" title="Corresponding Author">★</span>
                          )}
                          {auth.affiliation && (
                            <span className="text-[10px] text-slate-400">({auth.affiliation})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {String(meta.authors_name_in_sequence_as_shown_in_pub)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Card 2: Bibliographic & Category Metadata */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Bibliographic & Accreditation Metadata</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Journal Details */}
                {Boolean(meta.journal_name || meta.name_of_journal) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Journal Name</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.journal_name || meta.name_of_journal)}
                    </p>
                  </div>
                )}

                {Boolean(meta.doi) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Digital Object Identifier (DOI)</span>
                    <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                      <a
                        href={`https://doi.org/${meta.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline inline-flex items-center gap-1"
                      >
                        {String(meta.doi)} <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                )}

                {Boolean(meta.issn || meta["isbn_issn_(if_applicable)"]) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">ISSN / ISBN</span>
                    <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.issn || meta["isbn_issn_(if_applicable)"])}
                    </p>
                  </div>
                )}

                {Boolean(meta.volume || meta.volume_no) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Volume</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.volume || meta.volume_no)}
                    </p>
                  </div>
                )}

                {Boolean(meta.issue || meta.issue_no) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Issue</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.issue || meta.issue_no)}
                    </p>
                  </div>
                )}

                {Boolean(meta.page_numbers || meta.page_no) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Page Numbers</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.page_numbers || meta.page_no)}
                    </p>
                  </div>
                )}

                {Boolean(meta.publication_date || meta.date_of_publication) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Publication Date</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatDate(String(meta.publication_date || meta.date_of_publication))}
                    </p>
                  </div>
                )}

                {Boolean(meta.indexing) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 sm:col-span-2">
                    <span className="text-[11px] text-slate-400 font-medium">Citation Indexing</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Array.isArray(meta.indexing)
                        ? meta.indexing.map((idx: string) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px]"
                            >
                              {idx}
                            </span>
                          ))
                        : String(meta.indexing).split(",").map((idx: string) => (
                            <span
                              key={idx.trim()}
                              className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px]"
                            >
                              {idx.trim()}
                            </span>
                          ))}
                    </div>
                  </div>
                )}

                {/* Conference Details */}
                {Boolean(meta.conference_name || meta.name_of_conference) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 sm:col-span-2">
                    <span className="text-[11px] text-slate-400 font-medium">Conference Name</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.conference_name || meta.name_of_conference)}
                    </p>
                  </div>
                )}

                {Boolean(meta["types_of_conference_(national_conference"]) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Conference Type</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta["types_of_conference_(national_conference"])}
                    </p>
                  </div>
                )}

                {Boolean(meta.conference_date || meta.date_of_conference) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Conference Date</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.conference_date || meta.date_of_conference)}
                    </p>
                  </div>
                )}

                {Boolean(meta.location || meta["conference_location_(if_applicable)"]) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Location</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.location || meta["conference_location_(if_applicable)"])}
                    </p>
                  </div>
                )}

                {Boolean(meta.proceedings_name || meta.proceedings_title) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 sm:col-span-2">
                    <span className="text-[11px] text-slate-400 font-medium">Proceedings / Book Title</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.proceedings_name || meta.proceedings_title)}
                    </p>
                  </div>
                )}

                {Boolean(meta.publisher || meta.name_of_the_publisher) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Publisher</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.publisher || meta.name_of_the_publisher)}
                    </p>
                  </div>
                )}

                {/* Patent Details */}
                {Boolean(meta.patent_number || meta.patent_or_application_number || meta.application_number) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Patent / App Number</span>
                    <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      #{String(meta.patent_number || meta.patent_or_application_number || meta.application_number)}
                    </p>
                  </div>
                )}

                {Boolean(meta.patent_status) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Patent Legal Status</span>
                    <p className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.patent_status)}
                    </p>
                  </div>
                )}

                {Boolean(meta.country) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Country / Jurisdiction</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.country)}
                    </p>
                  </div>
                )}

                {Boolean(meta.filing_date) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Filing Date</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatDate(String(meta.filing_date))}
                    </p>
                  </div>
                )}

                {Boolean(meta.grant_date) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Grant Date</span>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {formatDate(String(meta.grant_date))}
                    </p>
                  </div>
                )}

                {/* FDP / Participation Details */}
                {Boolean(meta.program_title || meta.title_of_the_program) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 sm:col-span-2">
                    <span className="text-[11px] text-slate-400 font-medium">Program Title</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.program_title || meta.title_of_the_program)}
                    </p>
                  </div>
                )}

                {Boolean(meta.organizing_body || meta.organized_by) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Organizing Body</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.organizing_body || meta.organized_by)}
                    </p>
                  </div>
                )}

                {Boolean(meta.fdp_type || meta["type_of_program_(fdp__workshop_conferenc"]) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Program Type</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.fdp_type || meta["type_of_program_(fdp__workshop_conferenc"])}
                    </p>
                  </div>
                )}

                {Boolean(meta.duration_days || meta.duration_of_the_program) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Duration</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {String(meta.duration_days || meta.duration_of_the_program)}
                    </p>
                  </div>
                )}

                {Boolean(meta.start_date) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">Start Date</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatDate(String(meta.start_date))}
                    </p>
                  </div>
                )}

                {Boolean(meta.end_date) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium">End Date</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatDate(String(meta.end_date))}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Extra Metadata Section (Ensures 100% of stored attributes are visible) */}
            {extraMetaEntries.length > 0 && (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Additional Institutional Attributes</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {extraMetaEntries.map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{formatKeyTitle(key)}</span>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5 break-words">
                        {typeof val === "object" ? JSON.stringify(val) : String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* ================= EDIT MODE FORM ================= */
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-500" />
              <span>Edit Achievement Information</span>
            </h2>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setIsEditing(false)}
            >
              Cancel Edit
            </Button>
          </div>

          <div className="space-y-4">
            <Input
              label="Full Title of Achievement"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Academic Session"
                required
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                options={sessions.map((s) => ({ value: s.id, label: s.name }))}
              />

              <Select
                label="Activity Type"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                options={[
                  { value: "journal_publication", label: "Journal Publication (3.4.5)" },
                  { value: "conference_publication", label: "Conference Proceedings (3.4.6)" },
                  { value: "patent", label: "Patent (3.4.3)" },
                  { value: "faculty_participation", label: "FDP & Workshop (6.3.3)" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description / Abstract / Key Highlights
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional summary or notes for accreditation..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category Specific Dynamic Fields in Edit Mode */}
            {(activityType === "journal_publication" || activityType === "journal") && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Journal Publication Details
                  </h3>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    CrossRef Integrated
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex-1 w-full">
                    <Input
                      placeholder="Enter DOI (e.g. 10.1109/CVPR.2016.90)"
                      value={doi}
                      onChange={(e) => setDoi(e.target.value)}
                      leftIcon={<Globe className="w-4 h-4 text-indigo-500" />}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    isLoading={isEnrichingDoi}
                    onClick={handleAutoEnrich}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                    className="shrink-0 bg-white dark:bg-slate-900 cursor-pointer"
                  >
                    Auto-Fill via DOI
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Journal Name"
                    required
                    value={journalName}
                    onChange={(e) => setJournalName(e.target.value)}
                  />
                  <Input
                    label="ISSN / ISBN"
                    value={issn}
                    onChange={(e) => setIssn(e.target.value)}
                  />
                  <Input
                    label="Volume"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                  />
                  <Input
                    label="Issue"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                  />
                  <Input
                    label="Page Numbers"
                    value={pageNumbers}
                    onChange={(e) => setPageNumbers(e.target.value)}
                  />
                  <Input
                    label="Publication Date"
                    type="date"
                    value={publicationDate}
                    onChange={(e) => setPublicationDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Indexing Databases
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Scopus", "Web of Science", "UGC CARE List", "PubMed", "Peer Reviewed"].map((tag) => {
                      const active = indexing.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleIndexing(tag)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            active
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {active ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {(activityType === "conference_publication" || activityType === "conference") && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Conference Proceedings Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Conference Name"
                    required
                    value={conferenceName}
                    onChange={(e) => setConferenceName(e.target.value)}
                  />
                  <Input
                    label="Proceedings / Book Title"
                    value={proceedingsName}
                    onChange={(e) => setProceedingsName(e.target.value)}
                  />
                  <Input
                    label="ISBN"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                  />
                  <Input
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <Input
                    label="Conference Date"
                    type="date"
                    value={conferenceDate}
                    onChange={(e) => setConferenceDate(e.target.value)}
                  />
                  <Input
                    label="Publisher"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                  />
                </div>
              </div>
            )}

            {activityType === "patent" && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Patent Registry Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Patent / Application Number"
                    required
                    value={patentNumber}
                    onChange={(e) => setPatentNumber(e.target.value)}
                  />
                  <Select
                    label="Patent Status"
                    value={patentStatus}
                    onChange={(e) => setPatentStatus(e.target.value)}
                    options={[
                      { value: "Filed", label: "Filed / Submitted" },
                      { value: "Published", label: "Published in Patent Gazette" },
                      { value: "Granted", label: "Granted / Awarded" },
                    ]}
                  />
                  <Input
                    label="Jurisdiction / Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                  <Input
                    label="Filing Date"
                    type="date"
                    value={filingDate}
                    onChange={(e) => setFilingDate(e.target.value)}
                  />
                  {patentStatus.toLowerCase() === "granted" && (
                    <Input
                      label="Grant Date"
                      type="date"
                      value={grantDate}
                      onChange={(e) => setGrantDate(e.target.value)}
                    />
                  )}
                </div>
              </div>
            )}

            {(activityType === "faculty_participation" || activityType === "fdp") && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Faculty Development Program Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Program Title"
                    required
                    value={programTitle}
                    onChange={(e) => setProgramTitle(e.target.value)}
                  />
                  <Input
                    label="Organizing Body"
                    value={organizingBody}
                    onChange={(e) => setOrganizingBody(e.target.value)}
                  />
                  <Select
                    label="Engagement Type"
                    value={fdpType}
                    onChange={(e) => setFdpType(e.target.value)}
                    options={[
                      { value: "attended", label: "Attended by Faculty" },
                      { value: "conducted", label: "Conducted / Organized" },
                    ]}
                  />
                  <Input
                    label="Duration in Days"
                    type="number"
                    min="1"
                    value={String(durationDays)}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                  />
                  <Input
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Custom Dynamic Key-Value Editor in Edit Mode */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <CustomFieldsEditor
                fields={customFields}
                onChange={setCustomFields}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={updateMutation.isPending}
              onClick={handleSaveChanges}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Changes
            </Button>
          </div>
        </Card>
      )}

      {/* Proof Documents Section (Comprehensive Document Viewer) */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Cloudflare R2 Verification Proofs & Documents
              </h2>
              <p className="text-[11px] text-slate-500">
                Official accreditation documents stored with tamper-proof validation
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {documents.length} File{documents.length !== 1 ? "s" : ""} Attached
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <Paperclip className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No proof documents attached yet
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              A certificate, published paper PDF, or indexing screenshot is required before this achievement can be verified for NAAC accreditation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const viewUrl = documentsApi.getViewUrl(doc.id);
              const downloadUrl = documentsApi.getDownloadUrl(doc.id);

              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-md">
                          {doc.title || doc.file_name || "Verification Proof Document"}
                        </p>

                        {/* Document type badge */}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase">
                          {doc.document_type ? doc.document_type.replace(/_/g, " ") : "Proof Attachment"}
                        </span>

                        {/* Verified badge */}
                        {doc.is_verified ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                            <Check className="w-3 h-3" />
                            <span>Audit Verified</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-800">
                            Pending Verification
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Original: <strong className="font-mono">{doc.file_name || "Attachment"}</strong></span>
                        <span>•</span>
                        <span>{doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB` : "Document"}</span>
                        <span>•</span>
                        <span>{doc.mime_type || "application/octet-stream"}</span>
                        {doc.created_at && (
                          <>
                            <span>•</span>
                            <span>Uploaded {formatDate(doc.created_at)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Document */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Coordinator Quick Verify button */}
                    {isElevated && !doc.is_verified && (
                      <Button
                        size="xs"
                        variant="outline"
                        isLoading={verifyDocumentMutation.isPending}
                        onClick={() => verifyDocumentMutation.mutate(doc.id)}
                        leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                        className="text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50"
                      >
                        Verify
                      </Button>
                    )}

                    <a
                      href={viewUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="xs" variant="primary" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                        View
                      </Button>
                    </a>

                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="xs" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                        Download
                      </Button>
                    </a>

                    {canSelfEdit && !isApproved && (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Remove document "${doc.file_name || doc.title}"?`)) {
                            deleteDocumentMutation.mutate(doc.id);
                          }
                        }}
                        disabled={deleteDocumentMutation.isPending}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Additional Proof Dropzone */}
        {canSelfEdit && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl p-4 flex items-center justify-center gap-2.5 cursor-pointer transition-colors text-xs text-slate-600 dark:text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-900/30">
              <UploadCloud className="w-4 h-4 text-indigo-500" />
              <span>{isUploadingProof ? "Uploading proof directly to Cloudflare R2..." : "Attach additional proof certificate or published paper (PDF / Image)"}</span>
              <input
                type="file"
                className="hidden"
                disabled={isUploadingProof}
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleUploadAdditionalProof}
              />
            </label>
            {uploadProgress !== null && (
              <div className="mt-2 text-xs text-indigo-600 font-semibold flex items-center gap-2">
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span>{uploadProgress}%</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          {canSelfEdit && !isApproved && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${activity.title}"?`)) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Record
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Faculty Submit for Review */}
          {isDraft && hasDocuments && isOwner && (
            <Button
              variant="primary"
              size="sm"
              isLoading={submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Submit for Department Verification
            </Button>
          )}

          {/* Elevated Coordinator Actions */}
          {isElevated && !isApproved && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(true)}
                className="text-rose-600 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
              >
                Request Revisions
              </Button>

              <Button
                variant="primary"
                size="sm"
                disabled={!hasDocuments || isOwner}
                title={isOwner ? "Self-approval is strictly prohibited by accreditation policy." : undefined}
                isLoading={approveMutation.isPending}
                onClick={() => approveMutation.mutate()}
                leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                className={isOwner ? "bg-slate-400 cursor-not-allowed text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"}
              >
                {isOwner ? "Self-Approval Prohibited" : "Approve & Verify"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Request Revisions from Faculty"
        description="Provide actionable audit comments detailing what needs correction or re-upload."
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Revision Notes / Audit Comments
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Scopus indexing certificate is missing. Please attach the Scopus author preview page."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!rejectionReason.trim()}
              isLoading={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate(rejectionReason.trim())}
            >
              Send Revision Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Request Edit Access Modal */}
      <Modal
        isOpen={accessModalOpen}
        onClose={() => setAccessModalOpen(false)}
        title="Request Editing Privileges"
        description="Submit an access request to update bibliographic information or co-authorship details."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Record Title:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">{activity.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Faculty Author:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{activity.faculty_name || "Faculty Member"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{activity.department_name || activity.faculty_department_name || "Academic"}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reason / Revision Note for Access Request
            </label>
            <textarea
              rows={3}
              value={accessReason}
              onChange={(e) => setAccessReason(e.target.value)}
              placeholder="e.g. I am a co-author on this paper and need to update the DOI and Scopus indexing details..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setAccessModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!accessReason.trim()}
              isLoading={requestAccessMutation.isPending}
              onClick={() => requestAccessMutation.mutate(accessReason.trim())}
              leftIcon={<KeyRound className="w-3.5 h-3.5" />}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
