"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { structureApi } from "@/lib/api/structure";
import { activitiesApi } from "@/lib/api/activities";
import { useAuth } from "@/context/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { User, Role, UserAchievementSummary } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  Building,
  Mail,
  Phone,
  Filter,
  CheckSquare,
  Square,
  KeyRound,
  ArrowRight,
  Award,
  Lock,
  Eye,
  Edit,
  User as UserIcon,
  ExternalLink,
} from "lucide-react";

export default function UsersDirectoryPage() {
  const queryClient = useQueryClient();
  const { isTenantAdmin, isDean, isInstitutionalManager, isHOD, isCoordinator, canManageUsers } = useAuth();
  const isAdmin = canManageUsers;
  const isSuperAdminOrDean = isInstitutionalManager;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Multi-selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // View User details modal state
  const [viewUserModalOpen, setViewUserModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const handleViewUserDetails = (targetUser: User) => {
    setViewingUser(targetUser);
    setViewUserModalOpen(true);
  };

  // Bulk role modal state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [targetRoleId, setTargetRoleId] = useState<string>("");

  // Edit User modal state
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string>("");
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    employee_id: "",
    phone: "",
    department: "",
    designation: "",
    role: "",
    is_active: true,
    is_approved: true,
  });

  // Fetch Roles
  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: () => structureApi.getRoles(),
  });

  // Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => structureApi.getDepartments(),
  });

  // Fetch Designations
  const { data: designations = [] } = useQuery({
    queryKey: ["designations"],
    queryFn: () => structureApi.getDesignations(),
  });

  // Fetch User Achievement Summaries for uploaded achievements counter & detail permissions
  const { data: userSummaries = [] } = useQuery({
    queryKey: ["user-achievement-summaries"],
    queryFn: () => activitiesApi.getUserSummary(),
  });

  const summaryMap = React.useMemo(() => {
    const map = new Map<string, UserAchievementSummary>();
    userSummaries.forEach((s) => {
      map.set(s.id, s);
      map.set(s.username, s);
    });
    return map;
  }, [userSummaries]);

  // Fetch Users
  const { data, isLoading } = useQuery({
    queryKey: ["users", searchTerm, selectedRole, selectedDept, selectedStatus],
    queryFn: () =>
      structureApi.getUsers({
        search: searchTerm || undefined,
        role: selectedRole !== "all" ? selectedRole : undefined,
        department: selectedDept !== "all" ? selectedDept : undefined,
        is_approved: selectedStatus === "approved" ? true : selectedStatus === "pending" ? false : undefined,
        page_size: 100,
      }),
  });

  const users: User[] = data?.results || (Array.isArray(data) ? (data as any) : []);

  // Multi-select handlers
  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Approve Mutation
  const bulkApproveMutation = useMutation({
    mutationFn: (userIds: string[]) => structureApi.bulkApproveUsers(userIds),
    onSuccess: (res) => {
      toast.success(res.message || "Selected users approved and activated!");
      setSelectedUserIds([]);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-achievement-summaries"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Bulk approval failed.");
    },
  });

  // Single Approve Mutation
  const singleApproveMutation = useMutation({
    mutationFn: (id: string) => structureApi.approveUser(id),
    onSuccess: (res) => {
      toast.success(res.message || "User approved!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-achievement-summaries"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Approval failed.");
    },
  });

  // Bulk Assign Role Mutation
  const bulkAssignRoleMutation = useMutation({
    mutationFn: () => structureApi.bulkAssignRole(selectedUserIds, targetRoleId),
    onSuccess: (res) => {
      toast.success(res.message || "Role assigned successfully!");
      setRoleModalOpen(false);
      setSelectedUserIds([]);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Role assignment failed.");
    },
  });

  // Update User Mutation
  const updateUserMutation = useMutation({
    mutationFn: (payload: { id: string; data: any }) =>
      structureApi.updateUser(payload.id, payload.data),
    onSuccess: () => {
      toast.success("User account details updated successfully!");
      setEditUserModalOpen(false);
      setEditingUserId("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-achievement-summaries"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update user.");
    },
  });

  const handleStartEdit = (targetUser: User) => {
    setEditingUserId(targetUser.id);
    const deptId = targetUser.department?.id || (targetUser as any).department_details?.id || (typeof targetUser.department === 'string' ? targetUser.department : "");
    const desigId = targetUser.designation?.id || (targetUser as any).designation_details?.id || (typeof targetUser.designation === 'string' ? targetUser.designation : "");
    const roleId = targetUser.role?.id || (targetUser as any).role_details?.id || (typeof targetUser.role === 'string' ? targetUser.role : "");

    setEditForm({
      first_name: targetUser.first_name || "",
      last_name: targetUser.last_name || "",
      email: targetUser.email || "",
      employee_id: targetUser.employee_id || "",
      phone: targetUser.phone || "",
      department: deptId || "",
      designation: desigId || "",
      role: roleId || "",
      is_active: targetUser.is_active,
      is_approved: targetUser.is_approved,
    });
    setEditUserModalOpen(true);
  };

  return (
    <RouteGuard allowed={canManageUsers} requiredRoleName="Institutional Administrator, Dean, or Head of Department">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Institutional Faculty & User Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Directory of academic scholars, faculty members, coordinators, HODs, and accreditation contributors.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            {isSuperAdminOrDean && (
              <Link href="/dashboard/roles">
                <Button variant="outline" size="sm" leftIcon={<Shield className="w-4 h-4" />}>
                  Manage Roles
                </Button>
              </Link>
            )}
            <Link href="/dashboard/users/bulk-onboard">
              <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
                3-Col Rapid Onboard
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              options={[
                { value: "all", label: "All Institutional Roles" },
                ...roles.map((r) => ({ value: r.id, label: r.name })),
              ]}
            />
          </div>

          <div>
            <Select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              options={[
                { value: "all", label: "All Departments" },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
          </div>

          <div>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: "all", label: "All Account Statuses" },
                { value: "approved", label: "Approved & Active" },
                { value: "pending", label: "Pending Approval" },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Floating Action Toolbar (Admin Only) */}
      {isAdmin && selectedUserIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white dark:bg-indigo-950 border border-indigo-700 shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold">
              {selectedUserIds.length} User{selectedUserIds.length !== 1 ? "s" : ""} Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setSelectedUserIds([])}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Clear
            </Button>

            {isSuperAdminOrDean && (
              <Button
                size="xs"
                variant="outline"
                onClick={() => setRoleModalOpen(true)}
                className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border-indigo-500/40"
                leftIcon={<Shield className="w-3.5 h-3.5" />}
              >
                Assign Role...
              </Button>
            )}

            <Button
              size="xs"
              variant="primary"
              disabled={bulkApproveMutation.isPending}
              onClick={() => bulkApproveMutation.mutate(selectedUserIds)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-0"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Bulk Approve & Activate
            </Button>
          </div>
        </div>
      )}

      {/* User Directory Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No faculty or staff found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search or onboard faculty in bulk using our 3-column importer.
            </p>
            {isAdmin && (
              <Link href="/dashboard/users/bulk-onboard">
                <Button size="sm" variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
                  Rapid Bulk Onboard
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  {isAdmin && (
                    <th className="py-3 px-3 w-10 text-center">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        {selectedUserIds.length > 0 && selectedUserIds.length === users.length ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                  )}
                  <th className="py-3 px-4">Faculty Member / User</th>
                  <th className="py-3 px-4">Department & Designation</th>
                  <th className="py-3 px-4">Institutional Role</th>
                  <th className="py-3 px-4 text-center">Uploaded Achievements</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  const summary = summaryMap.get(u.id) || summaryMap.get(u.username);
                  const hasAchievementAccess = summary?.can_view_details ?? false;
                  const achievementsCount = summary?.achievements_count ?? 0;
                  const approvedCount = summary?.approved_count ?? 0;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors ${
                        isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      {isAdmin && (
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectUser(u.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewUserDetails(u)}
                              className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors flex items-center gap-1 group text-left cursor-pointer"
                              title={`View profile & account details for @${u.username}`}
                            >
                              <span>@{u.username}</span>
                              <Eye className="w-3 h-3 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleViewUserDetails(u)}
                              className="font-semibold text-xs text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
                              title={`View details for ${u.first_name || u.username}`}
                            >
                              {u.first_name ? `${u.first_name} ${u.last_name || ""}` : ""}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 font-mono">
                              <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                            </span>
                            {u.employee_id && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                                ID: {u.employee_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {u.department?.name || "Unassigned"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {u.designation?.name || "Faculty Member"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                          {u.role?.name || (u.is_superuser ? "Super Admin" : "Faculty")}
                        </span>
                      </td>

                      {/* Uploaded Achievements Column:
                          Inspect can_view_details:
                          - If can_view_details: false -> Display just the count / number (not clickable)
                          - If can_view_details: true -> Clickable link or button invoking GET /api/activities/?username=<clicked_username>
                      */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        {summary ? (
                          hasAchievementAccess ? (
                            <Link
                              href={`/dashboard/achievements?username=${u.username}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors group cursor-pointer"
                              title={`Click to view all ${achievementsCount} achievements for @${u.username}`}
                            >
                              <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>{achievementsCount}</span>
                              <ArrowRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-default select-none"
                              title="Detailed achievement records restricted. Displaying count only."
                            >
                              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{achievementsCount}</span>
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      {/* Approval Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {u.is_approved ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            <XCircle className="w-3 h-3" /> Pending Review
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleViewUserDetails(u)}
                            leftIcon={<UserIcon className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                            className="hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium"
                          >
                            Details
                          </Button>

                          {isAdmin && (
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleStartEdit(u)}
                              leftIcon={<Edit className="w-3 h-3 text-slate-600 dark:text-slate-400" />}
                              className="hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              Edit
                            </Button>
                          )}

                          {isAdmin && !u.is_approved && (
                            <Button
                              size="xs"
                              variant="primary"
                              isLoading={singleApproveMutation.isPending}
                              onClick={() => singleApproveMutation.mutate(u.id)}
                              leftIcon={<CheckCircle2 className="w-3 h-3" />}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              Approve
                            </Button>
                          )}

                          {hasAchievementAccess ? (
                            <Link href={`/dashboard/achievements?username=${u.username}`}>
                              <Button
                                size="xs"
                                variant="outline"
                                leftIcon={<Eye className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                                className="border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                              >
                                Records
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                              Count only
                            </span>
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

      {/* Bulk Assign Role Modal (Admin Only) */}
      {isAdmin && (
        <Modal
          isOpen={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          title={`Assign Role to ${selectedUserIds.length} Selected Users`}
          description="Select the institutional RBAC role to apply across all chosen faculty or staff accounts."
        >
          <div className="space-y-4 pt-2">
            <div>
              <Select
                label="Target Role"
                value={targetRoleId}
                onChange={(e) => setTargetRoleId(e.target.value)}
                options={[
                  { value: "", label: "Choose an institutional role..." },
                  ...roles.map((r) => ({ value: r.id, label: `${r.name} (${r.code})` })),
                ]}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="ghost" size="sm" onClick={() => setRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!targetRoleId}
                isLoading={bulkAssignRoleMutation.isPending}
                onClick={() => bulkAssignRoleMutation.mutate()}
              >
                Confirm Role Assignment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit User Modal (Admin Only) */}
      {isAdmin && (
        <Modal
          isOpen={editUserModalOpen}
          onClose={() => setEditUserModalOpen(false)}
          title="Edit Faculty / User Account"
          description="Update personal information, departmental assignment, and institutional role."
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  First Name
                </label>
                <Input
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Last Name
                </label>
                <Input
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Employee ID
                </label>
                <Input
                  value={editForm.employee_id}
                  onChange={(e) => setEditForm({ ...editForm, employee_id: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Department
                </label>
                <Select
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  options={[
                    { value: "", label: "Unassigned / None" },
                    ...departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` })),
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Designation
                </label>
                <Select
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  options={[
                    { value: "", label: "Unassigned / None" },
                    ...designations.map((d) => ({ value: d.id, label: d.name })),
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Role
              </label>
              <Select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                options={[
                  { value: "", label: "Standard Faculty (Default)" },
                  ...roles.map((r) => ({ value: r.id, label: `${r.name} (${r.code})` })),
                ]}
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Account Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={editForm.is_approved}
                  onChange={(e) => setEditForm({ ...editForm, is_approved: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Approved by Admin</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setEditUserModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={updateUserMutation.isPending}
                onClick={() => {
                  const payload: any = {
                    first_name: editForm.first_name,
                    last_name: editForm.last_name,
                    email: editForm.email,
                    employee_id: editForm.employee_id || null,
                    phone: editForm.phone,
                    department: editForm.department || null,
                    designation: editForm.designation || null,
                    role: editForm.role || null,
                    is_active: editForm.is_active,
                    is_approved: editForm.is_approved,
                  };
                  updateUserMutation.mutate({ id: editingUserId, data: payload });
                }}
              >
                {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View User Details Modal */}
      <Modal
        isOpen={viewUserModalOpen}
        onClose={() => {
          setViewUserModalOpen(false);
          setViewingUser(null);
        }}
        title="Faculty Member & User Details"
        description="Comprehensive profile, academic departmental assignment, and institutional accreditation portfolio."
      >
        {viewingUser && (
          <div className="space-y-5 pt-2">
            {/* Header banner */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0">
                {(viewingUser.first_name?.[0] || viewingUser.username[0] || "U").toUpperCase()}
                {(viewingUser.last_name?.[0] || "").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {viewingUser.first_name ? `${viewingUser.first_name} ${viewingUser.last_name || ""}` : viewingUser.username}
                  </h3>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    @{viewingUser.username}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-600 text-white shadow-xs">
                    {viewingUser.role?.name || (viewingUser.is_superuser ? "Super Admin" : "Faculty Member")}
                  </span>
                  {viewingUser.is_approved ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> Active & Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      <XCircle className="w-3 h-3" /> Pending Admin Approval
                    </span>
                  )}
                  {viewingUser.is_department_head && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      HOD
                    </span>
                  )}
                  {viewingUser.is_coordinator && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Coordinator
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Academic Department
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{viewingUser.department?.name || viewingUser.department_name || "Unassigned"}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Academic Designation
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {viewingUser.designation?.name || viewingUser.designation_name || "Faculty Member"}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </div>
                <div className="text-xs font-mono font-medium text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${viewingUser.email}`} className="hover:underline truncate">
                    {viewingUser.email || "No email on record"}
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Employee ID & Phone
                </div>
                <div className="text-xs font-mono text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
                  <span>ID: {viewingUser.employee_id || "N/A"}</span>
                  {viewingUser.phone && <span>• {viewingUser.phone}</span>}
                </div>
              </div>
            </div>

            {/* Achievement Portfolio Summary Card */}
            {(() => {
              const uSummary = summaryMap.get(viewingUser.username) || summaryMap.get(viewingUser.id);
              const totalUploaded = uSummary?.achievements_count ?? 0;
              const totalApproved = uSummary?.approved_count ?? 0;

              return (
                <div className="p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/40 via-white to-slate-50/40 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Accreditation & Achievement Records
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {totalUploaded} Total Submissions
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {totalApproved} Audit Ready
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                      View all publications, patents, conferences, and FDP certifications uploaded by this faculty scholar.
                    </p>
                    <Link
                      href={`/dashboard/achievements?username=${viewingUser.username}`}
                      onClick={() => setViewUserModalOpen(false)}
                    >
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<Award className="w-3.5 h-3.5" />}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                      >
                        View Achievement Records &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })()}

            {/* Actions footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href={`/dashboard/users/${viewingUser.id}`}
                onClick={() => setViewUserModalOpen(false)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Open Full User Page</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Edit className="w-3.5 h-3.5" />}
                    onClick={() => {
                      const uToEdit = viewingUser;
                      setViewUserModalOpen(false);
                      handleStartEdit(uToEdit);
                    }}
                  >
                    Edit Account
                  </Button>
                )}
                {isAdmin && !viewingUser.is_approved && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      singleApproveMutation.mutate(viewingUser.id);
                      setViewUserModalOpen(false);
                    }}
                  >
                    Approve User
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setViewUserModalOpen(false);
                    setViewingUser(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </RouteGuard>
  );
}
