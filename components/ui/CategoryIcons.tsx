import type { JSX } from "react";
import { CategoryId, ModelKind } from "@/lib/types";

interface IconProps {
  className?: string;
}

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function TreadmillIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} {...strokeProps}>
      <rect x="4" y="18" width="20" height="5" rx="2.5" />
      <path d="M22 15c2-3 5-4 6.5-3.6" />
      <path d="M9 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
      <path d="M8 12l2 4-3 3" />
      <path d="M10 16l4-1.5 3 2.5" />
    </svg>
  );
}

export function SpinBikeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} {...strokeProps}>
      <circle cx="10" cy="21" r="5" />
      <path d="M15 21h9M20 12h4M13 21l6-9h4M10 21l3-9" />
      <path d="M19 9.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
    </svg>
  );
}

export function CrossTrainerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} {...strokeProps}>
      <path d="M8 24l8-16M20 8l4 16" />
      <path d="M6 20l7-3 5 3 8-2" />
      <circle cx="18" cy="6.5" r="2" />
    </svg>
  );
}

export function RowerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} {...strokeProps}>
      <path d="M4 24h24" />
      <rect x="8" y="20" width="5" height="3" rx="1" />
      <circle cx="23" cy="20" r="3" />
      <path d="M8 21.5l8-10 6 2" />
      <circle cx="16" cy="9.5" r="2" />
    </svg>
  );
}

export function SpecialtyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} {...strokeProps}>
      <path d="M10 6v20M22 6v20" />
      <path d="M6 12h4M6 20h4M22 12h4M22 20h4" />
      <path d="M10 16h12" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<CategoryId, (p: IconProps) => JSX.Element> = {
  treadmills: TreadmillIcon,
  "spin-bikes": SpinBikeIcon,
  "cross-trainers": CrossTrainerIcon,
  rowers: RowerIcon,
  specialty: SpecialtyIcon,
};

const MODEL_ICONS: Record<ModelKind, (p: IconProps) => JSX.Element> = {
  treadmill: TreadmillIcon,
  "spin-bike": SpinBikeIcon,
  "cross-trainer": CrossTrainerIcon,
  rower: RowerIcon,
  "ski-machine": SpecialtyIcon,
  "stair-master": SpecialtyIcon,
  "air-bike": SpinBikeIcon,
};

export function CategoryIcon({ category, className }: {
  category: CategoryId | string;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[category as CategoryId] || SpecialtyIcon;
  return <Icon className={className} />;
}

export function ModelIcon({
  kind,
  className,
}: {
  kind?: ModelKind;
  className?: string;
}) {
  const Icon = (kind && MODEL_ICONS[kind]) || SpecialtyIcon;
  return <Icon className={className} />;
}
