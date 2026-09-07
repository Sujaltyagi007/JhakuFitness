"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import Scene from "./Scene";
import EquipmentModel from "./models/EquipmentModels";
import type { ModelKind } from "@/lib/types";
import type { Colorway } from "./models/EquipmentModels";
import { useIsCompact } from "@/lib/useIsCompact";

function FloatingRig({
  kind,
  colorway,
  scale = 1,
  isCompact = false,
}: {
  kind: ModelKind;
  colorway: Colorway;
  scale?: number;
  isCompact?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) {
      // On mobile (isCompact), lift the 3D model higher (+0.32) so it sits proudly
      // in the open top/center hero stage above the bottom text card:
      const mobileLift = isCompact ? 0.32 : 0;
      const baseElevation = (scale - 1) * 0.73 + 0.24 + mobileLift;
      group.current.position.y =
        baseElevation + Math.sin(clock.elapsedTime * 0.75) * 0.045;
    }
  });
  return (
    <group ref={group} scale={[scale, scale, scale]}>
      <EquipmentModel kind={kind} colorway={colorway} />
    </group>
  );
}

/** Soft ambient spotlight glow beneath the treadmill */
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
      {/* Soft diffused outer ground ambient aura */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 2.2, 48]} />
        <meshBasicMaterial
          ref={outerRef}
          color={accent}
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Subtle warm center core */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.75, 32]} />
        <meshBasicMaterial
          ref={innerRef}
          color={accent}
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/** Orbiting volumetric ring light (visual only) */
function OrbitRing({ accent }: { accent: string }) {
  const ringRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.elapsedTime * 0.22;
    }
  });
  return (
    <group ref={ringRef} position={[0, 0.5, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.6, 0.012, 6, 80]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.9}
          transparent
          opacity={0.25}
          depthWrite={false}
        />
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
  const cameraPos: [number, number, number] = fullscreen
    ? (isCompact ? [3.4, 2.2, 5.8] : [3.8, 1.7, 5.2])
    : [3.4, 1.3, 4.4];
  const fov = fullscreen ? (isCompact ? 44 : 44) : 40;

  return (
    <Scene
      cameraPosition={cameraPos}
      fov={fov}
      autoRotate
      autoRotateSpeed={fullscreen ? 0.85 : 1.4}
      enableZoom={false}
      showFloor
      className="h-full w-full"
    >
      <FloatingRig kind={kind} colorway={colorway} scale={modelScale} isCompact={isCompact} />

      {/* Ground halo effect */}
      <GroundHalo accent={colorway.accent} />

      {/* Wide ambient sparkle field */}
      <Sparkles
        count={fullscreen ? 90 : 40}
        scale={fullscreen ? [14, 8, 14] : [6, 4, 6]}
        size={fullscreen ? 3.2 : 2.4}
        speed={0.3}
        opacity={fullscreen ? 0.65 : 0.5}
        color={colorway.accent}
      />

      {/* Secondary subtle sparkle layer */}
      {fullscreen && (
        <Sparkles
          count={45}
          scale={[10, 5, 10]}
          size={1.4}
          speed={0.15}
          opacity={0.3}
          color="#ffffff"
        />
      )}
    </Scene>
  );
}
