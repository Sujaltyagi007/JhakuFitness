"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative flex h-48 w-48 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-gold/10" />
        <div className="absolute inset-4 animate-pulse rounded-full bg-gold/5" />
        <div className="h-16 w-16 animate-pulse rounded-full bg-gold/20" />
      </div>
    </div>
  ),
});

export default function HeroSceneClient({ fullscreen = false }: { fullscreen?: boolean }) {
  return (
    <HeroScene
      kind="treadmill"
      colorway={{ body: "#1b1b1d", accent: "#c9a54e" }}
      fullscreen={fullscreen}
    />
  );
}
