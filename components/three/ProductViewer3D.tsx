"use client";

import { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import Scene from "./Scene";
import EquipmentModel, { Colorway } from "./models/EquipmentModels";
import type { ModelKind } from "@/lib/types";
import { Plus, Minus, RotateCcw } from "lucide-react";

interface Hotspot {
  position: [number, number, number];
  label: string;
}

const HOTSPOTS: Record<ModelKind, Hotspot[]> = {
  treadmill: [
    { position: [0, 0.55, -1.0], label: "Console display" },
    { position: [0.32, -0.4, -0.05], label: "Side rails" },
    { position: [0, -0.5, 0.4], label: "Running deck" },
  ],
  "spin-bike": [
    { position: [0, -0.13, -0.55], label: "Flywheel" },
    { position: [0.02, 0.37, 0.46], label: "Adjustable seat" },
    { position: [0, 0.53, -0.42], label: "Handlebar" },
  ],
  "cross-trainer": [
    { position: [0, -0.2, -0.55], label: "Flywheel housing" },
    { position: [0.28, 0.3, 0.15], label: "Moving arm" },
    { position: [0, 0.8, -0.35], label: "Stationary grip" },
  ],
  rower: [
    { position: [0, -0.3, -0.85], label: "Air-resistance flywheel" },
    { position: [0, -0.49, 0.15], label: "Sliding seat" },
    { position: [0, -0.03, -0.35], label: "Pull handle" },
  ],
  "ski-machine": [
    { position: [0, 1.1, -0.2], label: "Resistance housing" },
    { position: [-0.35, 0.6, 0.15], label: "Independent arm" },
    { position: [0.32, -0.15, 0.55], label: "Handle grip" },
  ],
  "stair-master": [
    { position: [-0.15, -0.4, 0.1], label: "Revolving step" },
    { position: [0, 0.65, -0.25], label: "Console" },
    { position: [0.32, 0.4, 0.05], label: "Side rail" },
  ],
  "air-bike": [
    { position: [0, 0.2, -0.5], label: "Fan resistance wheel" },
    { position: [-0.3, 0.1, -0.1], label: "Dual-action handle" },
    { position: [0, 0.35, 0.45], label: "Adjustable seat" },
  ],
};

function Hotspots({ kind }: { kind: ModelKind }) {
  const [active, setActive] = useState<number | null>(null);
  const points = HOTSPOTS[kind] ?? [];
  return (
    <group position={[0, -0.75, 0]}>
      {points.map((h, i) => (
        <group key={i} position={h.position}>
          <Html distanceFactor={6} zIndexRange={[10, 0]}>
            <button
              onClick={() => setActive(active === i ? null : i)}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((cur) => (cur === i ? null : cur))}
              className="group flex items-center"
              aria-label={h.label}
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-gold ring-2 ring-white" />
              </span>
              {active === i && (
                <span className="ml-2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs font-medium text-white shadow-lg">
                  {h.label}
                </span>
              )}
            </button>
          </Html>
        </group>
      ))}
    </group>
  );
}

export default function ProductViewer3D({
  kind,
  colorway,
  className = "h-full w-full",
}: {
  kind: ModelKind;
  colorway: Colorway;
  className?: string;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);

  const zoom = (dir: 1 | -1) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const cam = controls.object;
    const target = controls.target;
    const dist = cam.position.distanceTo(target);
    const newDist = THREE.MathUtils.clamp(dist - dir * 0.6, 2.4, 7);
    const direction = cam.position.clone().sub(target).normalize();
    cam.position.copy(target.clone().add(direction.multiplyScalar(newDist)));
    controls.update();
  };

  const reset = () => {
    controlsRef.current?.reset();
  };

  return (
    <div className={`relative ${className}`}>
      <Scene
        cameraPosition={[3.2, 1.2, 4.2]}
        autoRotate
        autoRotateSpeed={0.8}
        controlsRef={controlsRef}
      >
        <EquipmentModel kind={kind} colorway={colorway} />
        {showHotspots && <Hotspots kind={kind} />}
      </Scene>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => zoom(1)}
          aria-label="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-md ring-1 ring-black/5 backdrop-blur transition hover:bg-white"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => zoom(-1)}
          aria-label="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-md ring-1 ring-black/5 backdrop-blur transition hover:bg-white"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={reset}
          aria-label="Reset view"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-md ring-1 ring-black/5 backdrop-blur transition hover:bg-white"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <button
        onClick={() => setShowHotspots((s) => !s)}
        className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-2 text-xs font-medium text-ink shadow-md ring-1 ring-black/5 backdrop-blur transition hover:bg-white"
      >
        {showHotspots ? "Hide details" : "Show details"}
      </button>

      <p className="pointer-events-none absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1.5 text-xs text-white backdrop-blur">
        Drag to rotate · scroll to zoom
      </p>
    </div>
  );
}
