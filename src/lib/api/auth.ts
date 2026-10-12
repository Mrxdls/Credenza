import { api } from "./client";
import { User } from "@/types";

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    return api.post<LoginResponse>("/api/accounts/login/", { username, password });
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    return api.post<{ success: boolean; message: string }>("/api/accounts/logout/");
  },

  getCurrentUser: async (): Promise<User> => {
    return api.get<User>("/api/accounts/me/");
  },

  updateProfile: async (data: { first_name?: string; last_name?: string; phone?: string }): Promise<User> => {
    return api.patch<User>("/api/accounts/me/", data);
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ success: boolean; message: string }> => {
    return api.post<{ success: boolean; message: string }>("/api/accounts/change-password/", data);
  },

  setupPassword: async (data: {
    uid: string;
    token: string;
    password: string;
    password_confirm: string;
  }): Promise<{ success: boolean; message: string; user?: User }> => {
    return api.post<{ success: boolean; message: string; user?: User }>("/api/accounts/setup-password/", data);
  },
};
