import { api } from "./client";
import { ActivityDocument, PresignedUploadResponse } from "@/types";

export interface PresignedUploadPayload {
  activity: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  title: string;
}

export const documentsApi = {
  getDocuments: async (params?: { activity?: string; document_type?: string; is_verified?: boolean }): Promise<ActivityDocument[]> => {
    const res = await api.get<ActivityDocument[] | { results: ActivityDocument[] }>("/api/documents/", {
      params: params as Record<string, string | boolean>,
    });
    return Array.isArray(res) ? res : res.results || [];
  },

  getPresignedUploadUrl: async (payload: PresignedUploadPayload): Promise<PresignedUploadResponse> => {
    return api.post<PresignedUploadResponse>("/api/documents/presigned-upload-url/", payload);
  },

  uploadDirectToR2: async (presignedUrl: string, file: File, onProgress?: (pct: number) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", presignedUrl, true);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            onProgress(pct);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Direct upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during Cloudflare R2 upload"));
      xhr.send(file);
    });
  },

  confirmUpload: async (documentId: string): Promise<ActivityDocument> => {
    return api.post<ActivityDocument>(`/api/documents/${documentId}/confirm-upload/`);
  },

  deleteDocument: async (id: string): Promise<void> => {
    return api.delete<void>(`/api/documents/${id}/`);
  },

  uploadMultipart: async (
    activityId: string,
    file: File,
    title?: string,
    documentType = "published_paper"
  ): Promise<ActivityDocument> => {
    const formData = new FormData();
    formData.append("activity", activityId);
    formData.append("file", file);
    formData.append("title", title || file.name);
    formData.append("document_type", documentType);
    return api.post<ActivityDocument>("/api/documents/", formData);
  },

  getViewUrl: (documentId: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${baseUrl}/api/documents/${documentId}/view_file/`;
  },

  getDownloadUrl: (documentId: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${baseUrl}/api/documents/${documentId}/download/`;
  },

  downloadDocument: async (documentId: string, filename?: string): Promise<void> => {
    return api.downloadFile(`/api/documents/${documentId}/download/`, filename || `document_${documentId}`);
  },

  verifyDocument: async (documentId: string): Promise<ActivityDocument> => {
    return api.post<ActivityDocument>(`/api/documents/${documentId}/verify/`);
  },
};
