"use client";
import Link from "next/link";
import { type AdminUser } from "@/lib/useAdminAuth";
import { motion, AnimatePresence } from "motion/react";
import { Fragment, useState, useRef, useEffect } from "react";
import { usePreferences } from "@/components/admin/PreferencesProvider";
import { LogOut, ShieldCheck, ExternalLink, Menu, X, ChevronRight, Dumbbell, ChevronsUpDown, User, Sun, Moon, Bell } from "lucide-react";
import { useNotifications } from "../NotificationContext";

export interface AdminNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  href?: string;
}

export interface AdminShellProps {
  navItems: AdminNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onNavigate?: (id: string, subId?: string) => void;
  onLogout: () => void;
  user: AdminUser | null;
  children: React.ReactNode;
}

interface NavItemProps {
  item: AdminNavItem;
  activeId: string;
  onNav: (item: AdminNavItem) => void;
}

function NavItem({ item, activeId, onNav }: NavItemProps) {
  const active = activeId === item.id;
  const Icon = item.icon;
  const base = "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-100 " + (active ? "text-gold-deep font-semibold" : "text-[#6b6b6b] hover:bg-black/[0.04] hover:text-[#111]");

  const inner = (
    <Fragment>
      {active && (
        <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg bg-white shadow-sm border border-gold/30 border-l-[3px] border-l-gold" style={{ zIndex: 0 }} transition={{ type: "spring", stiffness: 380, damping: 32 }} />
      )}
      <Icon size={15} className={`relative z-10 ${active ? "text-gold-deep" : "text-[#9b9b9b] group-hover:text-[#444]"}`} />
      <span className="relative z-10 flex-1 text-left leading-none">{item.label}</span>
      {item.badge && (
        <span className={`relative z-10 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none ${active ? "bg-gold/15 text-gold-deep" : "bg-black/4 text-[#888]"}`}>
          {item.badge}
        </span>
      )}
    </Fragment>
  );

  return item.href ? (
    <Link href={item.href} onClick={() => onNav(item)} className={base}>
      {inner}
    </Link>
  ) : (
    <button onClick={() => onNav(item)} className={`${base} cursor-pointer`}>
      {inner}
    </button>
  );
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function ThemeToggleButton() {
  const { resolvedTheme, updatePreferences } = usePreferences();
  const [pending, setPending] = useState(false);

  const handleToggle = async () => {
    setPending(true);
    try {
      await updatePreferences({ theme: resolvedTheme === "dark" ? "light" : "dark" });
    } catch {
      // PreferencesProvider already rolls the optimistic change back on failure.
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-8 w-8 items-center justify-center rounded-full text-[#999] hover:bg-black/4 hover:text-[#111] transition-colors disabled:opacity-50 cursor-pointer"
    >
      {resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

function UserPill({ user, onLogout, onNavigate }: { user: AdminUser | null; onLogout: () => void; onNavigate?: (id: string, subId?: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const displayName = user?.name ?? "Admin";
  const displayEmail = user?.email ?? "";
  const role = user?.isSuperUser ? "Super Admin" : (user?.role ?? "Admin");

  return (
    <div ref={ref} className="relative">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-black/[0.07] bg-white shadow-xl shadow-black/10 overflow-hidden z-40" >
            <div className="flex items-center gap-2.5 px-3 py-3 border-b border-black/6">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#e8e4d4] to-[#d4ceba] text-[11px] font-bold text-[#555] select-none">
                {initials(displayName)}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#111] truncate leading-tight">{displayName}</p>
                <p className="text-[10px] text-[#999] truncate leading-tight">{displayEmail}</p>
              </div>
            </div>

            <div className="py-1">
              <div className="flex items-center gap-2.5 px-3 py-2">
                <ShieldCheck size={13} className="text-[#aaa]" />
                <span className="text-[11px] text-[#888]">{role}</span>
              </div>
            </div>

            <div className="border-t border-black/6 py-1">
              <button onClick={() => { setOpen(false); onNavigate?.('account', 'security'); }} className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[12px] font-medium text-[#444] hover:bg-black/4 hover:text-[#111] transition-colors cursor-pointer">
                Security Settings
              </button>
              {user?.isSuperUser && (
                <button onClick={() => { setOpen(false); onNavigate?.('account', 'advanced'); }} className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[12px] font-medium text-[#444] hover:bg-black/4 hover:text-[#111] transition-colors cursor-pointer">
                  Advanced
                </button>
              )}
            </div>

            <div className="border-t border-black/6 py-1">
              <button onClick={() => { setOpen(false); onLogout(); }} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[12px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"              >
                <LogOut size={13} />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-black/4 transition-colors cursor-pointer group" aria-label="User menu">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#e8e4d4] to-[#d4ceba] text-[11px] font-bold text-[#555] select-none">
          {initials(displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-[#111] truncate leading-tight">{displayName}</p>
          <p className="text-[10px] text-[#aaa] truncate leading-tight">{displayEmail}</p>
        </div>
        <ChevronsUpDown size={13} className="shrink-0 text-[#bbb] group-hover:text-[#888] transition-colors" />
      </button>
    </div>
  );
}

export default function AdminShell({ navItems, activeId, onSelect, onNavigate, onLogout, user, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const activeItem = navItems.find((n) => n.id === activeId) ?? navItems[0];
  function handleNav(item: AdminNavItem) { if (!item.href) onSelect?.(item.id); setSidebarOpen(false); }
  const primaryItems = navItems.slice(0, 5);
  const secondaryItems = navItems.slice(5);

  return (
    <div className="flex h-dvh w-full bg-[#f4f4f5] overflow-hidden font-sans relative">
      {sidebarOpen && (<div className="fixed inset-0 z-45 bg-black/20 backdrop-blur-[2px] lg:hidden" onClick={() => setSidebarOpen(false)} />)}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#f4f4f5] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-13 items-center gap-2.5 px-4 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold text-ink shrink-0">
            <Dumbbell size={13} />
          </div>
          <span className="text-[13px] font-bold text-[#111] tracking-tight leading-none truncate">Jakhu Fitness</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto rounded-md p-1 text-[#999] hover:bg-black/4 hover:text-[#111] lg:hidden" aria-label="Close sidebar">
            <X size={14} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          <div className="space-y-0.5">
            {primaryItems.map((item) => <NavItem key={item.id} item={item} activeId={activeId} onNav={handleNav} />)}
          </div>

          {secondaryItems.length > 0 && (
            <div>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#bbb]">Management</p>
              <div className="space-y-0.5">
                {secondaryItems.map((item) => <NavItem key={item.id} item={item} activeId={activeId} onNav={handleNav} />)}
              </div>
            </div>
          )}
        </nav>

        <div className="px-2 pb-3 pt-2 space-y-0.5 shrink-0 border-t border-black/6 mx-2 mb-1">
          <Link href="/" target="_blank" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-[#6b6b6b] hover:bg-black/[0.04] hover:text-[#111] transition-all">
            <ExternalLink size={14} />
            <span>View Storefront</span>
          </Link>
        </div>

        <div className="px-2 pb-3 shrink-0">
          <UserPill user={user} onLogout={onLogout} onNavigate={onNavigate} />
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden h-full">
        <header className="flex h-13 shrink-0 items-center gap-3 bg-[#f4f4f5] px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="rounded-md p-1.5 text-[#999] hover:bg-black/4 hover:text-[#111] transition-colors lg:hidden" aria-label="Open sidebar">
            <Menu size={16} />
          </button>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[12px] text-[#aaa]">Admin</span>
            <ChevronRight size={11} className="text-[#ccc] shrink-0" />
            <span className="text-[13px] font-semibold text-gold-deep truncate">{activeItem.label}</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-[#e8e4d4] to-[#d4ceba] text-[10px] font-bold text-[#555]">
                  {initials(user.name)}
                </div>
              )}
              {!user && (
                <div className="h-7 w-7 rounded-full bg-white shadow-sm border border-black/4 flex items-center justify-center">
                  <User size={13} className="text-[#777]" />
                </div>
              )}
            </div>
            <div className="hidden md:block h-5 w-px bg-black/6" />
            <div className="flex items-center gap-2">
              <ThemeToggleButton />
              <div className="relative" ref={notifRef}>
                <button onClick={() => { setIsNotifOpen(!isNotifOpen); markAllAsRead(); }} className="relative flex h-8 w-8 items-center justify-center rounded-md text-[#999] hover:bg-black/4 hover:text-[#111] transition-colors" aria-label="Notifications">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#f4f4f5]">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-32px)] overflow-hidden rounded-xl bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] ring-1 ring-black/5 z-50">
                      <div className="border-b border-black/5 bg-gray-50/80 px-4 py-3">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                        ) : (
                          notifications.map((n: any) => (
                            <div key={n.id} className="mb-1 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-xs font-semibold text-gray-900">{n.title}</span>
                                <span className="text-[10px] text-gray-400">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="mt-1 text-xs text-gray-600 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden p-2 pt-0 lg:p-4 lg:pl-0 lg:pt-0 pb-safe">
          <main className="h-full overflow-y-auto bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)] overscroll-y-contain">
            <div className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-12">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
