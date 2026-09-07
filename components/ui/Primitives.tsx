import Link from "next/link";
import { ReactNode } from "react";
import clsx from "clsx";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
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

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  type = "button",
}: ButtonProps) {
  const styles = clsx(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-200",
    variant === "primary" && "bg-gold text-ink hover:bg-gold-bright",
    variant === "secondary" &&
      "bg-ink text-white hover:bg-ink-soft",
    variant === "ghost" &&
      "border border-ink/15 text-ink hover:border-ink/40",
    className
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={styles}>
      {children}
    </button>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={clsx(
        "max-w-2xl",
        align === "center" && "mx-auto text-center"
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-medium text-gold-deep">{eyebrow}</p>
      )}
      <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-steel">
          {description}
        </p>
      )}
    </div>
  );
}
