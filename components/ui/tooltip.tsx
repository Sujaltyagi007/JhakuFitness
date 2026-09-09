"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const sideStyles = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  }[side];

  return (
    <div className="relative inline-flex group/tooltip">
      {children}
      <div role="tooltip" className={cn("absolute z-40 min-w-fit pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-all duration-150 scale-95 group-hover/tooltip:scale-100 flex items-center rounded-lg bg-ink text-white px-2.5 py-1 text-[11px] font-medium shadow-md whitespace-nowrap border border-white/10", sideStyles, className)}> {content}</div>
    </div>
  );
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
