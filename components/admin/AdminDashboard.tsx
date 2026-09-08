"use client";
import LeadsTab from "./tabs/LeadsTab";
import InvoiceTab from "./tabs/InvoiceTab";
import { useState, useEffect } from "react";
import ProductsTab from "./tabs/ProductsTab";
import InventoryTab from "./tabs/InventoryTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import MediaTab from "./tabs/MediaTab";
import AdminShell, { AdminNavItem } from "./AdminShell";
import { Package, Inbox, FileSpreadsheet, Warehouse, BarChart2, Layout, Image } from "lucide-react";

interface AdminDashboardProps { onLogout: () => void }

type TabId = "products" | "invoice" | "leads" | "inventory" | "analytics" | "media";

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("analytics");
  const [stockUnits, setStockUnits] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/inventory").then((r) => r.json())
      .then((data: { qty: number }[]) => {
        const total = data.reduce((sum, s) => sum + (s.qty ?? 0), 0);
        setStockUnits(total);
      }).catch(() => setStockUnits(0));
  }, [activeTab]);

  const navItems: AdminNavItem[] = [
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "products", label: "Equipment", icon: Package },
    { id: "inventory", label: "Inventory", icon: Warehouse, badge: stockUnits !== null ? String(stockUnits) : "…" },
    { id: "content", label: "Content", icon: Layout, href: "/admin/content" },
    { id: "invoice", label: "Invoices", icon: FileSpreadsheet },
    { id: "leads", label: "Leads", icon: Inbox },
    { id: "media", label: "Media", icon: Image },
  ];

  return (
    <AdminShell navItems={navItems} activeId={activeTab} onSelect={(id) => setActiveTab(id as TabId)} onLogout={onLogout}>
      {activeTab === "analytics" && <AnalyticsTab />}
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "inventory" && <InventoryTab />}
      {activeTab === "invoice" && <InvoiceTab />}
      {activeTab === "leads" && <LeadsTab />}
      {activeTab === "media" && <MediaTab />}
    </AdminShell>
  );
}
