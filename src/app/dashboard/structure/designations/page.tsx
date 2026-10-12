"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { structureApi } from "@/lib/api/structure";
import { useAuth } from "@/context/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Designation } from "@/types";
import { toast } from "sonner";
import { GraduationCap, PlusCircle, Trash2, Search } from "lucide-react";

export default function DesignationsPage() {
  const queryClient = useQueryClient();
  const { isInstitutionalManager } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [priority, setPriority] = useState<number>(10);

  const { data: designations = [], isLoading } = useQuery({
    queryKey: ["designations"],
    queryFn: () => structureApi.getDesignations(),
  });

  const createMutation = useMutation({
    mutationFn: () => structureApi.createDesignation({ name, code: code.toLowerCase(), priority }),
    onSuccess: () => {
      toast.success("Designation created!");
      setIsAddModalOpen(false);
      setName("");
      setCode("");
      queryClient.invalidateQueries({ queryKey: ["designations"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to create designation.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => structureApi.deleteDesignation(id),
    onSuccess: () => {
      toast.success("Designation removed.");
      queryClient.invalidateQueries({ queryKey: ["designations"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Cannot delete designation in use.");
    },
  });

  const filtered = designations.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.code && d.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <RouteGuard allowed={isInstitutionalManager} requiredRoleName="Institutional Administrator or Dean">
      <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Designations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define faculty ranks and titles (Professor, Associate Professor, Assistant Professor).
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Add Designation
        </Button>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Search designations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <GraduationCap className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No designations recorded
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Designation Title</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Seniority Priority</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {d.name}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">
                      {d.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      Level {d.priority}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete designation "${d.name}"?`)) {
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

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Designation"
        description="Create an academic rank title for faculty."
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Designation Name"
            required
            placeholder="e.g. Associate Professor"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Short Code"
            required
            placeholder="e.g. assoc_prof"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <Input
            label="Seniority Priority Order (1 = Highest)"
            type="number"
            value={String(priority)}
            onChange={(e) => setPriority(Number(e.target.value))}
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
              Create Designation
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </RouteGuard>
  );
}
