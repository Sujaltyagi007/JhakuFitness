"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import AdminLogin from "./AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";

interface AdminAuthGateProps {
  children: (logout: () => void) => ReactNode;
}

/** Gatekeeps admin routes behind the session cookie check, shared by every /admin/* page. */
export default function AdminAuthGate({ children }: AdminAuthGateProps) {
  const { isAuthenticated, markAuthenticated, logout } = useAdminAuth();

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-gold-deep" />
          <span className="text-xs uppercase tracking-wider text-steel">
            Checking session…
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-4">
        <AdminLogin onSuccess={markAuthenticated} />
      </div>
    );
  }

  return <>{children(logout)}</>;
}
