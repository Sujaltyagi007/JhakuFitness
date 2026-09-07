import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "gold";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-ink text-white",
    secondary: "bg-ink/5 text-ink border border-ink/10",
    outline: "border border-ink/20 text-ink",
    gold: "bg-gold/15 text-gold-deep border border-gold/30 font-semibold",
  }[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles,
        className
      )}
      {...props}
    />
  );
}
