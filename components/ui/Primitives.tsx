import clsx from "clsx";
import Link from "next/link";
import { ReactNode } from "react";

interface SubHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  mode?: "light" | "dark" | "surface";
  className?: string;
}

export function Container({ children, className }: { children: ReactNode; className?: string; }) {
  return (
    <div className={clsx("mx-auto w-full max-w-7xl px-6 lg:px-10", className)}>
      {children}
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
}

export function Button({ children, href, onClick, variant = "primary", className, type = "button" }: ButtonProps) {
  const styles = clsx(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-200",
    variant === "primary" && "bg-gold text-ink hover:bg-gold-bright",
    variant === "secondary" && "bg-theme-text text-theme-bg hover:opacity-90",
    variant === "ghost" && "border border-theme-border text-theme-text hover:bg-theme-surface-hover",
    className
  );
  if (href) { return (<Link href={href} className={styles}>{children}</Link>); }
  return <button type={type} onClick={onClick} className={styles}>{children}</button>;
}

export function SectionHeading({ eyebrow, title, description, align = "left", mode, className }: SubHeadingProps) {
  return (
    <div className={clsx("max-w-2xl", align === "center" && "mx-auto text-center", className)} >
      {eyebrow && (<p className="mb-2.5 text-xs font-bold uppercase tracking-widest text-gold">{eyebrow}</p>)}
      <h2 className={clsx("text-balance font-display text-3xl font-extrabold tracking-tight sm:text-4xl", mode === "dark" ? "text-gold!" : mode === "light" ? "text-ink" : "text-theme-text")}>{title}</h2>
      {description && (<p className={clsx("mt-3 text-sm leading-relaxed", mode === "dark" ? "text-white/80" : mode === "light" ? "text-ink/80" : mode === "surface" ? "text-theme-surface-muted" : "text-theme-muted")}>{description}</p>)}
    </div>
  );
}
