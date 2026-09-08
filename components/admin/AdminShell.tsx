"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { LogOut, ShieldCheck, ExternalLink, Menu, X, ChevronRight } from "lucide-react";

export interface AdminNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  /** If set, the item navigates to a real route instead of switching an in-page tab. */
  href?: string;
}

interface AdminShellProps {
  navItems: AdminNavItem[];
  activeId: string;
  onSelect?: (id: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

/** Sidebar + header chrome shared by the tabbed dashboard and any standalone /admin/* page. */
export default function AdminShell({ navItems, activeId, onSelect, onLogout, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeItem = navItems.find((n) => n.id === activeId) ?? navItems[0];

  function handleNav(item: AdminNavItem) {
    if (!item.href) onSelect?.(item.id);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-screen bg-[#f8f8f6] overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white border-r border-ink/8 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-3 px-5 border-b border-ink/8 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-ink">
            <ShieldCheck size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-ink truncate leading-tight">Jakhu Fitness</p>
            <p className="text-[10px] text-steel uppercase tracking-wider leading-tight">Admin Console</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto rounded-lg p-1 text-steel hover:bg-ink/5 hover:text-ink lg:hidden">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-steel/60">Main</p>
          {navItems.map((item) => {
            const active = activeId === item.id;
            const Icon = item.icon;
            const className = `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${active ? "bg-gold/12 text-ink" : "text-steel hover:text-ink hover:bg-ink/5"}`;
            const content = (
              <Fragment>
                <Icon size={16} className={active ? "text-gold-deep" : "text-steel/70 group-hover:text-ink"} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${active ? "bg-gold/20 text-gold-deep" : "bg-ink/8 text-steel"}`}>
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight size={12} className="text-gold-deep shrink-0" />}
              </Fragment>
            );
            return item.href ? (
              <Link key={item.id} href={item.href} onClick={() => setSidebarOpen(false)} className={className}>
                {content}
              </Link>
            ) : (
              <button key={item.id} onClick={() => handleNav(item)} className={className}>
                {content}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-ink/8 space-y-1.5 shrink-0">
          <Link href="/" target="_blank" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-steel hover:text-ink hover:bg-ink/5 transition-all">
            <ExternalLink size={15} />
            <span>View Storefront</span>
          </Link>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-ink/8 bg-white px-5 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-steel hover:bg-ink/5 hover:text-ink transition-colors lg:hidden" aria-label="Open sidebar">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-steel/60 hidden sm:block">Admin</span>
            <ChevronRight size={12} className="text-steel/40 hidden sm:block" />
            <span className="font-semibold text-sm text-ink truncate">{activeItem.label}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-ink leading-tight">Alipur, Delhi</p>
              <p className="text-[10px] text-steel leading-tight">+91 93110 37556</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
