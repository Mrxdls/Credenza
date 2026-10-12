import { api } from "./client";
import { Tenant, PaginatedResponse, SubscriptionTier } from "@/types";

export interface RegisterOrganizationPayload {
  name: string;
  code: string;
  domain?: string;
  subscription_tier?: SubscriptionTier;
  address?: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_email: string;
  admin_phone?: string;
  admin_password: string;
  confirm_password: string;
}

export interface RegisterOrganizationResponse {
  success: boolean;
  message: string;
  tenant?: {
    id: string;
    name: string;
    code: string;
    is_active: boolean;
  };
  admin_user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const tenantsApi = {
  getTenants: async (): Promise<Tenant[]> => {
    const res = await api.get<Tenant[] | PaginatedResponse<Tenant>>("/api/tenants/");
    return Array.isArray(res) ? res : res.results || [];
  },

  getTenant: async (id: string): Promise<Tenant> => {
    return api.get<Tenant>(`/api/tenants/${id}/`);
  },

  createTenant: async (data: Partial<Tenant>): Promise<Tenant> => {
    return api.post<Tenant>("/api/tenants/", data);
  },

  updateTenant: async (id: string, data: Partial<Tenant>): Promise<Tenant> => {
    return api.patch<Tenant>(`/api/tenants/${id}/`, data);
  },

  activateTenant: async (id: string): Promise<{ status: string; message: string }> => {
    return api.post(`/api/tenants/${id}/activate/`);
  },

  deactivateTenant: async (id: string): Promise<{ status: string; message: string }> => {
    return api.post(`/api/tenants/${id}/deactivate/`);
  },

  registerOrganization: async (payload: RegisterOrganizationPayload): Promise<RegisterOrganizationResponse> => {
    return api.post<RegisterOrganizationResponse>("/register-organization/", payload);
  },
};
