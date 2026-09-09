"use client";
import LeadsTab from "./tabs/LeadsTab";
import MediaTab from "./tabs/MediaTab";
import { getInventory } from "@/lib/api";
import InvoiceTab from "./tabs/InvoiceTab";
import ContentTab from "./tabs/ContentTab";
import { UsersTab } from "./tabs/UsersTab";
import { RolesTab } from "./tabs/RolesTab";
import AccountTab from "./tabs/AccountTab";
import ProductsTab from "./tabs/ProductsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import InventoryTab from "./tabs/InventoryTab";
import NotificationsTab from "./tabs/NotificationsTab";
import { useState, useEffect, useRef } from "react";
import { type AdminUser } from "@/lib/useAdminAuth";
import { usePreferences } from "./PreferencesProvider";
import AdminShell, { AdminNavItem } from "./AdminShell";
import { Package, Inbox, FileSpreadsheet, Warehouse, BarChart2, Layout, Image, Users, Shield, Settings, Bell } from "lucide-react";

interface AdminDashboardProps { onLogout: () => void; user: AdminUser | null }

type TabId = "products" | "invoice" | "leads" | "inventory" | "analytics" | "content" | "media" | "users" | "roles" | "account" | "notifications";

const VALID_TAB_IDS: readonly TabId[] = ["products", "invoice", "leads", "inventory", "analytics", "content", "media", "users", "roles", "account", "notifications"];

export default function AdminDashboard({ onLogout, user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("analytics");
  const [accountSubTab, setAccountSubTab] = useState<string>("profile");
  const [stockUnits, setStockUnits] = useState<number | null>(null);
  const { preferences, isHydrated } = usePreferences();
  const appliedDefaultPageRef = useRef(false);

  const handleNavigate = (tab: string, subTab?: string) => {
    setActiveTab(tab as TabId);
    if (subTab) setAccountSubTab(subTab);
  };

  useEffect(() => {
    if (!isHydrated || appliedDefaultPageRef.current) return;
    appliedDefaultPageRef.current = true;
    if (preferences.defaultPage && VALID_TAB_IDS.includes(preferences.defaultPage as TabId)) {
      setActiveTab(preferences.defaultPage as TabId);
    }
  }, [isHydrated, preferences.defaultPage]);

  useEffect(() => {
    getInventory().then((data) => {
      const total = Array.isArray(data) ? data.reduce((sum: number, s: any) => sum + (s.qty ?? 0), 0) : 0;
      setStockUnits(total);
    }).catch(() => setStockUnits(0));
  }, [activeTab]);

  const navItems: AdminNavItem[] = [
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "products", label: "Equipment", icon: Package },
    { id: "inventory", label: "Inventory", icon: Warehouse, badge: stockUnits !== null ? String(stockUnits) : "…" },
    { id: "content", label: "Content", icon: Layout },
    { id: "invoice", label: "Invoices", icon: FileSpreadsheet },
    { id: "leads", label: "Leads", icon: Inbox },
    { id: "media", label: "Media", icon: Image },
    { id: "users", label: "Users", icon: Users },
    { id: "roles", label: "Roles", icon: Shield },
    { id: "notifications", label: "Broadcast", icon: Bell },
    { id: "account", label: "Account", icon: Settings },
  ];

  return (
    <AdminShell navItems={navItems} activeId={activeTab} onSelect={handleNavigate} onNavigate={handleNavigate} onLogout={onLogout} user={user}>
      {activeTab === "analytics" && <AnalyticsTab />}
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "inventory" && <InventoryTab />}
      {activeTab === "content" && <ContentTab />}
      {activeTab === "invoice" && <InvoiceTab />}
      {activeTab === "leads" && <LeadsTab />}
      {activeTab === "media" && <MediaTab />}
      {activeTab === "users" && <UsersTab />}
      {activeTab === "roles" && <RolesTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "account" && <AccountTab user={user} activeTab={accountSubTab} onTabChange={setAccountSubTab} />}
    </AdminShell>
  );
}
