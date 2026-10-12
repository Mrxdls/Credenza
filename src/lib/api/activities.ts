import { api } from "./client";
import { Activity, PaginatedResponse, ActivityType, ActivityStatus, ActivityMetadata, UserAchievementSummary } from "@/types";

export interface ActivityFilterParams {
  search?: string;
  scope?: "mine" | "all" | string;
  activity_type?: ActivityType | string;
  status?: ActivityStatus | string;
  academic_session?: string;
  department?: string;
  faculty?: string;
  username?: string;
  cursor?: string;
  page_size?: number;
  ordering?: string;
}

export interface CreateActivityPayload {
  title: string;
  activity_type: ActivityType;
  academic_session: string;
  description?: string;
  metadata: ActivityMetadata;
  status?: ActivityStatus;
}

export interface BatchStatusUpdatePayload {
  activity_ids: string[];
  status: ActivityStatus;
  rejection_reason?: string;
  verification_notes?: string;
  verify_documents?: boolean;
}

export interface BulkImportResponse {
  success: boolean;
  message: string;
  created_count: number;
  updated_count: number;
  skipped_count: number;
  error_count: number;
  errors?: string[];
  created_ids?: string[];
}

export const activitiesApi = {
  getActivities: async (params?: ActivityFilterParams): Promise<PaginatedResponse<Activity>> => {
    return api.get<PaginatedResponse<Activity>>("/api/activities/", { params: params as Record<string, string | number | boolean> });
  },

  getActivity: async (id: string): Promise<Activity> => {
    return api.get<Activity>(`/api/activities/${id}/`);
  },

  createActivity: async (data: CreateActivityPayload): Promise<Activity> => {
    return api.post<Activity>("/api/activities/", data);
  },

  updateActivity: async (id: string, data: Partial<CreateActivityPayload>): Promise<Activity> => {
    return api.patch<Activity>(`/api/activities/${id}/`, data);
  },

  deleteActivity: async (id: string): Promise<void> => {
    return api.delete<void>(`/api/activities/${id}/`);
  },

  submitActivity: async (id: string): Promise<{ status: string; message: string }> => {
    return api.post(`/api/activities/${id}/submit/`);
  },

  approveActivity: async (id: string): Promise<{ status: string; message: string }> => {
    return api.post(`/api/activities/${id}/approve/`);
  },

  rejectActivity: async (id: string, reason: string): Promise<{ status: string; message: string }> => {
    return api.post(`/api/activities/${id}/reject/`, { reason });
  },

  requestAccess: async (
    id: string,
    reason: string
  ): Promise<{ success: boolean; message: string; coordinator_email?: string; faculty_email?: string; faculty_name?: string }> => {
    return api.post(`/api/activities/${id}/request-access/`, { reason });
  },

  unlockActivity: async (id: string): Promise<{ status: string; message: string }> => {
    return api.post(`/api/activities/${id}/unlock/`);
  },

  batchStatusUpdate: async (payload: BatchStatusUpdatePayload): Promise<{ success: boolean; updated_count: number; message: string }> => {
    return api.post("/api/activities/batch-status-update/", payload);
  },

  bulkVerify: async (activity_ids: string[], verification_notes = "Verified by Coordinator"): Promise<{ success: boolean; verified_count: number }> => {
    return api.post("/api/activities/bulk-verify/", { activity_ids, verification_notes });
  },

  getMetadataOptions: async (): Promise<Record<string, unknown>> => {
    return api.get("/api/activities/meta/");
  },

  getDepartmentCounts: async (params?: { department_id?: string; academic_session_id?: string }): Promise<Record<string, unknown>> => {
    return api.get("/api/activities/metrics/department-counts/", { params: params as Record<string, string> });
  },

  getUserSummary: async (params?: { department_id?: string; search?: string }): Promise<UserAchievementSummary[]> => {
    return api.get<UserAchievementSummary[]>("/api/activities/user-summary/", { params: params as Record<string, string> });
  },

  bulkImport: async (file: File): Promise<BulkImportResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<BulkImportResponse>("/api/activities/bulk-import/", formData);
  },

  autoEnrichDoi: async (doi: string): Promise<Record<string, unknown>> => {
    return api.post("/api/activities/auto-enrich-doi/", { doi });
  },

  getExportUrl: (params?: Record<string, string | number | boolean | undefined>): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const sp = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") sp.append(k, String(v));
      });
    }
    const qs = sp.toString();
    return `${baseUrl}/api/activities/export/${qs ? `?${qs}` : ""}`;
  },

  downloadExport: async (params?: Record<string, string | number | boolean | undefined>): Promise<void> => {
    return api.downloadFile("/api/activities/export/", "NAAC_Criteria_3_Accreditation_Report.xlsx", {
      params: params as Record<string, string | number | boolean>,
    });
  },
};
