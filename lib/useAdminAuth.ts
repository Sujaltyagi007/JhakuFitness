"use client";

import { useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  isSuperUser?: boolean;
  preferences?: Record<string, any> | null;
}

export function useAdminAuth() {
  const { data: session, status } = useSession();
  // useSession()'s status flips to "loading" not just on the initial page
  // load but also during session.update() calls (e.g. PreferencesProvider
  // syncing a saved preference) — once we've genuinely authenticated once,
  // those transient blips shouldn't drop back to the "checking session"
  // screen and unmount the whole dashboard.
  const hasAuthenticatedRef = useRef(false);
  if (status === "authenticated") hasAuthenticatedRef.current = true;

  const isAuthenticated = status === "loading" ? (hasAuthenticatedRef.current ? true : null) : status === "authenticated";
  const user = session?.user as AdminUser | null;
  const markAuthenticated = useCallback(() => { }, []);

  const logout = useCallback(async () => {
    hasAuthenticatedRef.current = false;
    await signOut({ redirect: false });
  }, []);

  return { isAuthenticated, user, markAuthenticated, logout };
}
