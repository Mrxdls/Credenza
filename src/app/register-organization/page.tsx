"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { tenantsApi } from "@/lib/api/tenants";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Mail,
  User,
  Phone,
  Lock,
  Globe,
  MapPin,
  Sparkles,
  ArrowRight,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function RegisterOrganizationPage() {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    domain: "",
    subscription_tier: "trial",
    address: "",
    admin_first_name: "",
    admin_last_name: "",
    admin_email: "",
    admin_phone: "",
    admin_password: "",
    confirm_password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    tenantName: string;
    tenantCode: string;
    adminEmail: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic client validation
    if (!formData.name.trim() || !formData.code.trim()) {
      setErrorMsg("Institution Name and Short Code are required.");
      return;
    }
    if (!formData.admin_email.trim() || !formData.admin_email.includes("@")) {
      setErrorMsg("Please enter a valid administrator work email.");
      return;
    }
    if (formData.admin_password.length < 8) {
      setErrorMsg("Administrator password must be at least 8 characters.");
      return;
    }
    if (formData.admin_password !== formData.confirm_password) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await tenantsApi.registerOrganization({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        domain: formData.domain.trim() || undefined,
        subscription_tier: formData.subscription_tier as any,
        address: formData.address.trim(),
        admin_first_name: formData.admin_first_name.trim(),
        admin_last_name: formData.admin_last_name.trim(),
        admin_email: formData.admin_email.trim().toLowerCase(),
        admin_phone: formData.admin_phone.trim(),
        admin_password: formData.admin_password,
        confirm_password: formData.confirm_password,
      });

      if (res.success || res.tenant) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success("Institution registration submitted successfully!");
        setSubmittedData({
          tenantName: formData.name,
          tenantCode: formData.code.toUpperCase(),
          adminEmail: formData.admin_email,
        });
      } else {
        setErrorMsg(res.message || "Failed to register institution.");
        toast.error("Registration failed. Please check form errors.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "An unexpected error occurred.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {submittedData ? (
          /* Confirmation Success Card */
          <Card className="p-8 sm:p-12 text-center max-w-2xl mx-auto border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <Badge variant="success" size="md" className="mb-4">
              Registration Under Supreme Review
            </Badge>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome to Credenza
            </h1>

            <p className="mt-3 text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              Your institutional registration for <strong className="text-slate-900 dark:text-white">{submittedData.tenantName}</strong>{" "}
              (Code: <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-sm">{submittedData.tenantCode}</code>) has been logged in our multi-tenant catalog.
            </p>

            <div className="mt-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-left text-sm space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Status: <strong>Pending Platform Supreme Admin Approval</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Designated Admin: <strong>{submittedData.adminEmail}</strong></span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                For security and audit isolation, our platform team manually validates every institution. You will receive an email once your tenant workspace is activated.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Proceed to Sign In
                </Button>
              </Link>
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Back to Homepage
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Registration Form */
          <div>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Institutional Self-Service Onboarding
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Register Your University or College
              </h1>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                Provision a dedicated, isolated Credenza tenant for your institution with instant NAAC AQAR tracking and R2 document storage.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm">
                <strong>Registration Error:</strong> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Card 1: Institution Details */}
              <Card className="p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Institutional Identity</h2>
                    <p className="text-xs text-slate-500">Legal university or college metadata for official accreditation records</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <Input
                      label="Institution / University Name"
                      name="name"
                      required
                      placeholder="e.g. Poornima Institute of Engineering & Technology"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Input
                      label="Short Code / Acronym"
                      name="code"
                      required
                      placeholder="e.g. PIET or PU"
                      value={formData.code}
                      onChange={handleChange}
                      helperText="Used as institutional prefix for employee IDs and logs"
                    />
                  </div>

                  <div>
                    <Input
                      label="Institutional Web Domain"
                      name="domain"
                      placeholder="e.g. piet.poornima.org"
                      value={formData.domain}
                      onChange={handleChange}
                      leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
                      helperText="Optional custom domain or university website"
                    />
                  </div>

                  <div>
                    <Select
                      label="Subscription Tier"
                      name="subscription_tier"
                      value={formData.subscription_tier}
                      onChange={handleChange}
                      options={[
                        { value: "trial", label: "Trial Sandbox (30 Days Full Access)" },
                        { value: "pro", label: "Pro University (Annual NAAC / NIRF Engine)" },
                        { value: "enterprise", label: "Enterprise (Multi-Campus & Custom SLA)" },
                      ]}
                    />
                  </div>

                  <div>
                    <Input
                      label="Campus Location / City"
                      name="address"
                      placeholder="e.g. Jaipur, Rajasthan, India"
                      value={formData.address}
                      onChange={handleChange}
                      leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
                    />
                  </div>
                </div>
              </Card>

              {/* Card 2: Initial Administrator Account */}
              <Card className="p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Primary Administrator Account</h2>
                    <p className="text-xs text-slate-500">First Super Admin credential for your institution's tenant dashboard</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Input
                      label="Admin First Name"
                      name="admin_first_name"
                      placeholder="e.g. Rahul"
                      value={formData.admin_first_name}
                      onChange={handleChange}
                      leftIcon={<User className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <div>
                    <Input
                      label="Admin Last Name"
                      name="admin_last_name"
                      placeholder="e.g. Sharma"
                      value={formData.admin_last_name}
                      onChange={handleChange}
                      leftIcon={<User className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <div>
                    <Input
                      label="Work Email Address"
                      name="admin_email"
                      type="email"
                      required
                      placeholder="e.g. principal@piet.poornima.org"
                      value={formData.admin_email}
                      onChange={handleChange}
                      leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                      helperText="Used as your login username"
                    />
                  </div>

                  <div>
                    <Input
                      label="Contact Mobile Number"
                      name="admin_phone"
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={formData.admin_phone}
                      onChange={handleChange}
                      leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <div>
                    <Input
                      label="Password"
                      name="admin_password"
                      type="password"
                      required
                      placeholder="At least 8 characters"
                      value={formData.admin_password}
                      onChange={handleChange}
                      leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                    />
                  </div>

                  <div>
                    <Input
                      label="Confirm Password"
                      name="confirm_password"
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                    />
                  </div>
                </div>
              </Card>

              {/* Submit CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  By submitting, you agree to Credenza's Academic Integrity & Data Privacy Terms.
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button variant="ghost" type="button" className="w-full sm:w-auto">
                      Already registered? Sign in
                    </Button>
                  </Link>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full sm:w-auto"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Submit Registration
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
