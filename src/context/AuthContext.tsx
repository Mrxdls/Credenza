"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Tenant } from "@/types";
import { authApi } from "@/lib/api/auth";

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupremeAdmin: boolean;
  isTenantAdmin: boolean;
  isDean: boolean;
  isInstitutionalManager: boolean;
  isHOD: boolean;
  isCoordinator: boolean;
  isFaculty: boolean;
  canApprove: boolean;
  canExport: boolean;
  canManageUsers: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const u = await authApi.getCurrentUser();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username: string, password: string): Promise<User> => {
    const res = await authApi.login(username, password);
    setUser(res.user);
    return res.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("credenza_token");
        window.location.href = "/login";
      }
    }
  };

  const isSupremeAdmin = false;
  const roleCode =
    user?.role_code ||
    (user?.role && typeof user.role === "object" && "code" in user.role
      ? (user.role as any).code
      : typeof (user as any)?.role === "string"
      ? String((user as any).role).toLowerCase()
      : "");

  const userRank = user?.rank ?? (typeof user?.role === "object" ? user?.role?.rank : undefined) ?? 10;
  const userScope = user?.scope ?? (typeof user?.role === "object" ? user?.role?.scope : undefined) ?? "self";

  const isTenantAdmin = Boolean(
    user?.is_superuser ||
      userRank >= 100 ||
      roleCode === "admin" ||
      roleCode === "super_admin"
  );

  const isDean = Boolean(
    roleCode === "dean" ||
      (userScope === "organization" && userRank >= 70)
  );

  const isInstitutionalManager = Boolean(
    isTenantAdmin || isDean
  );

  const isHOD = Boolean(
    user?.is_department_head ||
      roleCode === "hod" ||
      (userScope === "department" && userRank >= 45)
  );

  const isCoordinator = Boolean(
    user?.is_coordinator ||
      roleCode === "coordinator" ||
      (userScope === "department" && userRank >= 30) ||
      (userScope === "organization" && userRank >= 50 && !isTenantAdmin)
  );

  const isFaculty = Boolean(
    !isTenantAdmin && !isDean && !isHOD && !isCoordinator && userScope === "self"
  );

  const canApprove = Boolean(
    isTenantAdmin ||
      isDean ||
      user?.permissions?.activities?.can_approve ||
      (userRank >= 30 && userScope !== "self") ||
      isHOD ||
      isCoordinator
  );

  const canExport = Boolean(
    isTenantAdmin ||
      isDean ||
      user?.permissions?.reports?.can_export ||
      user?.permissions?.activities?.can_export ||
      userRank >= 30 ||
      isHOD ||
      isCoordinator
  );

  const canManageUsers = Boolean(
    isTenantAdmin ||
      isDean ||
      isHOD ||
      user?.permissions?.accounts?.can_edit
  );

  const tenant = user?.tenant || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isLoading,
        isAuthenticated: !!user,
        isSupremeAdmin,
        isTenantAdmin,
        isDean,
        isInstitutionalManager,
        isHOD,
        isCoordinator,
        isFaculty,
        canApprove,
        canExport,
        canManageUsers,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
