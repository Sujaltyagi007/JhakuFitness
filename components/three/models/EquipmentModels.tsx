"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ModelKind } from "@/lib/types";

export interface Colorway {
  body: string;
  accent: string;
}

const GROUND_Y = -0.75;

function GoldTrim({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <>{children}</>;
}

/** Creates an authentic vulcanized diamond-tread running belt texture */
function useBeltTexture(accent: string) {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Texture();

    // Vulcanized dark rubber running belt base
    ctx.fillStyle = "#121316";
    ctx.fillRect(0, 0, size, size);

    // Fine diamond/cross-hatch micro-grip pattern
    ctx.fillStyle = "#18191d";
    for (let y = 0; y < size; y += 6) {
      ctx.fillRect(0, y, size, 3);
    }

    // Belt lateral flex slats / ribs
    for (let y = 0; y < size; y += 32) {
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(0, y, size, 3);
      ctx.fillStyle = "#22242b";
      ctx.fillRect(0, y + 3, size, 1);
    }

    // Safety edge tracking pinstripes (left & right tracking indicators)
    ctx.fillStyle = accent + "88";
    ctx.fillRect(18, 0, 3, size);
    ctx.fillRect(size - 21, 0, 3, size);

    // Center belt alignment dash markers
    ctx.fillStyle = accent + "33";
    for (let y = 16; y < size; y += 96) {
      ctx.fillRect(size / 2 - 16, y, 32, 4);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    tex.anisotropy = 4;
    return tex;
  }, [accent]);
}

/** Creates an authentic widescreen commercial fitness touchscreen console UI */
function useConsoleTexture(accent: string) {
  return useMemo(() => {
    const width = 1024;
    const height = 576;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Texture();

    // Helper for rounded rectangles (with fallback)
    const drawRounded = (x: number, y: number, w: number, h: number, r: number) => {
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
      }
    };

    // 1. Deep graphite/obsidian screen background
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#0a0d13");
    bg.addColorStop(0.5, "#0f121a");
    bg.addColorStop(1, "#07090d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle background telemetry grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 32; x < width; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 70);
      ctx.lineTo(x, height - 70);
      ctx.stroke();
    }

    // 2. Header Bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    drawRounded(24, 18, width - 48, 46, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.stroke();

    // Brand Title
    ctx.fillStyle = accent;
    ctx.font = "bold 20px 'Outfit', sans-serif, system-ui";
    ctx.fillText("JAKHU FITNESS", 42, 48);

    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.font = "14px 'Inter', sans-serif, system-ui";
    ctx.fillText("COMMERCIAL SERIES 9000  •  RUN ACTIVE", 240, 47);

    // Status indicator
    ctx.fillStyle = "#34d399";
    ctx.beginPath();
    ctx.arc(width - 50, 41, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "12px sans-serif";
    ctx.fillText("BLUETOOTH HR", width - 170, 45);

    // 3. Left Metric Card: SPEED
    ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
    drawRounded(32, 86, 270, 310, 16);
    ctx.fill();
    ctx.strokeStyle = accent + "55";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("SPEED", 54, 122);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 104px sans-serif";
    ctx.fillText("12.0", 48, 238);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("KM / H", 54, 280);

    // Speed gauge bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    drawRounded(54, 320, 226, 12, 6);
    ctx.fill();
    ctx.fillStyle = accent;
    drawRounded(54, 320, 150, 12, 6);
    ctx.fill();

    // 4. Center Card: TIME & TRACK & HEART RATE
    ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
    drawRounded(326, 86, 372, 310, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("ELAPSED TIME", 456, 122);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 68px sans-serif";
    ctx.fillText("32:15", 428, 196);

    // Running Stadium Track loop
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 10;
    drawRounded(370, 230, 284, 76, 38);
    ctx.stroke();

    // Active track progress in gold
    ctx.strokeStyle = accent;
    ctx.lineWidth = 10;
    ctx.stroke();

    // Heart Rate badge
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("♥  142", 448, 352);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "14px sans-serif";
    ctx.fillText("BPM", 522, 351);

    // 5. Right Metric Card: INCLINE
    ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
    drawRounded(722, 86, 270, 310, 16);
    ctx.fill();
    ctx.strokeStyle = accent + "55";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("INCLINE", 744, 122);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 104px sans-serif";
    ctx.fillText("8.0", 738, 238);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("PERCENT %", 744, 280);

    // Incline gauge bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    drawRounded(744, 320, 226, 12, 6);
    ctx.fill();
    ctx.fillStyle = accent;
    drawRounded(744, 320, 118, 12, 6);
    ctx.fill();

    // 6. Bottom Telemetry Bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    drawRounded(32, 420, width - 64, 126, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.stroke();

    const stats = [
      { label: "DISTANCE", val: "5.42", unit: "km" },
      { label: "CALORIES", val: "386", unit: "kcal" },
      { label: "AVG PACE", val: "5:12", unit: "/km" },
      { label: "WATTS", val: "248", unit: "W" },
    ];
    stats.forEach((s, idx) => {
      const xCol = 70 + idx * 236;
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(s.label, xCol, 460);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText(s.val, xCol, 508);

      ctx.fillStyle = accent;
      ctx.font = "14px sans-serif";
      ctx.fillText(s.unit, xCol + ctx.measureText(s.val).width + 8, 507);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  }, [accent]);
}

/* ---------------------------------- Commercial Treadmill ---------------------------------- */
function Treadmill({ body, accent }: Colorway) {
  const beltMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const beltTex = useBeltTexture(accent);
  const consoleTex = useConsoleTexture(accent);

  useFrame((state, delta) => {
    // Smoothly roll the belt underneath the runner toward the back
    if (beltMatRef.current?.map) {
      beltMatRef.current.map.offset.y -= delta * 1.0;
    }
    // Subtle cockpit display backlight pulse
    if (screenMatRef.current) {
      screenMatRef.current.emissiveIntensity =
        0.55 + Math.sin(state.clock.elapsedTime * 2.0) * 0.08;
    }
  });

  return (
    <group position={[0, GROUND_Y, 0]}>
      {/* ========================================================================= */}
      {/* 1. LOWER STEEL CHASSIS & BASE FRAME                                       */}
      {/* ========================================================================= */}
      {/* Left & Right heavy-duty steel longitudinal frame rails */}
      {[-0.37, 0.37].map((x) => (
        <mesh key={`rail-${x}`} position={[x, 0.06, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[0.06, 0.08, 1.98]} />
          <meshStandardMaterial color="#141416" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Front transverse axle beam */}
      <mesh position={[0, 0.05, -0.86]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.032, 0.032, 0.82, 16]} />
        <meshStandardMaterial color="#18181c" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Front heavy-duty transport wheels with rubber tread */}
      {[-0.43, 0.43].map((x) => (
        <group key={`wheel-${x}`} position={[x, 0.05, -0.86]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.024, 18]} />
            <meshStandardMaterial color="#111112" roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, 0.026, 12]} />
            <meshStandardMaterial color={accent} metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Rear heavy leveling rubber feet */}
      {[-0.37, 0.37].map((x) => (
        <mesh key={`foot-${x}`} position={[x, 0.02, 0.95]}>
          <cylinderGeometry args={[0.055, 0.065, 0.035, 16]} />
          <meshStandardMaterial color="#0d0d0f" roughness={0.9} />
        </mesh>
      ))}

      {/* ========================================================================= */}
      {/* 2. RUNNING DECK & STEPPING PLATFORMS                                      */}
      {/* ========================================================================= */}
      {/* Main running deck extrusion foundation */}
      <mesh position={[0, 0.15, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[0.84, 0.10, 1.88]} />
        <meshStandardMaterial color={body} metalness={0.5} roughness={0.38} />
      </mesh>

      {/* The animated diamond-tread running belt */}
      <mesh position={[0, 0.205, 0.08]}>
        <boxGeometry args={[0.54, 0.015, 1.62]} />
        <meshStandardMaterial
          ref={beltMatRef}
          map={beltTex}
          roughness={0.82}
          metalness={0.12}
        />
      </mesh>

      {/* Left & Right wide non-slip landing foot boards */}
      {[-0.345, 0.345].map((x) => (
        <group key={`footboard-${x}`}>
          {/* Main textured footplate */}
          <mesh position={[x, 0.208, 0.08]} castShadow>
            <boxGeometry args={[0.13, 0.022, 1.62]} />
            <meshStandardMaterial color="#19191d" roughness={0.85} metalness={0.2} />
          </mesh>
          {/* Inner safety gold pinstripe separator */}
          <mesh position={[x > 0 ? x - 0.068 : x + 0.068, 0.214, 0.08]}>
            <boxGeometry args={[0.007, 0.018, 1.62]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.5}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}

      {/* Rear roller end caps (beveled corners of the deck) */}
      {[-0.345, 0.345].map((x) => (
        <group key={`endcap-${x}`} position={[x, 0.165, 0.95]}>
          <mesh castShadow>
            <boxGeometry args={[0.138, 0.09, 0.14]} />
            <meshStandardMaterial color={body} metalness={0.65} roughness={0.3} />
          </mesh>
          {/* Tension bolt inset */}
          <mesh position={[0, 0, 0.072]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.006, 12]} />
            <meshStandardMaterial color={accent} metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* Rear roller transverse protective shroud */}
      <mesh position={[0, 0.16, 0.97]} castShadow>
        <boxGeometry args={[0.54, 0.075, 0.08]} />
        <meshStandardMaterial color="#161619" roughness={0.6} />
      </mesh>

      {/* ========================================================================= */}
      {/* 3. FRONT MOTOR HOOD (COWLING) - Authentic Commercial Aerodynamic Housing  */}
      {/* ========================================================================= */}
      <group position={[0, 0.26, -0.73]}>
        {/* Main sculpted motor hood cover */}
        <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.84, 0.22, 0.46]} />
          <meshStandardMaterial color={body} metalness={0.55} roughness={0.35} />
        </mesh>

        {/* Front aerodynamic curved nose */}
        <mesh position={[0, -0.01, -0.23]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.838, 24]} />
          <meshStandardMaterial color={body} metalness={0.55} roughness={0.35} />
        </mesh>

        {/* Front cooling intake louver grille */}
        {[-0.04, 0, 0.04].map((yOffset, i) => (
          <mesh key={`grille-${i}`} position={[0, yOffset, -0.245]}>
            <boxGeometry args={[0.56, 0.012, 0.015]} />
            <meshStandardMaterial color="#0c0d0f" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}

        {/* Gold signature brand plate on motor hood */}
        <mesh position={[0, 0.144, 0]}>
          <boxGeometry args={[0.28, 0.006, 0.16]} />
          <meshStandardMaterial
            color={accent}
            metalness={0.88}
            roughness={0.18}
            emissive={accent}
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 4. FORWARD-SWEPT UPRIGHT MASTS / PILLARS                                  */}
      {/* ========================================================================= */}
      {[-0.39, 0.39].map((x) => (
        <group key={`mast-${x}`}>
          {/* Base collar shroud where mast enters motor hood */}
          <mesh position={[x, 0.35, -0.66]} castShadow>
            <boxGeometry args={[0.09, 0.07, 0.13]} />
            <meshStandardMaterial color="#161619" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Heavy-duty aerodynamic mast arm */}
          <mesh position={[x, 0.72, -0.76]} rotation={[0.22, 0, 0]} castShadow>
            <boxGeometry args={[0.065, 0.94, 0.11]} />
            <meshStandardMaterial color={body} metalness={0.65} roughness={0.3} />
          </mesh>

          {/* Outer edge gold accent racing strip */}
          <mesh
            position={[x > 0 ? x + 0.033 : x - 0.033, 0.72, -0.76]}
            rotation={[0.22, 0, 0]}
          >
            <boxGeometry args={[0.006, 0.94, 0.045]} />
            <meshStandardMaterial
              color={accent}
              metalness={0.9}
              roughness={0.15}
              emissive={accent}
              emissiveIntensity={0.35}
            />
          </mesh>
        </group>
      ))}

      {/* ========================================================================= */}
      {/* 5. EXTENDED SIDE HANDRAILS (ERGONOMIC ARMS)                               */}
      {/* ========================================================================= */}
      {[-0.39, 0.39].map((x) => (
        <group key={`handrail-${x}`}>
          {/* Main cantilevered aluminum handrail core */}
          <mesh position={[x, 1.075, -0.45]} rotation={[-0.12, 0, 0]} castShadow>
            <boxGeometry args={[0.045, 0.048, 0.74]} />
            <meshStandardMaterial color={body} metalness={0.75} roughness={0.25} />
          </mesh>

          {/* Ergonomic textured rubber grip sleeve */}
          <mesh position={[x, 1.075, -0.42]} rotation={[-0.12, 0, 0]} castShadow>
            <boxGeometry args={[0.052, 0.056, 0.60]} />
            <meshStandardMaterial color="#111215" roughness={0.85} />
          </mesh>

          {/* Quick-touch thumb control buttons (Incline on Left, Speed on Right) */}
          <mesh
            position={[x > 0 ? x - 0.026 : x + 0.026, 1.12, -0.66]}
            rotation={[-0.12, 0, 0]}
          >
            <boxGeometry args={[0.012, 0.02, 0.055]} />
            <meshStandardMaterial
              color={accent}
              metalness={0.8}
              roughness={0.2}
              emissive={accent}
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* Smooth rear rounded end cap */}
          <mesh position={[x, 1.03, -0.08]}>
            <sphereGeometry args={[0.026, 14, 14]} />
            <meshStandardMaterial color="#1a1a1e" metalness={0.6} roughness={0.35} />
          </mesh>
        </group>
      ))}

      {/* ========================================================================= */}
      {/* 6. FRONT CROSSBAR, HEART RATE SENSORS & EMERGENCY STOP                    */}
      {/* ========================================================================= */}
      {/* Central transverse tubular crossbar */}
      <mesh position={[0, 1.08, -0.82]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.76, 20]} />
        <meshStandardMaterial color="#18181c" metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Dual chrome pulse heart rate sensor contact plates */}
      {[-0.18, 0.18].map((x) => (
        <mesh key={`pulse-${x}`} position={[x, 1.08, -0.82]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.026, 0.026, 0.11, 16]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.96}
            roughness={0.08}
          />
        </mesh>
      ))}

      {/* Center safety key console pod */}
      <mesh position={[0, 1.10, -0.80]} castShadow>
        <boxGeometry args={[0.09, 0.04, 0.07]} />
        <meshStandardMaterial color="#16161a" roughness={0.5} />
      </mesh>
      {/* Bright Red Emergency Stop magnetic button */}
      <mesh position={[0, 1.122, -0.80]}>
        <cylinderGeometry args={[0.016, 0.016, 0.01, 14]} />
        <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={0.6} />
      </mesh>

      {/* ========================================================================= */}
      {/* 7. HIGH-TECH COCKPIT CONSOLE & TOUCHSCREEN DASHBOARD                      */}
      {/* ========================================================================= */}
      {/* Heavy central neck mount */}
      <mesh position={[0, 1.20, -0.88]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 0.20, 0.08]} />
        <meshStandardMaterial color="#141417" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Lower Dashboard Accessory Shelf with dual cup holders */}
      <group position={[0, 1.14, -0.84]} rotation={[-0.44, 0, 0]}>
        {/* Shelf deck */}
        <mesh castShadow>
          <boxGeometry args={[0.78, 0.05, 0.18]} />
          <meshStandardMaterial color="#161619" roughness={0.6} />
        </mesh>
        {/* Left & Right integrated bottle / accessory pockets */}
        {[-0.30, 0.30].map((x) => (
          <group key={`cupholder-${x}`} position={[x, 0.01, 0]}>
            <mesh>
              <cylinderGeometry args={[0.045, 0.038, 0.055, 16]} />
              <meshStandardMaterial color="#0e0f11" roughness={0.8} />
            </mesh>
            {/* Gold cup holder rim */}
            <mesh position={[0, 0.028, 0]}>
              <torusGeometry args={[0.044, 0.004, 8, 20]} />
              <meshStandardMaterial color={accent} metalness={0.85} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Main Console Infotainment Display Housing (facing runner at -0.46 rad) */}
      <group position={[0, 1.36, -0.93]} rotation={[-0.46, 0, 0]}>
        {/* Main screen chassis */}
        <mesh castShadow>
          <boxGeometry args={[0.74, 0.44, 0.045]} />
          <meshStandardMaterial color="#141518" metalness={0.6} roughness={0.35} />
        </mesh>

        {/* Back ventilation fins */}
        {[-0.10, -0.05, 0, 0.05, 0.10].map((yOff, i) => (
          <mesh key={`fin-${i}`} position={[0, yOff, -0.025]}>
            <boxGeometry args={[0.60, 0.008, 0.01]} />
            <meshStandardMaterial color="#0c0d0f" roughness={0.7} />
          </mesh>
        ))}

        {/* Ultra-thin metallic gold bezel rim */}
        <mesh position={[0, 0, 0.018]}>
          <boxGeometry args={[0.752, 0.452, 0.008]} />
          <meshStandardMaterial
            color={accent}
            metalness={0.92}
            roughness={0.15}
            emissive={accent}
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* The active high-resolution display screen with live telemetry UI */}
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[0.71, 0.41]} />
          <meshStandardMaterial
            ref={screenMatRef}
            map={consoleTex}
            emissiveMap={consoleTex}
            emissive="#ffffff"
            emissiveIntensity={0.6}
            roughness={0.15}
          />
        </mesh>

        {/* Lower device ledge / phone holder lip */}
        <mesh position={[0, -0.22, 0.03]}>
          <boxGeometry args={[0.42, 0.015, 0.03]} />
          <meshStandardMaterial color="#1a1a1f" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------------------------------- Spin Bike ---------------------------------- */
function SpinBike({ body, accent }: Colorway) {
  return (
    <group position={[0, GROUND_Y, 0]}>
      {/* base */}
      <mesh position={[0, 0.02, 0.1]} castShadow>
        <boxGeometry args={[0.16, 0.05, 1.1]} />
        <meshStandardMaterial color={body} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* main frame beam */}
      <mesh position={[0, 0.55, 0.05]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.09, 0.09, 1.0]} />
        <meshStandardMaterial color={body} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* flywheel */}
      <mesh position={[0, 0.62, -0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.05, 32]} />
        <meshStandardMaterial color={accent} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.62, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.07, 16]} />
        <meshStandardMaterial color={body} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* seat post */}
      <mesh position={[0.02, 0.85, 0.42]} rotation={[0.15, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.55, 12]} />
        <meshStandardMaterial color={body} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.02, 1.12, 0.46]} castShadow>
        <boxGeometry args={[0.14, 0.05, 0.26]} />
        <meshStandardMaterial color="#111112" roughness={0.7} />
      </mesh>
      {/* handlebar post */}
      <mesh position={[0, 0.98, -0.42]} castShadow>
        <cylinderGeometry args={[0.028, 0.032, 0.6, 12]} />
        <meshStandardMaterial color={body} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.28, -0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.025, 0.32, 4, 8]} />
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* pedals / crank hint */}
      <mesh position={[0, 0.32, -0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.03, 20]} />
        <meshStandardMaterial color={body} metalness={0.5} roughness={0.4} />
      </mesh>
      {[[-0.12, 0.05], [0.12, -0.05]].map(([ox, oz], i) => (
        <mesh key={i} position={[ox * 1.4, 0.32, -0.42 + oz * 1.4]} castShadow>
          <boxGeometry args={[0.14, 0.02, 0.06]} />
          <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------- Cross Trainer ---------------------------------- */
function CrossTrainer({ body, accent }: Colorway) {
  return (
    <group position={[0, GROUND_Y, 0]}>
      {/* base rails */}
      <mesh position={[0, 0.04, 0]} castShadow>
        <boxGeometry args={[0.2, 0.06, 1.5]} />
        <meshStandardMaterial color={body} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* flywheel housing */}
      <mesh position={[0, 0.55, -0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.08, 28]} />
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* mast */}
      <mesh position={[0, 1.1, -0.55]} castShadow>
        <boxGeometry args={[0.1, 1.1, 0.1]} />
        <meshStandardMaterial color={body} metalness={0.55} roughness={0.4} />
      </mesh>
      {/* upper stationary handlebars */}
      <mesh position={[0, 1.55, -0.35]} rotation={[0.35, 0, 0]} castShadow>
        <torusGeometry args={[0.24, 0.02, 8, 24, Math.PI]} />
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* moving arms */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh
          key={i}
          position={[x, 1.05, 0.15]}
          rotation={[0.75, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.06, 0.9, 0.06]} />
          <meshStandardMaterial color={body} metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      {/* pedals + linkage arms */}
      {[-0.22, 0.22].map((x, i) => (
        <group key={i} position={[x, 0.28, 0.15 + (i === 0 ? 0.2 : -0.2)]}>
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.03, 0.34]} />
            <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------------------------------- Rower ---------------------------------- */
function Rower({ body, accent }: Colorway) {
  const seatRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (seatRef.current) {
      seatRef.current.position.z = 0.15 + Math.sin(clock.elapsedTime * 1.4) * 0.35;
    }
  });
  return (
    <group position={[0, GROUND_Y, 0]}>
      {/* rail */}
      <mesh position={[0, 0.18, 0.15]} castShadow>
        <boxGeometry args={[0.14, 0.08, 1.7]} />
        <meshStandardMaterial color={body} metalness={0.55} roughness={0.35} />
      </mesh>
      {/* seat */}
      <mesh ref={seatRef} position={[0, 0.26, 0.15]} castShadow>
        <boxGeometry args={[0.26, 0.06, 0.18]} />
        <meshStandardMaterial color={accent} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* footrests */}
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} position={[x, 0.22, 0.85]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.14, 0.32, 0.03]} />
          <meshStandardMaterial color={body} roughness={0.5} />
        </mesh>
      ))}
      {/* flywheel housing at front */}
      <mesh position={[0, 0.45, -0.85]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.16, 24]} />
        <meshStandardMaterial color={body} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.45, -0.77]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.01, 24]} />
        <meshStandardMaterial color={accent} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* support legs */}
      <mesh position={[0, 0.02, -0.85]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.16]} />
        <meshStandardMaterial color={body} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.02, 0.9]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.16]} />
        <meshStandardMaterial color={body} roughness={0.5} />
      </mesh>
      {/* handle + cord */}
      <mesh position={[0, 0.5, -0.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[0.26, 0.03, 0.03]} />
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.47, -0.6]}>
        <cylinderGeometry args={[0.004, 0.004, 0.55, 6]} />
        <meshStandardMaterial color="#3a3a3d" />
      </mesh>
    </group>
  );
}

/* ---------------------------------- Ski Machine ---------------------------------- */
function SkiMachine({ body, accent }: Colorway) {
  return (
    <group position={[0, GROUND_Y, 0]}>
      {/* base platform */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.42, 0.05, 0.55]} />
        <meshStandardMaterial color={body} roughness={0.5} />
      </mesh>
      {/* main pole */}
      <mesh position={[0, 1.1, -0.2]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 2.1, 14]} />
        <meshStandardMaterial color={body} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* resistance housing */}
      <mesh position={[0, 1.85, -0.2]} castShadow>
        <boxGeometry args={[0.28, 0.22, 0.18]} />
        <meshStandardMaterial color={accent} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* arm cords */}
      {[-0.22, 0.22].map((x, i) => (
        <mesh
          key={i}
          position={[x * 1.6, 1.25, 0.15]}
          rotation={[0.9, 0, i === 0 ? 0.25 : -0.25]}
          castShadow
        >
          <cylinderGeometry args={[0.012, 0.012, 1.1, 8]} />
          <meshStandardMaterial color="#3a3a3d" />
        </mesh>
      ))}
      {/* handles */}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[x, 0.6, 0.55]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
          <meshStandardMaterial color={accent} metalness={0.7} roughness={0.25} />
        </mesh>
      ))}
      {/* ski plates */}
      {[-0.12, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0.09, 0.05]} castShadow>
          <boxGeometry args={[0.14, 0.02, 0.5]} />
          <meshStandardMaterial color={body} metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------- Stair Master ---------------------------------- */
function StairMaster({ body, accent }: Colorway) {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (leftRef.current) leftRef.current.position.y = 0.35 + Math.sin(t * 1.2) * 0.1;
    if (rightRef.current)
      rightRef.current.position.y = 0.35 + Math.sin(t * 1.2 + Math.PI) * 0.1;
  });
  return (
    <group position={[0, GROUND_Y, 0]}>
      {/* base tower */}
      <mesh position={[0, 0.55, -0.15]} castShadow>
        <boxGeometry args={[0.5, 1.0, 0.4]} />
        <meshStandardMaterial color={body} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* side rails */}
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, 1.15, 0.05]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 1.3, 10]} />
          <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1.75, 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.64, 10]} />
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* console */}
      <mesh position={[0, 1.4, -0.25]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.3, 0.16, 0.04]} />
        <meshStandardMaterial color={body} roughness={0.5} />
      </mesh>
      {/* steps */}
      <mesh ref={leftRef} position={[-0.15, 0.35, 0.1]} castShadow>
        <boxGeometry args={[0.22, 0.05, 0.32]} />
        <meshStandardMaterial color={accent} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh ref={rightRef} position={[0.15, 0.45, 0.1]} castShadow>
        <boxGeometry args={[0.22, 0.05, 0.32]} />
        <meshStandardMaterial color={accent} metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

/* ---------------------------------- Air Bike ---------------------------------- */
function AirBike({ body, accent }: Colorway) {
  return (
    <group position={[0, GROUND_Y, 0]}>
      {/* base */}
      <mesh position={[0, 0.03, 0.05]} castShadow>
        <boxGeometry args={[0.16, 0.05, 1.15]} />
        <meshStandardMaterial color={body} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* frame */}
      <mesh position={[0, 0.42, -0.15]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.9]} />
        <meshStandardMaterial color={body} metalness={0.55} roughness={0.4} />
      </mesh>
      {/* fan wheel */}
      <mesh position={[0, 0.95, -0.5]} castShadow>
        <torusGeometry args={[0.34, 0.03, 10, 28]} />
        <meshStandardMaterial color={accent} metalness={0.75} roughness={0.25} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.17, 0.95 + Math.sin(angle) * 0.17, -0.5]}
            rotation={[0, 0, angle]}
            castShadow
          >
            <boxGeometry args={[0.02, 0.3, 0.01]} />
            <meshStandardMaterial color={body} metalness={0.5} roughness={0.4} />
          </mesh>
        );
      })}
      {/* seat post */}
      <mesh position={[0, 0.85, 0.42]} rotation={[0.1, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.55, 10]} />
        <meshStandardMaterial color={body} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.1, 0.45]} castShadow>
        <boxGeometry args={[0.14, 0.05, 0.26]} />
        <meshStandardMaterial color="#111112" roughness={0.7} />
      </mesh>
      {/* dual-action handles */}
      {[-0.3, 0.3].map((x, i) => (
        <mesh
          key={i}
          position={[x, 0.85, -0.1]}
          rotation={[0, 0, i === 0 ? 0.4 : -0.4]}
          castShadow
        >
          <cylinderGeometry args={[0.02, 0.02, 0.55, 8]} />
          <meshStandardMaterial color={accent} metalness={0.7} roughness={0.25} />
        </mesh>
      ))}
      {/* pedals */}
      <mesh position={[0, 0.28, -0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.03, 16]} />
        <meshStandardMaterial color={body} roughness={0.5} />
      </mesh>
    </group>
  );
}

interface EquipmentModelProps {
  kind: ModelKind;
  colorway: Colorway;
  spin?: boolean;
}

export default function EquipmentModel({ kind, colorway }: EquipmentModelProps) {
  switch (kind) {
    case "treadmill":
      return <Treadmill {...colorway} />;
    case "spin-bike":
      return <SpinBike {...colorway} />;
    case "cross-trainer":
      return <CrossTrainer {...colorway} />;
    case "rower":
      return <Rower {...colorway} />;
    case "ski-machine":
      return <SkiMachine {...colorway} />;
    case "stair-master":
      return <StairMaster {...colorway} />;
    case "air-bike":
      return <AirBike {...colorway} />;
    default:
      return <GoldTrim />;
  }
}
