"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api/auth";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import {
  User as UserIcon,
  Shield,
  Building,
  Key,
  Save,
  ArrowLeft,
  Mail,
  Phone,
  IdCard,
  Briefcase,
  GraduationCap,
} from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  // Profile fields state
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync state if user loads late
  React.useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await authApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
      });
      await refreshUser();
      toast.success("Profile details updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      toast.error(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password.";
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col">
      <DashboardHeader title="User Profile" subtitle="Manage your academic credentials and personal security settings" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Identity Hero Banner */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-xs">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/20 shrink-0">
            {(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username}
              </h2>
              <Badge variant="primary" size="md">
                {user?.role?.name || (user?.is_superuser ? "Super Admin" : "Faculty Member")}
              </Badge>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-mono text-xs">@{user?.username}</span>
            </p>

            <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-600 dark:text-slate-400">
              {user?.tenant && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-medium">{user.tenant.name}</span>
                </span>
              )}
              {user?.department && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                  <span>Dept of {user.department.name}</span>
                </span>
              )}
              {user?.designation && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{user.designation.name}</span>
                </span>
              )}
              {user?.employee_id && (
                <span className="flex items-center gap-1.5 font-mono">
                  <IdCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>ID: {user.employee_id}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Edit Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-500" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Update your contact details and display names
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                  />
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                  />
                </div>

                <Input
                  label="Contact Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Email Address"
                  value={user?.email || ""}
                  disabled
                  helperText="Managed by institutional tenant administrator"
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Button
                  type="submit"
                  isLoading={isUpdatingProfile}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="w-full"
                >
                  Save Profile Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security & Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-4 h-4 text-violet-500" />
                <span>Password & Security</span>
              </CardTitle>
              <CardDescription>
                Ensure your account is protected with a strong password
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                />

                <Button
                  type="submit"
                  variant="secondary"
                  isLoading={isChangingPassword}
                  leftIcon={<Shield className="w-4 h-4" />}
                  className="w-full"
                >
                  Update Account Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
