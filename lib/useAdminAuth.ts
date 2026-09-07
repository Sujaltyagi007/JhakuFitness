"use client";

import { useCallback, useEffect, useState } from "react";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(Boolean(data.authenticated)))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const markAuthenticated = useCallback(() => setIsAuthenticated(true), []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } finally {
      setIsAuthenticated(false);
    }
  }, []);

  return { isAuthenticated, markAuthenticated, logout };
}
