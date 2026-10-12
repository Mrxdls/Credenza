"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { structureApi } from "@/lib/api/structure";
import { useAuth } from "@/context/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Department } from "@/types";
import { toast } from "sonner";
import {
  Building,
  PlusCircle,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  ArrowLeft,
} from "lucide-react";

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const { isInstitutionalManager } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => structureApi.getDepartments(),
  });

  const createMutation = useMutation({
    mutationFn: () => structureApi.createDepartment({ name, code: code.toUpperCase() }),
    onSuccess: () => {
      toast.success("Department created successfully!");
      setIsAddModalOpen(false);
      setName("");
      setCode("");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to create department.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => structureApi.deleteDepartment(id),
    onSuccess: () => {
      toast.success("Department removed.");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Cannot delete department with active faculty.");
    },
  });

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RouteGuard allowed={isInstitutionalManager} requiredRoleName="Institutional Administrator or Dean">
      <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Departments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define institutional academic departments for faculty scoping and NAAC reporting.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Add Department
        </Button>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <Input
          placeholder="Search by department name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </Card>

      {/* List */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Building className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No departments found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Short Code</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDepts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {d.name}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {d.code}
                    </td>
                    <td className="py-3 px-4">
                      {d.is_active ? (
                        <Badge variant="success" size="sm">Active</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Inactive</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete department "${d.name}"?`)) {
                            deleteMutation.mutate(d.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Academic Department"
        description="Create a new academic unit for your institution."
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Department Full Name"
            required
            placeholder="e.g. Department of Computer Science & Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Department Short Code"
            required
            placeholder="e.g. CSE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!name || !code}
              isLoading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Create Department
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </RouteGuard>
  );
}
