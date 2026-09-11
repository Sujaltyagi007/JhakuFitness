"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  registerLabel: (itemValue: string, label: React.ReactNode) => void;
  labels: Record<string, React.ReactNode>;
  align: "start" | "end";
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(component: string) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error(`<${component} /> must be used within <Select>`);
  return ctx;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  /** Which edge of the trigger the dropdown grows from. Use "end" for a trigger anchored near the right edge of a narrow layout, so the menu opens leftward instead of risking running off-screen. */
  align?: "start" | "end";
}

export function Select({ value, onValueChange, children, className, disabled, align = "start" }: SelectProps) {
  const [open, setOpenState] = React.useState(false);
  const [labels, setLabels] = React.useState<Record<string, React.ReactNode>>({});
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const setOpen = React.useCallback((next: boolean) => { if (!disabled) setOpenState(next); }, [disabled]);

  const registerLabel = React.useCallback((itemValue: string, label: React.ReactNode) => {
    setLabels((prev) => (prev[itemValue] === label ? prev : { ...prev, [itemValue]: label }));
  }, []);

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      const insideRoot = rootRef.current?.contains(target) ?? false;
      const insideContent = contentRef.current?.contains(target) ?? false;
      if (!insideRoot && !insideContent) setOpenState(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenState(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, registerLabel, labels, align, triggerRef, contentRef }}>
      <div ref={rootRef} className={cn("relative", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, disabled, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useSelectContext("SelectTrigger");
    const setRefs = React.useCallback((node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }, [ref, triggerRef]);
    return (
      <button ref={setRefs} type="button" aria-haspopup="listbox" aria-expanded={open} disabled={disabled} onClick={() => setOpen(!open)} className={cn("flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-theme-border bg-theme-surface backdrop-blur-md px-3.5 py-2 text-sm text-theme-surface-text outline-none transition-colors focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/30 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
        {children}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-steel transition-transform duration-150", open && "rotate-180")} />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({ placeholder, className }: { placeholder?: string; className?: string }) {
  const { value, labels } = useSelectContext("SelectValue");
  const label = labels[value];
  return <span className={cn("truncate text-left", !label && "opacity-60", className)}>{label ?? placeholder ?? value}</span>;
}

interface SelectContentPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
}

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, align, triggerRef, contentRef } = useSelectContext("SelectContent");
  const [mounted, setMounted] = React.useState(false);
  const [position, setPosition] = React.useState<SelectContentPosition | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const GAP = 6;
    const VIEWPORT_MARGIN = 16;
    const MAX_LIST_HEIGHT = 256;

    function recompute() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - GAP - VIEWPORT_MARGIN;
      const spaceAbove = rect.top - GAP - VIEWPORT_MARGIN;
      const flipped = spaceBelow < Math.min(MAX_LIST_HEIGHT, 160) && spaceAbove > spaceBelow;

      setPosition({
        ...(flipped ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }), left: align === "end" ? rect.right - rect.width : rect.left, width: rect.width, maxHeight: Math.max(120, Math.min(MAX_LIST_HEIGHT, flipped ? spaceAbove : spaceBelow)),
      });
    }

    recompute();
    window.addEventListener("resize", recompute);
    window.addEventListener("scroll", recompute, true);
    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("scroll", recompute, true);
    };
  }, [open, align, triggerRef]);

  if (!mounted || !open || !position) return null;

  return createPortal(
    <div ref={contentRef} role="listbox" style={{
      top: position.top, bottom: position.bottom, left: position.left, width: position.width, maxHeight: position.maxHeight,
    }} className={cn("fixed z-50 overflow-auto rounded-xl border border-theme-border bg-theme-surface backdrop-blur-md p-1 shadow-lg shadow-black/10", className)}>
      {children}
    </div>,
    document.body
  );
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SelectItem({ value: itemValue, children, className, disabled }: SelectItemProps) {
  const { value, onValueChange, setOpen, registerLabel } = useSelectContext("SelectItem");
  const selected = value === itemValue;

  React.useEffect(() => { registerLabel(itemValue, children) }, [itemValue, children, registerLabel]);

  return (
    <div role="option" aria-selected={selected} onClick={() => { if (disabled) return; onValueChange(itemValue); setOpen(false); }} className={cn("flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-theme-surface-hover", selected && "font-semibold", disabled && "pointer-events-none opacity-50", className)}>
      <span className="truncate">{children}</span>
      {selected && <Check className="h-4 w-4 shrink-0 text-gold-deep" />}
    </div>
  );
}
