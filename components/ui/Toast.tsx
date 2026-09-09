"use client";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, type LucideIcon } from "lucide-react";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  action?: ToastAction;
}

export interface ToastOptions {
  duration?: number;
  action?: ToastAction;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, options?: number | ToastOptions) => void;
  success: (message: string, options?: number | ToastOptions) => void;
  error: (message: string, options?: number | ToastOptions) => void;
  warning: (message: string, options?: number | ToastOptions) => void;
  info: (message: string, options?: number | ToastOptions) => void;
}

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3000,
  error: 3500,
  warning: 3500,
  info: 3000,
};

function normalizeOptions(options?: number | ToastOptions): ToastOptions {
  return typeof options === "number" ? { duration: options } : options ?? {};
}

function makeToast(message: string, type: ToastType, options?: number | ToastOptions): ToastItem {
  const { duration, action } = normalizeOptions(options);
  return { id: Math.random().toString(36).substring(2, 9), message, type, duration: duration ?? DEFAULT_DURATION[type], action };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);
let globalToastHandler: ((item: ToastItem) => void) | null = null;

export const toast = {
  show: (message: string, type: ToastType = "info", options?: number | ToastOptions) => {
    if (globalToastHandler) globalToastHandler(makeToast(message, type, options));
  },
  success: (message: string, options?: number | ToastOptions) => toast.show(message, "success", options),
  error: (message: string, options?: number | ToastOptions) => toast.show(message, "error", options),
  warning: (message: string, options?: number | ToastOptions) => toast.show(message, "warning", options),
  info: (message: string, options?: number | ToastOptions) => toast.show(message, "info", options),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = useCallback((item: ToastItem) => { setToasts((prev) => [...prev.slice(-4), item]) }, []);
  const removeToast = useCallback((id: string) => { setToasts((prev) => prev.filter((t) => t.id !== id)) }, []);
  useEffect(() => {
    globalToastHandler = addToast;
    return () => { globalToastHandler = null };
  }, [addToast]);

  const api: ToastContextType = {
    toast: (message, type = "info", options) => addToast(makeToast(message, type, options)),
    success: (message, options) => addToast(makeToast(message, "success", options)),
    error: (message, options) => addToast(makeToast(message, "error", options)),
    warning: (message, options) => addToast(makeToast(message, "warning", options)),
    info: (message, options) => addToast(makeToast(message, "info", options)),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0 sm:w-auto">
        <AnimatePresence mode="sync">
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// The toast system is shared by two independent theme mechanisms: the public
// storefront (data-theme="dark"|"light" on <html>, from ThemeContext) and the
// admin panel (a plain `dark` class on <html>, from PreferencesProvider). A
// toast reads whichever signal is present once at mount — its lifetime is a
// few seconds, so it doesn't need to track live theme changes.
function resolveIsDark(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  const dataTheme = root.getAttribute("data-theme");
  if (dataTheme === "dark") return true;
  return false;
}

const TYPE_CONFIG: Record<ToastType, { icon: LucideIcon; iconLight: string; iconDark: string; chipLight: string; chipDark: string; borderLight: string; borderDark: string }> = {
  success: { icon: CheckCircle2, iconLight: "text-emerald-600", iconDark: "text-emerald-400", chipLight: "bg-emerald-500/12", chipDark: "bg-emerald-400/15", borderLight: "border-emerald-500/25", borderDark: "border-emerald-400/25" },
  error: { icon: AlertCircle, iconLight: "text-red-600", iconDark: "text-red-400", chipLight: "bg-red-500/12", chipDark: "bg-red-400/15", borderLight: "border-red-500/25", borderDark: "border-red-400/25" },
  warning: { icon: AlertTriangle, iconLight: "text-amber-600", iconDark: "text-amber-400", chipLight: "bg-amber-500/12", chipDark: "bg-amber-400/15", borderLight: "border-amber-500/25", borderDark: "border-amber-400/25" },
  info: { icon: Info, iconLight: "text-blue-600", iconDark: "text-blue-400", chipLight: "bg-blue-500/12", chipDark: "bg-blue-400/15", borderLight: "border-blue-500/20", borderDark: "border-blue-400/20" },
};

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const { message, type, duration, action } = toast;
  const [isDark] = useState(resolveIsDark);

  useEffect(() => {
    const timer = setTimeout(() => { onClose() }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const { icon: Icon, iconLight, iconDark, chipLight, chipDark, borderLight, borderDark } = TYPE_CONFIG[type];

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={type === "error" ? { opacity: 1, y: 0, scale: 1, x: [-3, 3, -3, 2, 0] } : { opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm shadow-lg backdrop-blur-xl ${
        isDark
          ? `bg-[#1f1f23]/95 text-[#f4f4f5] shadow-black/30 ${borderDark}`
          : `bg-white/95 text-stone-900 shadow-stone-900/6 ${borderLight}`
      }`}
    >
      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isDark ? chipDark : chipLight}`}>
        <Icon size={13} className={isDark ? iconDark : iconLight} strokeWidth={2.25} />
      </div>
      <span className="min-w-0 flex-1 truncate font-medium leading-snug">{message}</span>
      {action && (
        <button
          onClick={() => { action.onClick(); onClose(); }}
          className={`shrink-0 text-xs font-semibold hover:underline ${isDark ? iconDark : iconLight}`}
        >
          {action.label}
        </button>
      )}
      <button
        onClick={onClose}
        aria-label="Dismiss toast"
        className={`shrink-0 rounded-full p-1 transition-colors ${isDark ? "text-[#8a8a91] hover:bg-white/10 hover:text-[#f4f4f5]" : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"}`}
      >
        <X size={13} />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: toast.show,
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
    };
  }
  return context;
}
