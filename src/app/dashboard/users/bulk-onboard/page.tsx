"use client";

import React, { useState } from "react";
import Link from "next/link";
import { structureApi, BulkUserImportResponse } from "@/lib/api/structure";
import { useAuth } from "@/context/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  UserCheck,
  UploadCloud,
  Download,
  Copy,
  CheckCircle2,
  FileSpreadsheet,
  ArrowLeft,
  Info,
  ExternalLink,
  Users,
  KeyRound,
} from "lucide-react";

export default function BulkOnboardUsersPage() {
  const { canManageUsers } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<BulkUserImportResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleDownloadSample = () => {
    const csvContent =
      "Full Name,Mobile Number,Email Address\n" +
      "Dr. Vikramaditya Sharma,+919876543210,vikram.sharma@poornima.org\n" +
      "Dr. Sunita Agarwal,+919812345678,sunita.agarwal@poornima.org\n" +
      "Prof. Rajesh Verma,+919823456789,rajesh.verma@poornima.org\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Credenza_3_Column_User_Onboarding_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded sample 3-column template.");
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Please choose a CSV or Excel file to onboard users.");
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      const res = await structureApi.bulkImportUsers(selectedFile);
      setResult(res);

      if (res.created > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success(`Successfully onboarded ${res.created} new faculty accounts!`);
      } else {
        toast.info(res.skipped > 0 ? `${res.skipped} users already existed.` : "Import finished.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Bulk onboarding failed. Check file formatting.");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied password setup link for ${label}!`);
  };

  const handleDownloadLinksCsv = () => {
    if (!result?.setup_links || result.setup_links.length === 0) return;

    let csvContent = "Email Address,Password Setup URL (Valid for 7 Days)\n";
    result.setup_links.forEach((item) => {
      csvContent += `"${item.email}","${item.setup_url}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Credenza_Faculty_Setup_Tokens.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded invitation tokens CSV.");
  };

  return (
    <RouteGuard allowed={canManageUsers} requiredRoleName="Institutional Administrator, Dean, or Head of Department">
      <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/users">
          <Button size="sm" variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Users Directory
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadSample}
          leftIcon={<Download className="w-4 h-4 text-indigo-500" />}
        >
          Download 3-Col Template (.csv)
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          3-Column Rapid Faculty Onboarding
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Upload a 3-column spreadsheet containing <strong>Full Name</strong>, <strong>Mobile Number</strong>, and <strong>Email Address</strong>. The system will provision isolated user accounts and issue 7-day secure one-time password setup tokens.
        </p>
      </div>

      {/* Guide Banner */}
      <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong>Zero Friction Onboarding Pipeline:</strong> Users are automatically assigned the default Faculty role in their institutional tenant. A cryptographically signed one-time link is generated allowing them to set up their password without platform admin intervention.
        </div>
      </div>

      {/* Dropzone Card */}
      <Card className="p-6">
        {selectedFile ? (
          <div className="p-5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for automated account creation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setResult(null);
                }}
              >
                Change File
              </Button>

              <Button
                variant="primary"
                size="sm"
                isLoading={isUploading}
                onClick={handleImport}
                leftIcon={<UploadCloud className="w-4 h-4" />}
              >
                Execute User Onboarding
              </Button>
            </div>
          </div>
        ) : (
          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors group">
            <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-indigo-500 transition-colors mb-3" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Drag & Drop your 3-column CSV or Excel file here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Required columns: Name, Mobile, Email
            </p>
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
            />
          </label>
        )}
      </Card>

      {/* Results and Invitation Links Card */}
      {result && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  User Onboarding Summary
                </h3>
                <p className="text-xs text-slate-500">
                  Total Rows: {result.total_rows} • Created: {result.created} • Skipped: {result.skipped}
                </p>
              </div>
            </div>

            {result.setup_links && result.setup_links.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadLinksCsv}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Export Invite Links (.csv)
              </Button>
            )}
          </div>

          {/* Invitation Links Table */}
          {result.setup_links && result.setup_links.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                <span>One-Time 7-Day Password Setup Tokens Generated:</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="py-2.5 px-4">Faculty Member</th>
                      <th className="py-2.5 px-4">One-Time Setup URL</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {result.setup_links.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                        <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {item.email}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 max-w-md truncate">
                          {item.setup_url}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => copyToClipboard(item.setup_url, item.email)}
                            leftIcon={<Copy className="w-3.5 h-3.5" />}
                          >
                            Copy Link
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-500">
              No new invitation tokens were generated. Users may have already existed in this institution.
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <p className="font-bold">Errors encountered:</p>
              {result.errors.map((e, idx) => (
                <p key={idx}>• {e}</p>
              ))}
            </div>
          )}
        </Card>
      )}
      </div>
    </RouteGuard>
  );
}
