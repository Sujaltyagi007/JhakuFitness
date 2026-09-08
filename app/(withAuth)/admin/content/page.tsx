"use client";

import AdminAuthGate from "@/components/admin/AdminAuthGate";
import AdminShell, { AdminNavItem } from "@/components/admin/AdminShell";
import ContentTab from "@/components/admin/tabs/ContentTab";
import { Package, Inbox, FileSpreadsheet, Warehouse, BarChart2, Layout, Image } from "lucide-react";

const navItems: AdminNavItem[] = [
  { id: "analytics", label: "Analytics", icon: BarChart2, href: "/admin" },
  { id: "products", label: "Equipment", icon: Package, href: "/admin" },
  { id: "inventory", label: "Inventory", icon: Warehouse, href: "/admin" },
  { id: "content", label: "Content", icon: Layout },
  { id: "invoice", label: "Invoices", icon: FileSpreadsheet, href: "/admin" },
  { id: "leads", label: "Leads", icon: Inbox, href: "/admin" },
  { id: "media", label: "Media", icon: Image, href: "/admin" },
];

export default function AdminContentPage() {
  return (
    <AdminAuthGate>
      {(logout) => (
        <AdminShell navItems={navItems} activeId="content" onLogout={logout}>
          <ContentTab />
        </AdminShell>
      )}
    </AdminAuthGate>
  );
}
