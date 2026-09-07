"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let globalToastHandler: ((item: ToastItem) => void) | null = null;

/** Helper function callable from anywhere (inside or outside React components) */
export const toast = {
  show: (message: string, type: ToastType = "info", duration = 3000) => {
    if (globalToastHandler) {
      globalToastHandler({ id: Math.random().toString(36).substring(2, 9), message, type, duration });
    }
  },
  success: (message: string, duration = 3000) => toast.show(message, "success", duration),
  error: (message: string, duration = 3500) => toast.show(message, "error", duration),
  info: (message: string, duration = 3000) => toast.show(message, "info", duration),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((item: ToastItem) => {
    setToasts((prev) => [...prev.slice(-4), item]); // keep max 5 active toasts
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    globalToastHandler = addToast;
    return () => {
      globalToastHandler = null;
    };
  }, [addToast]);

  const api: ToastContextType = {
    toast: (message, type = "info", duration = 3000) => addToast({ id: Math.random().toString(36).substring(2, 9), message, type, duration }),
    success: (message, duration = 3000) => addToast({ id: Math.random().toString(36).substring(2, 9), message, type: "success", duration }),
    error: (message, duration = 3500) => addToast({ id: Math.random().toString(36).substring(2, 9), message, type: "error", duration }),
    info: (message, duration = 3000) => addToast({ id: Math.random().toString(36).substring(2, 9), message, type: "info", duration }),
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

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const { message, type = "info", duration = 3000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="pointer-events-auto flex items-center justify-between gap-3 rounded-full bg-ink/90 text-white backdrop-blur-md px-4 py-2.5 shadow-xl border border-white/10 text-xs font-medium tracking-tight"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {type === "success" && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
        {type === "error" && <AlertCircle size={15} className="text-rose-400 shrink-0" />}
        {type === "info" && <Info size={15} className="text-gold shrink-0" />}
        <span className="truncate leading-snug">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-1 text-white/50 hover:text-white transition-colors rounded-full p-0.5"
        aria-label="Dismiss toast"
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
      info: toast.info,
    };
  }
  return context;
}
