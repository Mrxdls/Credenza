"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { structureApi } from "@/lib/api/structure";
import { useAuth } from "@/context/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Role, RolePermission } from "@/types";
import { toast } from "sonner";
import {
  Shield,
  PlusCircle,
  Settings,
  Trash2,
  Check,
  CheckCircle2,
  XCircle,
  Search,
  Lock,
  Layers,
  Award,
  FileCheck,
  FileSpreadsheet,
  Users,
  Edit,
  Copy,
} from "lucide-react";

interface ModulePermissionForm {
  module_code: string;
  module_name: string;
  description: string;
  icon: React.ReactNode;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
}

const DEFAULT_MODULES: { code: string; name: string; description: string; icon: any }[] = [
  {
    code: "activities",
    name: "Faculty Achievements",
    description: "Submit, audit, and track journal articles, conferences, patents, and FDPs",
    icon: <Award className="w-4 h-4 text-indigo-500" />,
  },
  {
    code: "documents",
    name: "Proof Documents",
    description: "Upload and verify supporting evidence certificates and approval letters",
    icon: <FileCheck className="w-4 h-4 text-emerald-500" />,
  },
  {
    code: "reports",
    name: "Accreditation & NAAC Reports",
    description: "Generate NAAC Criteria 3, NIRF, and departmental export matrices",
    icon: <FileSpreadsheet className="w-4 h-4 text-amber-500" />,
  },
  {
    code: "accounts",
    name: "User & Department Management",
    description: "Manage faculty profiles, onboarding, departments, and institutional designations",
    icon: <Users className="w-4 h-4 text-purple-500" />,
  },
];

export default function RolesManagementPage() {
  const queryClient = useQueryClient();
  const { isTenantAdmin, isInstitutionalManager } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");

  // Create Role Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleCode, setRoleCode] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roleScope, setRoleScope] = useState<"organization" | "department" | "self">("department");
  const [roleRank, setRoleRank] = useState<number>(30);

  // Edit Role Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editScope, setEditScope] = useState<"organization" | "department" | "self">("department");
  const [editRank, setEditRank] = useState<number>(30);

  // Permissions Config Modal state
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permMatrix, setPermMatrix] = useState<ModulePermissionForm[]>([]);

  // Fetch Roles
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => structureApi.getRoles(),
  });

  // Create Role Mutation
  const createMutation = useMutation({
    mutationFn: () =>
      structureApi.createRole({
        name: roleName.trim(),
        code: roleCode.trim().toLowerCase(),
        description: roleDescription.trim(),
        scope: roleScope,
        rank: Number(roleRank),
      }),
    onSuccess: (newRole) => {
      toast.success(`Role '${newRole.name}' created successfully!`);
      setCreateModalOpen(false);
      setRoleName("");
      setRoleCode("");
      setRoleDescription("");
      setRoleScope("department");
      setRoleRank(30);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to create role.");
    },
  });

  // Update Role Mutation
  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingRole) throw new Error("No role selected");
      return structureApi.updateRole(editingRole.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        scope: editScope,
        rank: Number(editRank),
      });
    },
    onSuccess: (updatedRole) => {
      toast.success(`Role '${updatedRole.name}' updated successfully!`);
      setEditModalOpen(false);
      setEditingRole(null);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update role.");
    },
  });

  // Clone Role Mutation
  const cloneMutation = useMutation({
    mutationFn: (id: string) => structureApi.cloneRole(id),
    onSuccess: (clonedRole) => {
      toast.success(`Role cloned as '${clonedRole.name}'. You can now freely customize it!`);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to clone role.");
    },
  });

  // Delete Role Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => structureApi.deleteRole(id),
    onSuccess: () => {
      toast.success("Custom role removed.");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Cannot delete system role or role in active use.");
    },
  });

  const handleOpenEditModal = (role: Role) => {
    setEditingRole(role);
    setEditName(role.name);
    setEditDescription(role.description || "");
    setEditScope((role.scope as any) || "department");
    setEditRank(role.rank ?? 30);
    setEditModalOpen(true);
  };

  // Set Permissions Mutation
  const setPermsMutation = useMutation({
    mutationFn: () => {
      if (!selectedRole) throw new Error("No role selected");
      const permsPayload = permMatrix.map((m) => ({
        module_code: m.module_code,
        can_view: m.can_view,
        can_create: m.can_create,
        can_edit: m.can_edit,
        can_delete: m.can_delete,
        can_approve: m.can_approve,
        can_export: m.can_export,
      }));
      return structureApi.setRolePermissions(selectedRole.id, permsPayload);
    },
    onSuccess: () => {
      toast.success(`Permissions updated for '${selectedRole?.name}'!`);
      setPermModalOpen(false);
      setSelectedRole(null);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update role permissions.");
    },
  });

  const handleOpenPermsModal = (role: Role) => {
    setSelectedRole(role);
    const existingPerms = role.permissions || [];
    const matrix: ModulePermissionForm[] = DEFAULT_MODULES.map((dm) => {
      const match = existingPerms.find((p) => p.module_code === dm.code);
      return {
        module_code: dm.code,
        module_name: dm.name,
        description: dm.description,
        icon: dm.icon,
        can_view: match?.can_view ?? false,
        can_create: match?.can_create ?? false,
        can_edit: match?.can_edit ?? false,
        can_delete: match?.can_delete ?? false,
        can_approve: match?.can_approve ?? false,
        can_export: match?.can_export ?? false,
      };
    });
    setPermMatrix(matrix);
    setPermModalOpen(true);
  };

  const togglePerm = (moduleIndex: number, action: keyof Omit<ModulePermissionForm, "module_code" | "module_name" | "description" | "icon">) => {
    setPermMatrix((prev) => {
      const updated = [...prev];
      updated[moduleIndex] = {
        ...updated[moduleIndex],
        [action]: !updated[moduleIndex][action],
      };
      return updated;
    });
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <RouteGuard allowed={isInstitutionalManager} requiredRoleName="Institutional Administrator or Dean">
      <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Institutional Roles & Dynamic RBAC</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define institutional roles and configure granular permissions across faculty achievements, reviews, and reports.
          </p>
        </div>

        {isTenantAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Institutional Role
          </Button>
        )}
      </div>

      {/* Search Toolbar */}
      <Card className="p-4">
        <Input
          placeholder="Search roles by title, code, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </Card>

      {/* Roles Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </Card>
          ))
        ) : filteredRoles.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Shield className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No roles found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search or create a new custom institutional role.
            </p>
            {isTenantAdmin && (
              <Button size="sm" variant="primary" onClick={() => setCreateModalOpen(true)}>
                Create Role
              </Button>
            )}
          </div>
        ) : (
          filteredRoles.map((role) => {
            const isSystemRole = !role.tenant;
            const perms = role.permissions || [];
            const activePermCount = perms.reduce((acc, p) => {
              return (
                acc +
                (p.can_view ? 1 : 0) +
                (p.can_create ? 1 : 0) +
                (p.can_edit ? 1 : 0) +
                (p.can_delete ? 1 : 0) +
                (p.can_approve ? 1 : 0) +
                (p.can_export ? 1 : 0)
              );
            }, 0);

            return (
              <Card
                key={role.id}
                className="p-5 flex flex-col justify-between hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{role.name}</span>
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/50">
                          {role.code}
                        </span>
                        <Badge
                          variant={role.scope === "organization" ? "primary" : role.scope === "department" ? "warning" : "neutral"}
                          size="sm"
                          className="text-[10px] capitalize"
                        >
                          {role.scope || "self"} scope
                        </Badge>
                        <Badge variant="neutral" size="sm" className="text-[10px]">
                          Rank {role.rank ?? 10}
                        </Badge>
                        {isSystemRole ? (
                          <Badge variant="neutral" size="sm" className="text-[10px]">
                            Global Standard
                          </Badge>
                        ) : (
                          <Badge variant="info" size="sm" className="text-[10px]">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 min-h-[32px]">
                    {role.description || "No custom description provided for this role."}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium">Active Capabilities:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {activePermCount} flags active
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 flex-wrap">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleOpenPermsModal(role)}
                    leftIcon={<Settings className="w-3.5 h-3.5" />}
                    className="flex-1"
                  >
                    Permissions
                  </Button>

                  {!isSystemRole && isTenantAdmin && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleOpenEditModal(role)}
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                      className="text-slate-700 dark:text-slate-300"
                    >
                      Edit
                    </Button>
                  )}

                  {isSystemRole && isTenantAdmin && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => cloneMutation.mutate(role.id)}
                      disabled={cloneMutation.isPending}
                      leftIcon={<Copy className="w-3.5 h-3.5" />}
                      title="Clone this standard role to customize its title, scope, and permissions for your institution"
                      className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    >
                      Clone
                    </Button>
                  )}

                  {!isSystemRole && isTenantAdmin && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete role '${role.name}'?`)) {
                          deleteMutation.mutate(role.id);
                        }
                      }}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Role Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Institutional Role"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Role Name *
            </label>
            <Input
              placeholder="e.g. Senior Research Fellow, Assistant HOD"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Role Code (Identifier) *
            </label>
            <Input
              placeholder="e.g. srf, asst_hod"
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Unique lowercase identifier for this role in institutional permissions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Role Description
            </label>
            <Input
              placeholder="Summary of responsibilities and authorization..."
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Data Scope (Access Boundary) *
            </label>
            <select
              value={roleScope}
              onChange={(e) => setRoleScope(e.target.value as "organization" | "department" | "self")}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="organization">Organization (All departments & institution-wide records)</option>
              <option value="department">Department (Scoped strictly to user's assigned department)</option>
              <option value="self">Self (Personal faculty records only)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Controls what data records users with this role can view and review.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Seniority Rank (10 - 100) *
            </label>
            <Input
              type="number"
              min={10}
              max={100}
              step={5}
              placeholder="e.g. 50 (HOD), 70 (Dean), 100 (Admin)"
              value={roleRank}
              onChange={(e) => setRoleRank(parseInt(e.target.value) || 10)}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Seniority determines delegation hierarchy. Users cannot modify users with equal or higher rank (10: Faculty, 30: Coordinator, 50: HOD, 70: Dean, 100: Admin).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!roleName.trim() || !roleCode.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? "Creating..." : "Create Role"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Role: ${editingRole?.name || ""}`}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Role Name *
            </label>
            <Input
              placeholder="e.g. Senior Research Fellow, Assistant HOD"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Role Code (Identifier)
            </label>
            <Input
              value={editingRole?.code || ""}
              disabled
              className="bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The internal programmatic code cannot be modified once created.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Role Description
            </label>
            <Input
              placeholder="Summary of responsibilities and authorization..."
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Data Scope (Access Boundary) *
            </label>
            <select
              value={editScope}
              onChange={(e) => setEditScope(e.target.value as "organization" | "department" | "self")}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="organization">Organization (All departments & institution-wide records)</option>
              <option value="department">Department (Scoped strictly to user's assigned department)</option>
              <option value="self">Self (Personal faculty records only)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Controls what data records users with this role can view and review.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Seniority Rank (10 - 100) *
            </label>
            <Input
              type="number"
              min={10}
              max={100}
              step={5}
              placeholder="e.g. 50 (HOD), 70 (Dean), 100 (Admin)"
              value={editRank}
              onChange={(e) => setEditRank(parseInt(e.target.value) || 10)}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Seniority determines delegation hierarchy. Users cannot modify users with equal or higher rank (10: Faculty, 30: Coordinator, 50: HOD, 70: Dean, 100: Admin).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!editName.trim() || updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Permissions Configuration Matrix Modal */}
      <Modal
        isOpen={permModalOpen}
        onClose={() => setPermModalOpen(false)}
        title={`Configure Permissions: ${selectedRole?.name || ""}`}
        size="xl"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-500">
            Define granular module capabilities for users assigned the <strong>{selectedRole?.name}</strong> role. Changes take effect across your institutional tenant immediately.
          </p>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Domain Module</th>
                  <th className="py-2.5 px-2 text-center">View</th>
                  <th className="py-2.5 px-2 text-center">Create</th>
                  <th className="py-2.5 px-2 text-center">Edit</th>
                  <th className="py-2.5 px-2 text-center">Delete</th>
                  <th className="py-2.5 px-2 text-center">Approve</th>
                  <th className="py-2.5 px-2 text-center">Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permMatrix.map((mod, idx) => (
                  <tr key={mod.module_code} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {mod.icon}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {mod.module_name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            code: {mod.module_code}
                          </div>
                        </div>
                      </div>
                    </td>

                    {(["can_view", "can_create", "can_edit", "can_delete", "can_approve", "can_export"] as const).map((action) => (
                      <td key={action} className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={mod[action]}
                          onChange={() => togglePerm(idx, action)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setPermModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={setPermsMutation.isPending}
              onClick={() => setPermsMutation.mutate()}
            >
              {setPermsMutation.isPending ? "Saving..." : "Save Permission Matrix"}
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </RouteGuard>
  );
}
