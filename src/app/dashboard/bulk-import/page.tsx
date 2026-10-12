"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { activitiesApi, BulkImportResponse } from "@/lib/api/activities";
import { useAuth } from "@/context/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileArchive,
  ArrowRight,
  Info,
  X,
  FileText,
  Table as TableIcon,
} from "lucide-react";

export default function BulkImportPage() {
  const { isTenantAdmin, isDean, isHOD, isCoordinator } = useAuth();
  const isElevated = isTenantAdmin || isDean || isHOD || isCoordinator;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<BulkImportResponse | null>(null);

  // Handle file selection and client-side XLSX parse
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setResult(null);

    // If Excel file, parse preview rows in browser
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv")) {
      try {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const firstSheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[firstSheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (json.length > 0) {
          const headers = json[0] as string[];
          const rows = json.slice(1, 6); // preview first 5 rows
          setPreviewHeaders(headers);
          setPreviewData(rows);
        }
      } catch (err) {
        console.warn("Could not parse preview:", err);
      }
    } else {
      setPreviewHeaders([]);
      setPreviewData([]);
    }
  };

  // Submit bulk import
  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Please select an Excel or ZIP file to import.");
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      const res = await activitiesApi.bulkImport(selectedFile);
      setResult(res);

      if (res.success || res.created_count > 0 || res.updated_count > 0) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
        toast.success(`Ingested ${res.created_count} new academic records!`);
      } else {
        toast.warning(res.message || "Import finished with warnings.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Bulk import failed. Please verify spreadsheet structure.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSample = () => {
    // Generate institutional NAAC-compliant Excel sample with tabs matching BulkIngestionService
    const wb = XLSX.utils.book_new();

    // Tab 1: Journal Publications
    const journalHeaders = [
      "Sr. No.",
      "Name of Faculty",
      "Department",
      "Designation",
      "Title of Publictaion",
      "Name of the Journal",
      "ISSN Number",
      "DOI",
      "Indexing",
      "Academic Session",
      "Year of Publication",
    ];
    const journalRows = [
      [
        "1",
        "Dr. Ramesh Sharma",
        "Computer Science",
        "Professor",
        "Deep Residual Learning for Image Recognition",
        "IEEE Transactions on Neural Networks",
        "2162-237X",
        "10.1109/TNNLS.2025.1092837",
        "Scopus, WoS",
        "2025-2026",
        "2025",
      ],
    ];
    const wsJournals = XLSX.utils.aoa_to_sheet([journalHeaders, ...journalRows]);
    XLSX.utils.book_append_sheet(wb, wsJournals, "Journal Publications");

    // Tab 2: Conference Publications
    const confHeaders = [
      "Sr. No.",
      "Name of Faculty",
      "Department",
      "Designation",
      "Title of the Paper",
      "Title of the Proceedings",
      "ISBN",
      "Academic Session",
      "Year of Publication",
    ];
    const confRows = [
      [
        "1",
        "Prof. Sunita Agarwal",
        "Electronics & Communication",
        "Associate Professor",
        "Low-Power VLSI Architecture for Edge Processing",
        "International Conference on VLSI Design (VLSID)",
        "978-1-6654-9821-0",
        "2025-2026",
        "2025",
      ],
    ];
    const wsConf = XLSX.utils.aoa_to_sheet([confHeaders, ...confRows]);
    XLSX.utils.book_append_sheet(wb, wsConf, "Conference Publications");

    // Tab 3: Patents
    const patentHeaders = [
      "Sr. No.",
      "Name of Faculty",
      "Department",
      "Designation",
      "Title of Patent",
      "Patent/Application Number",
      "Patent Legal Status",
      "Academic Session",
      "Year of Publication",
    ];
    const patentRows = [
      [
        "1",
        "Dr. Amit Verma",
        "Mechanical Engineering",
        "Professor",
        "IoT-Based Autonomous Irrigation Apparatus",
        "202511029841",
        "Published",
        "2025-2026",
        "2025",
      ],
    ];
    const wsPatents = XLSX.utils.aoa_to_sheet([patentHeaders, ...patentRows]);
    XLSX.utils.book_append_sheet(wb, wsPatents, "Patents");

    // Tab 4: Faculty Participation (FDP)
    const fdpHeaders = [
      "Sr. No.",
      "Name of Faculty",
      "Department",
      "Designation",
      "Title of the Program",
      "Organizing Body",
      "Academic Session",
      "Duration of the Program",
    ];
    const fdpRows = [
      [
        "1",
        "Dr. Ramesh Sharma",
        "Computer Science",
        "Professor",
        "5-Day Workshop on Quantum Machine Learning",
        "IIT Delhi",
        "2025-2026",
        "5 Days",
      ],
    ];
    const wsFdp = XLSX.utils.aoa_to_sheet([fdpHeaders, ...fdpRows]);
    XLSX.utils.book_append_sheet(wb, wsFdp, "Faculty Participation");

    XLSX.writeFile(wb, "Credenza_Standard_Faculty_Achievement_Template.xlsx");
    toast.success("Downloaded standard NAAC-compliant ingestion template.");
  };

  return (
    <RouteGuard allowed={isElevated} requiredRoleName="Department Coordinator, HOD, Dean, or Administrator">
      <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bulk Spreadsheet & ZIP Ingestion Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Import hundreds of faculty publications, patents, and conference records in seconds.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadSample}
          leftIcon={<Download className="w-4 h-4 text-indigo-500" />}
        >
          Download Standard Template (.xlsx)
        </Button>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed space-y-1">
          <p className="font-bold">Supported Ingestion Formats:</p>
          <p className="text-slate-600 dark:text-slate-300">
            • <strong>Excel Workbook (.xlsx, .xls):</strong> Ingest bibliographic records mapped by faculty email or employee ID.
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            • <strong>ZIP Archive (.zip):</strong> Ingest a spreadsheet accompanied by proof PDFs for automatic R2 document linkage.
          </p>
        </div>
      </div>

      {/* Dropzone Card */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Select or Upload Bulk Dataset
        </h2>

        {selectedFile ? (
          <div className="p-5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                {selectedFile.name.endsWith(".zip") ? (
                  <FileArchive className="w-6 h-6" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for institutional ingestion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewData([]);
                  setPreviewHeaders([]);
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
                Execute Bulk Ingestion
              </Button>
            </div>
          </div>
        ) : (
          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors group">
            <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-indigo-500 transition-colors mb-3" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Drag & Drop your Excel workbook or ZIP archive here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports .xlsx, .xls, .csv, and .zip up to 50MB
            </p>
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv,.zip"
              onChange={handleFileChange}
            />
          </label>
        )}

        {/* Live Client Preview Table */}
        {previewData.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <TableIcon className="w-4 h-4 text-indigo-500" />
              <span>Spreadsheet Preview (First {previewData.length} Rows):</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  <tr>
                    {previewHeaders.map((h, i) => (
                      <th key={i} className="py-2 px-3 whitespace-nowrap border-b border-slate-200 dark:border-slate-700">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewData.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      {previewHeaders.map((_, cIdx) => (
                        <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {row[cIdx] !== undefined ? String(row[cIdx]) : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Result Metrics Card */}
      {result && (
        <Card className="p-6 border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bulk Ingestion Completed
              </h3>
              <p className="text-xs text-slate-500">{result.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Created</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {result.created_count}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Updated</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {result.updated_count}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Skipped</span>
              <p className="text-2xl font-black text-slate-600 dark:text-slate-400 mt-1">
                {result.skipped_count}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Errors</span>
              <p className={`text-2xl font-black mt-1 ${result.error_count > 0 ? "text-rose-600" : "text-slate-400"}`}>
                {result.error_count}
              </p>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <p className="font-bold">Ingestion Warning Notes:</p>
              {result.errors.slice(0, 5).map((err, i) => (
                <p key={i}>• {err}</p>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Link href="/dashboard/achievements">
              <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Ingested Achievements Repository
              </Button>
            </Link>
          </div>
        </Card>
      )}
      </div>
    </RouteGuard>
  );
}
