import { api } from "./client";
import { Department, Designation, AcademicSession, Role, User, PaginatedResponse } from "@/types";

export interface BulkUserImportResponse {
  total_rows: number;
  created: number;
  skipped: number;
  error_count: number;
  skipped_users?: string[];
  errors?: string[];
  setup_links?: { email: string; setup_url: string }[];
}

export const structureApi = {
  getDepartments: async (): Promise<Department[]> => {
    const res = await api.get<Department[] | PaginatedResponse<Department>>("/api/accounts/departments/");
    return Array.isArray(res) ? res : res.results || [];
  },

  createDepartment: async (data: { name: string; code: string; is_active?: boolean }): Promise<Department> => {
    return api.post<Department>("/api/accounts/departments/", data);
  },

  deleteDepartment: async (id: string): Promise<void> => {
    return api.delete<void>(`/api/accounts/departments/${id}/`);
  },

  getDesignations: async (): Promise<Designation[]> => {
    const res = await api.get<Designation[] | PaginatedResponse<Designation>>("/api/accounts/designations/");
    return Array.isArray(res) ? res : res.results || [];
  },

  createDesignation: async (data: { name: string; code: string; priority?: number }): Promise<Designation> => {
    return api.post<Designation>("/api/accounts/designations/", data);
  },

  deleteDesignation: async (id: string): Promise<void> => {
    return api.delete<void>(`/api/accounts/designations/${id}/`);
  },

  getAcademicSessions: async (): Promise<AcademicSession[]> => {
    const res = await api.get<AcademicSession[] | PaginatedResponse<AcademicSession>>("/api/sessions/");
    return Array.isArray(res) ? res : res.results || [];
  },

  createAcademicSession: async (data: { name: string; start_date?: string; end_date?: string; is_current?: boolean }): Promise<AcademicSession> => {
    return api.post<AcademicSession>("/api/sessions/", data);
  },

  deleteAcademicSession: async (id: string): Promise<void> => {
    return api.delete<void>(`/api/sessions/${id}/`);
  },

  getRoles: async (): Promise<Role[]> => {
    const res = await api.get<Role[] | PaginatedResponse<Role>>("/api/accounts/roles/");
    return Array.isArray(res) ? res : res.results || [];
  },

  createRole: async (data: { name: string; code: string; description?: string; scope?: string; rank?: number }): Promise<Role> => {
    return api.post<Role>("/api/accounts/roles/", data);
  },

  updateRole: async (id: string, data: Partial<Role>): Promise<Role> => {
    return api.patch<Role>(`/api/accounts/roles/${id}/`, data);
  },

  cloneRole: async (id: string): Promise<Role> => {
    return api.post<Role>(`/api/accounts/roles/${id}/clone/`);
  },

  deleteRole: async (id: string): Promise<void> => {
    return api.delete<void>(`/api/accounts/roles/${id}/`);
  },

  setRolePermissions: async (
    roleId: string,
    permissions: {
      module_code: string;
      can_view?: boolean;
      can_create?: boolean;
      can_edit?: boolean;
      can_delete?: boolean;
      can_approve?: boolean;
      can_export?: boolean;
    }[]
  ): Promise<Role> => {
    return api.post<Role>(`/api/accounts/roles/${roleId}/set-permissions/`, { permissions });
  },

  getModules: async (): Promise<{ id: string; name: string; code: string; description?: string }[]> => {
    const res = await api.get<any>("/api/accounts/modules/");
    return Array.isArray(res) ? res : res.results || [];
  },

  getUsers: async (params?: {
    search?: string;
    role?: string;
    department?: string;
    is_approved?: boolean;
    page_size?: number;
    cursor?: string;
  }): Promise<PaginatedResponse<User>> => {
    return api.get<PaginatedResponse<User>>("/api/accounts/users/", {
      params: params as Record<string, string | number | boolean>,
    });
  },

  getUser: async (id: string): Promise<User> => {
    return api.get<User>(`/api/accounts/users/${id}/`);
  },

  updateUser: async (id: string, data: Partial<User> & Record<string, any>): Promise<User> => {
    return api.patch<User>(`/api/accounts/users/${id}/`, data);
  },

  deleteUser: async (id: string): Promise<void> => {
    return api.delete<void>(`/api/accounts/users/${id}/`);
  },

  bulkImportUsers: async (file: File): Promise<BulkUserImportResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<BulkUserImportResponse>("/api/accounts/users/bulk-import/", formData);
  },

  bulkAssignRole: async (userIds: string[], roleId: string): Promise<{ success: boolean; updated_count: number; message: string }> => {
    return api.post("/api/accounts/users/bulk-assign-role/", { user_ids: userIds, role_id: roleId });
  },

  bulkApproveUsers: async (userIds: string[]): Promise<{ success: boolean; updated_count: number; message: string }> => {
    return api.post("/api/accounts/users/bulk-approve/", { user_ids: userIds });
  },

  approveUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.post(`/api/accounts/users/${id}/approve/`);
  },
};
