"use client";
import Scene from "./Scene";
import * as THREE from "three";
import { useRef } from "react";
import { Sparkles } from "@react-three/drei";
import type { ModelKind } from "@/lib/types";
import { useFrame } from "@react-three/fiber";
import { useIsCompact } from "@/lib/useIsCompact";
import EquipmentModel from "./models/EquipmentModels";
import type { Colorway } from "./models/EquipmentModels";

function FloatingRig({ kind, colorway, scale = 1, isCompact = false }: {
  kind: ModelKind;
  colorway: Colorway;
  scale?: number;
  isCompact?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) {
      const mobileLift = isCompact ? 0.32 : 0;
      const baseElevation = (scale - 1) * 0.73 + 0.24 + mobileLift;
      group.current.position.y = baseElevation + Math.sin(clock.elapsedTime * 0.75) * 0.045;
    }
  });
  return (
    <group ref={group} scale={[scale, scale, scale]}>
      <EquipmentModel kind={kind} colorway={colorway} />
    </group>
  );
}

function GroundHalo({ accent }: { accent: string }) {
  const outerRef = useRef<THREE.MeshBasicMaterial>(null);
  const innerRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (outerRef.current) {
      outerRef.current.opacity = 0.08 + Math.sin(t * 1.1) * 0.02;
    }
    if (innerRef.current) {
      innerRef.current.opacity = 0.16 + Math.sin(t * 1.5 + 1) * 0.03;
    }
  });
  return (
    <group position={[0, -0.74, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 2.2, 48]} />
        <meshBasicMaterial ref={outerRef} color={accent} transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.75, 32]} />
        <meshBasicMaterial ref={innerRef} color={accent} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

export default function HeroScene({ kind = "treadmill", colorway = { body: "#1b1b1d", accent: "#c9a54e" }, fullscreen = false }: {
  kind?: ModelKind;
  colorway?: Colorway;
  fullscreen?: boolean;
}) {
  const isCompact = useIsCompact();
  const modelScale = fullscreen ? (isCompact ? 1.05 : 1.4) : 1;
  const cameraPos: [number, number, number] = fullscreen ? (isCompact ? [3.4, 2.2, 5.8] : [3.8, 1.7, 5.2]) : [3.4, 1.3, 4.4];
  const fov = fullscreen ? (isCompact ? 44 : 44) : 40;

  return (
    <Scene cameraPosition={cameraPos} fov={fov} autoRotate autoRotateSpeed={fullscreen ? 0.85 : 1.4} enableZoom={false} showFloor className="h-full w-full">
      <FloatingRig kind={kind} colorway={colorway} scale={modelScale} isCompact={isCompact} />
      <GroundHalo accent={colorway.accent} />
      <Sparkles count={fullscreen ? 90 : 40} scale={fullscreen ? [14, 8, 14] : [6, 4, 6]} size={fullscreen ? 3.2 : 2.4} speed={0.3} opacity={fullscreen ? 0.65 : 0.5} color={colorway.accent} />
      {fullscreen && (
        <Sparkles count={45} scale={[10, 5, 10]} size={1.4} speed={0.15} opacity={0.3} color="#ffffff" />
      )}
    </Scene>
  );
}
