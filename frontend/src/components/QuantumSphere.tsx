import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Float } from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   1. PARTICLE SPHERE — 3000 glowing points on a Fibonacci sphere
   ───────────────────────────────────────────────────────────── */
function ParticleSphere() {
  const meshRef = useRef<THREE.Points>(null!);
  const mouseRef = useRef({ x: 0, y: 0 });
  const count = 3000;

  const { baseSizes, geometry } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);

    const palette = [
      new THREE.Color("#00D4FF"),
      new THREE.Color("#7B5CFF"),
      new THREE.Color("#FF2D9B"),
      new THREE.Color("#00FFCC"),
    ];

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const radius = 3.2 + (Math.random() - 0.5) * 0.4;
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      siz[i] = Math.random() * 3 + 1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    geo.setAttribute("size", new THREE.Float32BufferAttribute(new Float32Array(siz), 1));

    return { baseSizes: siz, geometry: geo };
  }, []);

  // Mouse tracking
  const { gl } = useThree();
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    gl.domElement.addEventListener("pointermove", handler);
    return () => gl.domElement.removeEventListener("pointermove", handler);
  }, [gl]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    // Smooth rotation
    meshRef.current.rotation.y = t * 0.08;
    meshRef.current.rotation.x = Math.sin(t * 0.05) * 0.15;

    // Mouse tilt
    meshRef.current.rotation.z +=
      (mouseRef.current.x * 0.1 - meshRef.current.rotation.z) * 0.02;
    meshRef.current.rotation.x +=
      (mouseRef.current.y * 0.1 - meshRef.current.rotation.x) * 0.02;

    // Breathing particle sizes
    const sizeAttr = geometry.getAttribute("size");
    const arr = sizeAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i] = baseSizes[i] * (1 + 0.4 * Math.sin(t * 2 + i * 0.1));
    }
    sizeAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={2}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. HOLOGRAPHIC CORE — glowing energy sphere at center
   ───────────────────────────────────────────────────────────── */
function HolographicCore() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  const coreMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
            vec3 cyan   = vec3(0.0, 0.83, 1.0);
            vec3 purple = vec3(0.483, 0.361, 1.0);
            vec3 pink   = vec3(1.0, 0.176, 0.596);
            float wave  = sin(vPosition.y * 8.0 + uTime * 3.0) * 0.5 + 0.5;
            float wave2 = cos(vPosition.x * 6.0 - uTime * 2.0) * 0.5 + 0.5;
            vec3 col = mix(cyan, purple, wave);
            col = mix(col, pink, wave2 * 0.3);
            float alpha = fresnel * 0.7 + 0.05;
            alpha += sin(uTime * 2.0 + vPosition.y * 10.0) * 0.08;
            gl_FragColor = vec4(col, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    coreMaterial.uniforms.uTime.value = t;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} material={coreMaterial}>
        <sphereGeometry args={[1.2, 64, 64]} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial
          color="#00D4FF"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>
      <pointLight color="#00D4FF" intensity={3} distance={15} decay={2} />
      <pointLight color="#7B5CFF" intensity={1.5} distance={10} decay={2} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. ORBIT RINGS — glowing cyberpunk rings around the sphere
   ───────────────────────────────────────────────────────────── */
function OrbitRings() {
  const ringsData = useMemo(
    () => [
      { radius: 4.5, color: "#00D4FF", opacity: 0.35, speed: 0.3, tiltX: 0.6, tiltZ: 0.2, width: 0.025 },
      { radius: 5.2, color: "#7B5CFF", opacity: 0.25, speed: -0.2, tiltX: -0.4, tiltZ: 0.5, width: 0.018 },
      { radius: 5.9, color: "#FF2D9B", opacity: 0.18, speed: 0.15, tiltX: 0.3, tiltZ: -0.4, width: 0.015 },
      { radius: 6.5, color: "#00FFCC", opacity: 0.12, speed: -0.12, tiltX: -0.5, tiltZ: 0.7, width: 0.012 },
    ],
    []
  );

  return (
    <group>
      {ringsData.map((ring, i) => (
        <OrbitRing key={i} {...ring} />
      ))}
    </group>
  );
}

function OrbitRing({
  radius, color, opacity, speed, tiltX, tiltZ, width,
}: {
  radius: number; color: string; opacity: number; speed: number;
  tiltX: number; tiltZ: number; width: number;
}) {
  const ref = useRef<THREE.Group>(null!);
  const dotRef = useRef<THREE.Mesh>(null!);

  const ringGeometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
    const pts2D = curve.getPoints(128);
    const pts3D = pts2D.map((p) => new THREE.Vector3(p.x, 0, p.y));
    const path = new THREE.CatmullRomCurve3(pts3D, true);
    return new THREE.TubeGeometry(path, 128, width, 8, true);
  }, [radius, width]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * speed;
    if (dotRef.current) {
      const angle = t * speed * 3;
      dotRef.current.position.x = Math.cos(angle) * radius;
      dotRef.current.position.z = Math.sin(angle) * radius;
    }
  });

  return (
    <group ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <mesh geometry={ringGeometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Orbiting energy dot */}
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. FLOATING CARDS — glassmorphism stat cards (HTML overlay)
   ───────────────────────────────────────────────────────────── */
function FloatingCards() {
  const cards = useMemo(
    () => [
      { position: [7.5, 3.5, -1] as [number, number, number], title: "100+", subtitle: "Active Members", accent: "#00D4FF", border: "rgba(0,212,255,0.25)" },
      { position: [-7.5, 0.5, -1] as [number, number, number], title: "15+", subtitle: "Projects", accent: "#7B5CFF", border: "rgba(123,92,255,0.25)" },
      { position: [5.5, -4.5, -1] as [number, number, number], title: "20+", subtitle: "Events Yearly", accent: "#FF2D9B", border: "rgba(255,45,155,0.25)" },
    ],
    []
  );

  return (
    <>
      {cards.map((card, i) => (
        <FloatingCard key={i} {...card} index={i} />
      ))}
    </>
  );
}

function FloatingCard({
  position, title, subtitle, accent, border, index,
}: {
  position: [number, number, number]; title: string; subtitle: string;
  accent: string; border: string; index: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() + index * 1.2;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.3;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.04;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.03} floatIntensity={0.2}>
      <group ref={groupRef} position={position}>
        <Html transform distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{
            width: 200, padding: "16px 20px",
            background: "rgba(8, 12, 24, 0.88)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${border}`, borderRadius: 16,
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${accent}15`,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}>
            <div style={{
              width: "60%", height: 2,
              background: `linear-gradient(90deg, ${accent}, transparent)`,
              borderRadius: 2, marginBottom: 12, opacity: 0.7,
            }} />
            <div style={{
              fontSize: 28, fontWeight: 900, color: accent,
              lineHeight: 1.1, letterSpacing: "-0.02em",
            }}>{title}</div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.08em", textTransform: "uppercase" as const, marginTop: 4,
            }}>{subtitle}</div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. ENERGY FIELD — ambient floating particles in background
   ───────────────────────────────────────────────────────────── */
function EnergyField() {
  const ref = useRef<THREE.Points>(null!);
  const count = 500;

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#00D4FF"),
      new THREE.Color("#7B5CFF"),
      new THREE.Color("#FF2D9B"),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = geometry.getAttribute("position");
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(t + i) * 0.001;
      arr[i * 3] += Math.cos(t * 0.5 + i) * 0.0005;
    }
    posAttr.needsUpdate = true;
    ref.current.rotation.y = t * 0.01;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─────────────────────────────────────────────────────────────
   6. CONNECTION LINES — bezier arcs between sphere nodes
   ───────────────────────────────────────────────────────────── */
function ConnectionLines() {
  const ref = useRef<THREE.Group>(null!);

  const lineObjects = useMemo(() => {
    const result: THREE.Line[] = [];
    const colorOpts = ["#00D4FF", "#7B5CFF", "#FF2D9B", "#00FFCC"];

    for (let i = 0; i < 12; i++) {
      const phi1 = Math.random() * Math.PI;
      const theta1 = Math.random() * Math.PI * 2;
      const phi2 = Math.random() * Math.PI;
      const theta2 = Math.random() * Math.PI * 2;
      const r = 3.2;

      const start = new THREE.Vector3(
        r * Math.sin(phi1) * Math.cos(theta1),
        r * Math.sin(phi1) * Math.sin(theta1),
        r * Math.cos(phi1)
      );
      const end = new THREE.Vector3(
        r * Math.sin(phi2) * Math.cos(theta2),
        r * Math.sin(phi2) * Math.sin(theta2),
        r * Math.cos(phi2)
      );
      const mid = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5)
        .multiplyScalar(1.15);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const pts = curve.getPoints(30);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: colorOpts[i % colorOpts.length],
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      result.push(new THREE.Line(geo, mat));
    }
    return result;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <group ref={ref}>
      {lineObjects.map((lineObj, i) => (
        <primitive key={i} object={lineObj} />
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   7. MAIN EXPORT — QuantumSphere scene
   ───────────────────────────────────────────────────────────── */
export default function QuantumSphere() {
  return (
    <div
      id="quantum-sphere-container"
      style={{
        width: "100%",
        height: "100vh",
        background: "radial-gradient(circle at center, #111933 0%, #05070d 70%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Branding overlay */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%",
        transform: "translateX(-50%)", zIndex: 20,
        textAlign: "center", pointerEvents: "none",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.25em",
          textTransform: "uppercase", color: "rgba(0, 212, 255, 0.5)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>Samriddhi IT Club</div>
        <div style={{
          fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
          color: "rgba(255, 255, 255, 0.2)", marginTop: 4,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>Quantum Sphere Simulation</div>
      </div>

      <Canvas
        camera={{ position: [0, 0, 14], fov: 55 }}
        dpr={[1, 2]}
        style={{ background: "#05070d" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#00d9ff" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#ff2e88" />

        <ParticleSphere />
        <HolographicCore />
        <OrbitRings />
        <ConnectionLines />
        <EnergyField />
        <FloatingCards />
      </Canvas>
    </div>
  );
}
