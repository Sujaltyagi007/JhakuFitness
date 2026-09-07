"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, MeshReflectorMaterial, ContactShadows } from "@react-three/drei";
import { Suspense, ReactNode, RefObject } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useIsCompact } from "@/lib/useIsCompact";

interface SceneProps {
  children: ReactNode;
  cameraPosition?: [number, number, number];
  fov?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  showFloor?: boolean;
  className?: string;
  controlsRef?: RefObject<OrbitControlsImpl | null>;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[4, 7, 4]}
        intensity={1.6}
        color="#ffffff"
        castShadow
      />
      {/* warm gold fill from side */}
      <directionalLight
        position={[-4, 3, -2]}
        intensity={1.1}
        color="#c9a54e"
      />
      {/* cool blue rim from behind */}
      <directionalLight
        position={[0, 2, -5]}
        intensity={0.55}
        color="#5599ff"
      />
      <pointLight position={[0, 4, -4]} intensity={0.6} color="#e7c579" />
      {/* ground bounce */}
      <pointLight position={[0, -1, 0]} intensity={0.25} color="#c9a54e" />
    </>
  );
}

function Floor({ compact }: { compact: boolean }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.751, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        {compact ? (
          <meshStandardMaterial color="#141416" roughness={0.9} />
        ) : (
          <MeshReflectorMaterial
            blur={[300, 60]}
            resolution={512}
            mixBlur={1}
            mixStrength={35}
            roughness={0.92}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
            color="#0f0f11"
            metalness={0.4}
          />
        )}
      </mesh>
      <ContactShadows
        position={[0, -0.74, 0]}
        opacity={0.55}
        scale={12}
        blur={2.2}
        far={3}
      />
    </group>
  );
}

export default function Scene({
  children,
  cameraPosition = [3.2, 1.6, 4.2],
  fov = 40,
  autoRotate = true,
  autoRotateSpeed = 1.1,
  enableZoom = true,
  minPolarAngle = 0.5,
  maxPolarAngle = 1.5,
  showFloor = true,
  className = "",
  controlsRef,
}: SceneProps) {
  const compact = useIsCompact();

  return (
    <div className={className}>
      <Canvas shadows={!compact ? "percentage" : false} dpr={compact ? [1, 1.3] : [1, 2]}
        camera={{ position: cameraPosition, fov }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <Lights />
          {children}
          {showFloor && <Floor compact={compact} />}
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={enableZoom}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          minPolarAngle={minPolarAngle}
          maxPolarAngle={maxPolarAngle}
          minDistance={2.4}
          maxDistance={7}
        />
      </Canvas>
    </div>
  );
}
