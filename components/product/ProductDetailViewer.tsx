"use client";

import dynamic from "next/dynamic";
import { ModelKind } from "@/lib/types";
import type { Colorway } from "@/components/three/models/EquipmentModels";

const ProductViewer3D = dynamic(
  () => import("@/components/three/ProductViewer3D"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full animate-pulse items-center justify-center bg-gradient-to-br from-ink to-ink-soft">
        <p className="text-sm text-white/50">Loading 3D viewer…</p>
      </div>
    ),
  }
);

export default function ProductDetailViewer({
  kind,
  colorway,
}: {
  kind: ModelKind;
  colorway: Colorway;
}) {
  return <ProductViewer3D kind={kind} colorway={colorway} className="h-full w-full" />;
}
