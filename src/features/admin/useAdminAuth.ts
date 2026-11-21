"use client";

import { useCallback, useEffect, useState } from "react";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dọn dẹp key cũ trong localStorage nếu còn sót lại từ phiên bản trước
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem("leibo_admin_key")) {
        window.localStorage.removeItem("leibo_admin_key");
      }
    } catch {
      // Bỏ qua nếu môi trường chặn localStorage
    }
  }, []);

  const checkSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/session", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.data?.authenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (key: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message || "Mã khóa quản trị không chính xác.");
      }

      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  return {
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkSession,
  };
}
