"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { activitiesApi } from "@/lib/api/activities";
import { structureApi } from "@/lib/api/structure";
import { documentsApi } from "@/lib/api/documents";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { CustomFieldsEditor, CustomFieldItem } from "@/components/achievements/CustomFieldsEditor";
import { ActivityType } from "@/types";
import { toast } from "sonner";
import {
  BookOpen,
  Award,
  TrendingUp,
  FileCheck,
  UploadCloud,
  FileText,
  Sparkles,
  ArrowLeft,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Building,
  Globe,
  Hash,
} from "lucide-react";

export default function NewAchievementPage() {
  const router = useRouter();

  // Active Category
  const [activityType, setActivityType] = useState<ActivityType>("journal_publication");

  // Common fields
  const [title, setTitle] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [description, setDescription] = useState("");

  // Journal specific
  const [doi, setDoi] = useState("");
  const [journalName, setJournalName] = useState("");
  const [issn, setIssn] = useState("");
  const [indexing, setIndexing] = useState<string[]>(["Scopus"]);
  const [volume, setVolume] = useState("");
  const [issue, setIssue] = useState("");
  const [pageNumbers, setPageNumbers] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [isCorrespondingAuthor, setIsCorrespondingAuthor] = useState(false);
  const [authorOrder, setAuthorOrder] = useState<number>(1);

  // Conference specific
  const [conferenceName, setConferenceName] = useState("");
  const [proceedingsName, setProceedingsName] = useState("");
  const [isbn, setIsbn] = useState("");
  const [location, setLocation] = useState("");
  const [conferenceDate, setConferenceDate] = useState("");
  const [publisher, setPublisher] = useState("");

  // Patent specific
  const [patentNumber, setPatentNumber] = useState("");
  const [country, setCountry] = useState("India");
  const [patentStatus, setPatentStatus] = useState("Filed");
  const [filingDate, setFilingDate] = useState("");
  const [grantDate, setGrantDate] = useState("");

  // FDP specific
  const [programTitle, setProgramTitle] = useState("");
  const [organizingBody, setOrganizingBody] = useState("");
  const [fdpType, setFdpType] = useState("attended");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [durationDays, setDurationDays] = useState<number>(5);

  // Dynamic Custom Key-Value Fields
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);

  // Proof Document
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnrichingDoi, setIsEnrichingDoi] = useState(false);

  // Fetch academic sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ["academic-sessions"],
    queryFn: () => structureApi.getAcademicSessions(),
  });

  // Auto-select first session if not selected
  React.useEffect(() => {
    if (!academicSession && sessions.length > 0) {
      setAcademicSession(sessions[0].id);
    }
  }, [sessions, academicSession]);

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
      toast.success("Metadata enriched successfully via CrossRef!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Could not retrieve CrossRef metadata for this DOI.");
    } finally {
      setIsEnrichingDoi(false);
    }
  };

  // Toggle Indexing tags
  const toggleIndexing = (tag: string) => {
    setIndexing((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error(`Prohibited file type '${ext}'. Please upload a PDF or image file.`);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size exceeds 15MB limit.");
      return;
    }
    setSelectedFile(file);
  };

  // Save / Submit Record
  const handleSave = async (shouldSubmitForReview: boolean) => {
    if (!title.trim()) {
      toast.error("Record title is required.");
      return;
    }
    if (!academicSession) {
      toast.error("Please select an Academic Session.");
      return;
    }
    if (shouldSubmitForReview && !selectedFile) {
      toast.error("A proof document is mandatory before submitting for review.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // 1. Build metadata object
      let metadata: any = {};
      if (activityType === "journal_publication") {
        metadata = {
          journal_name: journalName,
          issn,
          indexing,
          volume,
          issue,
          page_numbers: pageNumbers,
          doi,
          publication_date: publicationDate,
          is_corresponding_author: isCorrespondingAuthor,
          author_order: Number(authorOrder) || 1,
        };
      } else if (activityType === "conference_publication") {
        metadata = {
          conference_name: conferenceName,
          proceedings_name: proceedingsName,
          isbn,
          location,
          conference_date: conferenceDate,
          publisher,
        };
      } else if (activityType === "patent") {
        metadata = {
          patent_number: patentNumber.trim(),
          patent_or_application_number: patentNumber.trim(),
          application_number: patentNumber.trim(),
          country: country.trim(),
          patent_status: patentStatus.charAt(0).toUpperCase() + patentStatus.slice(1).toLowerCase(),
          filing_date: filingDate,
          grant_date: grantDate,
        };
      } else if (activityType === "faculty_participation") {
        metadata = {
          program_title: programTitle || title,
          organizing_body: organizingBody,
          fdp_type: fdpType,
          start_date: startDate,
          end_date: endDate,
          duration_days: Number(durationDays) || 1,
        };
      }

      // Merge user-defined dynamic custom fields into metadata
      customFields.forEach((cf) => {
        const k = cf.key.trim();
        if (k) {
          metadata[k] = cf.value.trim();
        }
      });

      // 2. Create Activity record
      const activity = await activitiesApi.createActivity({
        title: title.trim(),
        activity_type: activityType,
        academic_session: academicSession,
        description: description.trim(),
        metadata,
        status: "draft",
      });

      // 3. Upload Proof Document if attached
      if (selectedFile) {
        try {
          // Attempt Cloudflare R2 Presigned Upload
          const presigned = await documentsApi.getPresignedUploadUrl({
            activity: activity.id,
            file_name: selectedFile.name,
            file_size: selectedFile.size,
            mime_type: selectedFile.type || "application/octet-stream",
            document_type: "published_paper",
            title: selectedFile.name,
          });

          await documentsApi.uploadDirectToR2(
            presigned.upload_url,
            selectedFile,
            (pct) => setUploadProgress(pct)
          );

          await documentsApi.confirmUpload(presigned.document_id);
        } catch (uploadErr) {
          // Fallback to local multipart upload
          await documentsApi.uploadMultipart(activity.id, selectedFile);
        }
      }

      // 4. Submit for review if requested
      if (shouldSubmitForReview) {
        await activitiesApi.submitActivity(activity.id);
        toast.success("Achievement submitted for department verification!");
      } else {
        toast.success("Draft saved successfully.");
      }

      router.push(`/dashboard/achievements/${activity.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Failed to create achievement record.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/achievements">
          <Button size="sm" variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Record Academic Achievement
          </h1>
          <p className="text-xs text-slate-500">
            Submit your publication, patent, conference paper, or FDP record for official accreditation.
          </p>
        </div>
      </div>

      {/* Step 1: Category Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setActivityType("journal_publication")}
          className={`p-4 rounded-xl border text-left transition-all ${
            activityType === "journal_publication"
              ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <BookOpen className={`w-5 h-5 ${activityType === "journal_publication" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              Crit. 3.4.5
            </span>
          </div>
          <div className="text-xs font-bold">Journal Article</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Scopus, WoS, UGC Care</div>
        </button>

        <button
          type="button"
          onClick={() => setActivityType("conference_publication")}
          className={`p-4 rounded-xl border text-left transition-all ${
            activityType === "conference_publication"
              ? "border-purple-600 bg-purple-50/70 dark:bg-purple-950/60 text-purple-950 dark:text-purple-200 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Award className={`w-5 h-5 ${activityType === "conference_publication" ? "text-purple-600 dark:text-purple-400" : "text-slate-400"}`} />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              Crit. 3.4.6
            </span>
          </div>
          <div className="text-xs font-bold">Conference Paper</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Proceedings with ISBN</div>
        </button>

        <button
          type="button"
          onClick={() => setActivityType("patent")}
          className={`p-4 rounded-xl border text-left transition-all ${
            activityType === "patent"
              ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className={`w-5 h-5 ${activityType === "patent" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              Crit. 3.4.3
            </span>
          </div>
          <div className="text-xs font-bold">Patent</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Filed, Published, Granted</div>
        </button>

        <button
          type="button"
          onClick={() => setActivityType("faculty_participation")}
          className={`p-4 rounded-xl border text-left transition-all ${
            activityType === "faculty_participation"
              ? "border-amber-600 bg-amber-50/70 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <FileCheck className={`w-5 h-5 ${activityType === "faculty_participation" ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`} />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              Crit. 6.3.3
            </span>
          </div>
          <div className="text-xs font-bold">FDP & Workshop</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Faculty development</div>
        </button>
      </div>

      {/* Main Form Body */}
      <div className="space-y-6">
        {/* Card 1: Core Details */}
        <Card className="p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            General Bibliographic Information
          </h2>

          <div className="space-y-4">
            <div>
              <Input
                label="Full Title of Achievement"
                required
                placeholder={
                  activityType === "journal_publication"
                    ? "e.g. Deep Residual Learning for Image Recognition"
                    : activityType === "patent"
                    ? "e.g. An IoT-Enabled Autonomous Irrigation System"
                    : "e.g. 5-Day National Workshop on Quantum Machine Learning"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Academic Session"
                  required
                  value={academicSession}
                  onChange={(e) => setAcademicSession(e.target.value)}
                  options={sessions.map((s) => ({ value: s.id, label: s.name }))}
                />
              </div>

              <div>
                <Input
                  label="Brief Abstract or Notes"
                  placeholder="Optional summary for accreditation inspectors..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Dynamic Category Specific Fields */}
        {activityType === "journal_publication" && (
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Journal Article Details (NAAC Criterion 3.4.5)
              </h2>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                CrossRef Assisted
              </span>
            </div>

            {/* DOI Auto-Enrich Box */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 mb-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
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
                size="md"
                isLoading={isEnrichingDoi}
                onClick={handleAutoEnrich}
                leftIcon={<Sparkles className="w-4 h-4 text-indigo-500" />}
                className="bg-white dark:bg-slate-900 shrink-0"
              >
                Auto-Fill via DOI
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Journal Title"
                  required
                  placeholder="e.g. IEEE Transactions on Neural Networks"
                  value={journalName}
                  onChange={(e) => setJournalName(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="ISSN (Print or Online)"
                  placeholder="e.g. 2162-237X"
                  value={issn}
                  onChange={(e) => setIssn(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Citation Database Indexing
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Scopus", "Web of Science", "UGC CARE List", "PubMed", "Peer Reviewed"].map((tag) => {
                    const active = indexing.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleIndexing(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
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

              <div>
                <Input
                  label="Volume & Issue"
                  placeholder="e.g. Vol 28, Issue 4"
                  value={volume ? `${volume}${issue ? `, Issue ${issue}` : ""}` : ""}
                  onChange={(e) => setVolume(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Page Numbers"
                  placeholder="e.g. 1024-1038"
                  value={pageNumbers}
                  onChange={(e) => setPageNumbers(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Publication Date"
                  type="date"
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value)}
                />
              </div>

              <div>
                <Select
                  label="Author Position"
                  value={String(authorOrder)}
                  onChange={(e) => setAuthorOrder(Number(e.target.value))}
                  options={[
                    { value: "1", label: "First Author (Lead Investigator)" },
                    { value: "2", label: "Second Author" },
                    { value: "3", label: "Co-Author (3rd or later)" },
                  ]}
                />
              </div>
            </div>
          </Card>
        )}

        {activityType === "conference_publication" && (
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Conference Paper Details (NAAC Criterion 3.4.6)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Conference Name"
                  required
                  placeholder="e.g. IEEE International Conference on Smart Computing"
                  value={conferenceName}
                  onChange={(e) => setConferenceName(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Proceedings / Book Title"
                  placeholder="e.g. SmartComp 2026 Proceedings"
                  value={proceedingsName}
                  onChange={(e) => setProceedingsName(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Proceedings ISBN"
                  placeholder="e.g. 978-1-5386-5541-2"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Location / Host City"
                  placeholder="e.g. Boston, USA or New Delhi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Conference Date"
                  type="date"
                  value={conferenceDate}
                  onChange={(e) => setConferenceDate(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Publisher"
                  placeholder="e.g. IEEE Xplore / Springer LNCS"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                />
              </div>
            </div>
          </Card>
        )}

        {activityType === "patent" && (
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Patent Registry Details (NAAC Criterion 3.4.3)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Patent / Application Number"
                  required
                  placeholder="e.g. 202611029841"
                  value={patentNumber}
                  onChange={(e) => setPatentNumber(e.target.value)}
                />
              </div>

              <div>
                <Select
                  label="Patent Legal Status"
                  required
                  value={patentStatus}
                  onChange={(e) => setPatentStatus(e.target.value)}
                  options={[
                    { value: "Filed", label: "Filed / Application Submitted" },
                    { value: "Published", label: "Published in Patent Gazette" },
                    { value: "Granted", label: "Granted / Patent Awarded" },
                  ]}
                />
              </div>

              <div>
                <Input
                  label="Jurisdiction / Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Filing Date"
                  type="date"
                  value={filingDate}
                  onChange={(e) => setFilingDate(e.target.value)}
                />
              </div>

              {patentStatus.toLowerCase() === "granted" && (
                <div>
                  <Input
                    label="Grant Date"
                    type="date"
                    value={grantDate}
                    onChange={(e) => setGrantDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {activityType === "faculty_participation" && (
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Faculty Development Program Details (NAAC Criterion 6.3.3)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Program Title"
                  required
                  placeholder="e.g. AICTE Sponsored FDP on Generative AI"
                  value={programTitle}
                  onChange={(e) => setProgramTitle(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Organizing Body / University"
                  required
                  placeholder="e.g. IIT Bombay / NPTEL"
                  value={organizingBody}
                  onChange={(e) => setOrganizingBody(e.target.value)}
                />
              </div>

              <div>
                <Select
                  label="Program Engagement Type"
                  value={fdpType}
                  onChange={(e) => setFdpType(e.target.value)}
                  options={[
                    { value: "attended", label: "Attended by Faculty Member" },
                    { value: "conducted", label: "Conducted / Organized by Department" },
                  ]}
                />
              </div>

              <div>
                <Input
                  label="Duration in Days"
                  type="number"
                  min="1"
                  value={String(durationDays)}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                />
              </div>

              <div>
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Dynamic Custom Key-Value Attributes */}
        <Card className="p-6">
          <CustomFieldsEditor
            fields={customFields}
            onChange={setCustomFields}
          />
        </Card>

        {/* Card 3: Cloudflare R2 Proof Document Attachment */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Accreditation Proof Document
              </h2>
              <p className="text-xs text-slate-500">
                Mandatory for NAAC verification. Stored directly in tamper-proof Cloudflare R2.
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              Zero-Egress R2
            </span>
          </div>

          {selectedFile ? (
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-sm">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for R2 upload
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group">
              <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 transition-colors mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click or drag & drop certificate or publication PDF
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Accepted: .pdf, .png, .jpg, .jpeg, .webp (Maximum 15MB)
              </p>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
              />
            </label>
          )}

          {uploadProgress !== null && (
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Uploading directly to Cloudflare R2...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Submit Actions Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 sticky bottom-4 z-10 shadow-lg">
          <Link href="/dashboard/achievements">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="w-full sm:w-auto"
            >
              Save as Draft
            </Button>

            <Button
              type="button"
              variant="primary"
              isLoading={isSubmitting}
              onClick={() => handleSave(true)}
              className="w-full sm:w-auto"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit for Department Verification
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
