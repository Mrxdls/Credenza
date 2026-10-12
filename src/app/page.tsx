"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  Award,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  BookOpen,
  FileCheck,
  Building2,
  Users,
  ChevronRight,
  Sparkles,
  BarChart3,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"3.4.5" | "3.4.6" | "3.4.3" | "6.3.3">("3.4.5");

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#070b12] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-indigo-500/15 via-violet-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-48 -left-36 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-48 -right-36 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-8 shadow-xs animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>NAAC AQAR Criteria 3 & NIRF Intelligence Platform</span>
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Credenza v2.0</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl leading-[1.1] mb-6">
            Where Academic Excellence Meets{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 dark:from-indigo-400 dark:via-indigo-300 dark:to-violet-400">
              Audit Precision.
            </span>
          </h1>

          {/* Subheader */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed mb-10">
            Eliminate the spreadsheet panic. Credenza unites professors, department data coordinators, and deans into a single, verified institutional operating system for research publications, patents, and instant NAAC exports.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-16">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-8 shadow-lg shadow-indigo-500/25" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Live Demo
              </Button>
            </Link>

            <Link href="/register-organization" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8" leftIcon={<Building2 className="w-4 h-4" />}>
                Register Your Institution
              </Button>
            </Link>
          </div>

          {/* Interactive UI Mockup Hero Showcase */}
          <div className="w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] shadow-2xl p-2 sm:p-4 relative">
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-6 text-left">
              {/* Window controls bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">credenza.university.edu/dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="approved" size="sm" dot>Live Audit Mode</Badge>
                  <span className="text-xs font-semibold text-slate-500">Academic Year 2025-26</span>
                </div>
              </div>

              {/* Top KPI Cards Mock */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
                  <div className="text-xs text-slate-500 font-medium">Criterion 3.4.5 (Journals)</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">428</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">↑ 24% vs last cycle</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
                  <div className="text-xs text-slate-500 font-medium">Criterion 3.4.3 (Patents)</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">36</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">14 Granted • 22 Published</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
                  <div className="text-xs text-slate-500 font-medium">Attached Proof Documents</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">98.4%</div>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Cloudflare R2 Encrypted</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
                  <div className="text-xs text-slate-500 font-medium">NAAC Export Readiness</div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">100%</div>
                  <div className="text-[11px] text-slate-500 mt-1">AQAR Format Verified</div>
                </div>
              </div>

              {/* Sample Submissions Preview Rows */}
              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Distributed Deep Learning Acceleration on Cloudflare Workers
                      </div>
                      <div className="text-[11px] text-slate-500">
                        IEEE Transactions on Cloud Computing • Scopus / WoS Indexed
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="approved">Verified</Badge>
                    <span className="text-xs text-slate-400">PDF Proof Attached</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Autonomous Drone Path Navigation via Neuromorphic Vision
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Indian Patent Gazette (App No: 202611004812) • Published
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="approved">Verified</Badge>
                    <span className="text-xs text-slate-400">Gazette Attached</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Comparison Section */}
      <section id="workflow" className="py-20 bg-slate-50/60 dark:bg-[#0b101c] border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-2">
              The Accreditation Dilemma
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Why University Data Collection Always Breaks Down
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-4 text-base">
              Every year before the NAAC AQAR deadline, department coordinators waste hundreds of hours manually compiling messy spreadsheets and hunting down proof certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="rounded-2xl border border-rose-200 dark:border-rose-950/60 bg-white dark:bg-slate-900/60 p-8 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase mb-4">
                  The Old Way (Spreadsheet Chaos)
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Manual chasing, corrupt files & audit panic
                </h4>
                <ul className="space-y-3.5 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Clerks chase 50+ professors over email, WhatsApp, and phone calls for months.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Duplicate journal entries, inconsistent authors, and missing ISSN/ISBN numbers.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Lost proof certificates stored randomly across personal Google Drives.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Days spent manually reformatting columns into official NAAC AQAR tables.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-rose-600 font-semibold">
                Result: Delayed AQAR submissions, HOD stress, and lower NIRF scores.
              </div>
            </div>

            {/* The Credenza Way */}
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/80 bg-white dark:bg-slate-900/90 p-8 flex flex-col justify-between shadow-xl shadow-indigo-500/5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase mb-4">
                  The Credenza Way (Audit Intelligence)
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Automated submissions, Cloudflare R2 proofs & 1-click exports
                </h4>
                <ul className="space-y-3.5 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Faculty submit achievements online or via 3-column bulk spreadsheets.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Split-screen verification: Coordinators cross-examine metadata and proofs in 1 click.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Cloudflare R2 direct zero-egress document storage: proofs never get lost.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Instant 1-click formatted Excel export matching official NAAC Criteria 3.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Result: 100% audit compliance, verified data integrity, and zero stress.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive NAAC Criteria 3 Engine Showcase */}
      <section id="accreditation" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-2">
              Compliance Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Pre-Engineered for NAAC AQAR Criteria 3 & NIRF
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-4 text-base">
              Credenza maps each faculty activity directly to the exact metric required by the National Assessment and Accreditation Council.
            </p>
          </div>

          {/* Interactive Criteria Tab Switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab("3.4.5")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "3.4.5"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Criterion 3.4.5 (Journals)
              </button>
              <button
                onClick={() => setActiveTab("3.4.6")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "3.4.6"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Criterion 3.4.6 (Conferences)
              </button>
              <button
                onClick={() => setActiveTab("3.4.3")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "3.4.3"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Criterion 3.4.3 (Patents)
              </button>
              <button
                onClick={() => setActiveTab("6.3.3")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "6.3.3"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Criterion 6.3.3 (FDPs)
              </button>
            </div>
          </div>

          {/* Dynamic Tab Card */}
          <Card className="p-6 sm:p-8">
            {activeTab === "3.4.5" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <Badge variant="primary" size="md">NAAC Metric 3.4.5</Badge>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Research Publications in UGC-CARE, Scopus & Web of Science
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Tracks title, journal name, ISSN, volume, issue, page numbers, publication year, indexing category, and direct DOI link. Automatically aggregates university totals per department for annual reporting.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">ISSN Validation</span>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">Scopus / WoS Flags</span>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">First / Corresponding Author</span>
                  </div>
                </div>
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs space-y-3">
                  <div className="font-bold text-slate-900 dark:text-white">Export Output Format:</div>
                  <div className="font-mono text-[11px] text-slate-500 space-y-1">
                    <div>• Title of paper</div>
                    <div>• Name of author(s)</div>
                    <div>• Department of teacher</div>
                    <div>• Name of Journal</div>
                    <div>• Year of publication</div>
                    <div>• ISSN Number</div>
                    <div>• UGC-CARE / Scopus Link</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "3.4.6" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <Badge variant="primary" size="md">NAAC Metric 3.4.6</Badge>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Books, Chapters & Conference Proceedings
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Collects book title, chapter title, conference name, proceedings publisher, ISBN number, conference dates, and city. Includes author attribution and verified proof uploads.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs space-y-3">
                  <div className="font-bold text-slate-900 dark:text-white">Export Output Format:</div>
                  <div className="font-mono text-[11px] text-slate-500 space-y-1">
                    <div>• Teacher Name</div>
                    <div>• Title of Book/Chapter</div>
                    <div>• Title of Conference Paper</div>
                    <div>• ISBN Number</div>
                    <div>• Name of Publisher</div>
                    <div>• National / International</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "3.4.3" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <Badge variant="primary" size="md">NAAC Metric 3.4.3</Badge>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Patents Published & Granted
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Tracks intellectual property milestones: Patent or application number, filing date, grant date, status (Filed / Published / Granted), patent office jurisdiction, and official gazette document links.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs space-y-3">
                  <div className="font-bold text-slate-900 dark:text-white">Export Output Format:</div>
                  <div className="font-mono text-[11px] text-slate-500 space-y-1">
                    <div>• Patent Title</div>
                    <div>• Patent Application No.</div>
                    <div>• Name of Inventor(s)</div>
                    <div>• Award / Filing Year</div>
                    <div>• Official Gazette Link</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "6.3.3" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <Badge variant="primary" size="md">NAAC Metric 6.3.3</Badge>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Faculty Development Programs (FDP), Workshops & Refresher Courses
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Tracks faculty participation in professional development programs, organizing bodies, duration in days, participation capacity (Attended / Resource Person / Conducted), and completion certificate verification.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs space-y-3">
                  <div className="font-bold text-slate-900 dark:text-white">Export Output Format:</div>
                  <div className="font-mono text-[11px] text-slate-500 space-y-1">
                    <div>• Faculty Member</div>
                    <div>• Title of Program</div>
                    <div>• Organizing Institution</div>
                    <div>• Date Range & Duration</div>
                    <div>• Verified Certificate Proof</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-slate-50/60 dark:bg-[#0b101c] border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-2">
              Platform Features
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Engineered for Complete Institutional Governance
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hoverEffect className="p-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Cloudflare R2 Proof Engine
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Direct browser-to-bucket presigned PUT uploads. Proofs are securely stored in Cloudflare R2 with zero server memory overhead and protected by zero-egress presigned download tokens.
              </p>
            </Card>

            <Card hoverEffect className="p-6">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Split-Screen Review Drawer
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Coordinators and HODs review records side-by-side with attached certificates. 1-click approvals, revision requests, and atomic mass verification across departments.
              </p>
            </Card>

            <Card hoverEffect className="p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                3-Column Rapid Onboarding
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Onboard 1,000+ faculty in 60 seconds with a 3-column CSV (Name, Mobile, Email). Generates 7-day secure one-time password links so faculty can set their own passwords.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscription Tiers Section */}
      <section id="tiers" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-2">
              Institutional Plans
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Predictable Pricing for Universities & Colleges
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Trial Tier */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Sandbox Trial</h4>
                <p className="text-xs text-slate-500 mt-1">For evaluating with a single department</p>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">Free</div>
                <div className="text-xs text-slate-400">30-day evaluation</div>

                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">✓ Up to 25 faculty accounts</li>
                  <li className="flex items-center gap-2">✓ Full NAAC Criteria 3 Export</li>
                  <li className="flex items-center gap-2">✓ Cloudflare R2 Proof Uploads</li>
                  <li className="flex items-center gap-2">✓ Standard Support</li>
                </ul>
              </div>

              <Link href="/register-organization" className="mt-8">
                <Button variant="outline" className="w-full">Start 30-Day Trial</Button>
              </Link>
            </div>

            {/* University Pro Tier */}
            <div className="rounded-2xl border-2 border-indigo-600 bg-white dark:bg-slate-900 p-8 flex flex-col justify-between shadow-xl shadow-indigo-500/10 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                Most Popular
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">University Pro</h4>
                <p className="text-xs text-slate-500 mt-1">Full institutional audit governance</p>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">Annual License</div>
                <div className="text-xs text-slate-400">Per university campus</div>

                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">✓ Unlimited faculty & departments</li>
                  <li className="flex items-center gap-2">✓ NAAC AQAR + NIRF Automated Tables</li>
                  <li className="flex items-center gap-2">✓ Cloudflare R2 zero-egress storage</li>
                  <li className="flex items-center gap-2">✓ 3-Column Rapid Bulk Onboarding</li>
                  <li className="flex items-center gap-2">✓ Priority Accreditation Support</li>
                </ul>
              </div>

              <Link href="/register-organization" className="mt-8">
                <Button className="w-full">Register Institution</Button>
              </Link>
            </div>

            {/* Enterprise Multi-Campus Tier */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">System Enterprise</h4>
                <p className="text-xs text-slate-500 mt-1">Multi-campus university systems</p>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">Custom</div>
                <div className="text-xs text-slate-400">Enterprise Multi-tenant</div>

                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center gap-2">✓ Multi-campus tenant isolation</li>
                  <li className="flex items-center gap-2">✓ Full Institutional Admin control</li>
                  <li className="flex items-center gap-2">✓ Custom D1 / Postgres storage</li>
                  <li className="flex items-center gap-2">✓ Dedicated Solution Engineer</li>
                  <li className="flex items-center gap-2">✓ 99.9% Uptime SLA</li>
                </ul>
              </div>

              <Link href="/register-organization" className="mt-8">
                <Button variant="outline" className="w-full">Contact Enterprise</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to streamline your next NAAC accreditation cycle?
          </h3>
          <p className="text-indigo-200 mt-3 text-sm max-w-xl mx-auto">
            Join institutions that have replaced manual spreadsheet panic with Credenza's audit-ready platform.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register-organization">
              <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 shadow-md">
                Register Your Institution
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-white border-white/40 hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#070b12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 dark:text-slate-200">CREDENZA</span>
            <span>•</span>
            <span>Accreditation & Faculty Intelligence OS</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Compatible with NAAC, NIRF & NBA Standards</span>
            <span>•</span>
            <span>Cloudflare R2 Object Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
