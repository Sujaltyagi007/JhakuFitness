import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "gold";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variantStyles = {
    default: "bg-gold text-ink font-semibold hover:bg-gold-bright shadow-sm",
    gold: "bg-gold text-ink font-semibold hover:bg-gold-bright shadow-sm",
    secondary: "bg-ink text-white hover:bg-ink-soft",
    outline: "border border-ink/15 bg-transparent hover:bg-ink/5 text-ink",
    ghost: "hover:bg-ink/5 text-ink",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  }[variant];

  const sizeStyles = {
    default: "h-11 px-5 py-2.5",
    sm: "h-9 rounded-lg px-3 text-xs",
    lg: "h-12 rounded-xl px-7 text-base",
    icon: "h-10 w-10 p-0",
  }[size];

  return (
    <button ref={ref} className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
      variantStyles, sizeStyles, className)} {...props} />
  );
}
);
Button.displayName = "Button";
