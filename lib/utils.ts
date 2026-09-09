import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i] || "B"}`;
}

const CURRENCY_LOCALE: Record<"INR" | "USD", string> = { INR: "en-IN", USD: "en-US" };

export function formatCurrency(amount: number, currency: "INR" | "USD" = "INR", maximumFractionDigits = 0): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], { style: "currency", currency, maximumFractionDigits }).format(amount);
}

export function formatTime(date: Date | string, format: "12h" | "24h" = "12h"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: format === "12h" }).format(d);
}