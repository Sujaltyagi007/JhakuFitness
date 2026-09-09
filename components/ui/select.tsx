"use client";

import * as React from "react";
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
  const setOpen = React.useCallback((next: boolean) => { if (!disabled) setOpenState(next); }, [disabled]);

  const registerLabel = React.useCallback((itemValue: string, label: React.ReactNode) => {
    setLabels((prev) => (prev[itemValue] === label ? prev : { ...prev, [itemValue]: label }));
  }, []);

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenState(false);
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
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, registerLabel, labels, align }}>
      <div ref={rootRef} className={cn("relative", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, disabled, ...props }, ref) => {
    const { open, setOpen } = useSelectContext("SelectTrigger");
    return (
      <button
        ref={ref}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-sm text-ink outline-none transition-colors focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/30 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
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
  return <span className={cn("truncate text-left", !label && "text-steel/70", className)}>{label ?? placeholder ?? value}</span>;
}

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, align } = useSelectContext("SelectContent");
  return (
    <div
      role="listbox"
      className={cn(
        "absolute z-50 mt-1.5 max-h-64 w-full max-w-[calc(100vw-2rem)] overflow-auto rounded-xl border border-ink/10 bg-white p-1 shadow-lg shadow-black/10 transition-all duration-100",
        align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
        open ? "visible opacity-100 scale-100" : "invisible opacity-0 scale-95 pointer-events-none",
        className
      )}
    >
      {children}
    </div>
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

  React.useEffect(() => {
    registerLabel(itemValue, children);
  }, [itemValue, children, registerLabel]);

  return (
    <div
      role="option"
      aria-selected={selected}
      onClick={() => {
        if (disabled) return;
        onValueChange(itemValue);
        setOpen(false);
      }}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-stone-100",
        selected && "font-semibold",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <span className="truncate">{children}</span>
      {selected && <Check className="h-4 w-4 shrink-0 text-gold-deep" />}
    </div>
  );
}
