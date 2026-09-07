"use client";

import { Suspense } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  return (
    <AdminAuthGate>
      {(logout) => (
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#f8f8f6]">
              <Loader2 className="h-7 w-7 animate-spin text-gold-deep" />
            </div>
          }
        >
          <AdminDashboard onLogout={logout} />
        </Suspense>
      )}
    </AdminAuthGate>
  );
}
