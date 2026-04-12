'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, MeshDistortMaterial, Float, Html, Sphere } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

// ─── Rotating wireframe globe ──────────────────────────────────────────────
function WireGlobe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.003;
    ref.current.rotation.x += 0.0008;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial wireframe color="#9333ea" opacity={0.25} transparent />
    </mesh>
  );
}

// ─── Inner sphere with distortion ─────────────────────────────────────────
function InnerSphere() {
  return (
    <Sphere args={[1.6, 64, 64]}>
      <MeshDistortMaterial
        color="#1a1a24"
        distort={0.3}
        speed={2}
        roughness={0.1}
        metalness={0.8}
      />
    </Sphere>
  );
}

// ─── Floating HTML cards ───────────────────────────────────────────────────
function FloatingCards() {
  const cardBase: React.CSSProperties = {
    background: 'rgba(17,17,24,0.92)',
    backdropFilter: 'blur(16px)',
    borderRadius: 10,
    padding: '12px 16px',
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  };

  return (
    <>
      {/* Card 1 — Urgent stats */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} position={[2.4, 1.6, 0.5]}>
        <Html distanceFactor={10} center>
          <div style={{ ...cardBase, border: '1px solid rgba(239,68,68,0.5)', width: 150 }}>
            <div style={{ fontSize: 9, color: '#ef4444', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 5 }}>● 42 PENDING</div>
            <div style={{ fontSize: 14, color: '#ffffff', fontWeight: 700 }}>URGENT ACTION</div>
            <div style={{ fontSize: 10, color: '#52525b', marginTop: 3 }}>Nagpur · Health</div>
          </div>
        </Html>
      </Float>

      {/* Card 2 — Best match */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4} position={[-2.9, 0.2, 0.8]}>
        <Html distanceFactor={10} center>
          <div style={{ ...cardBase, border: '1px solid rgba(147,51,234,0.5)', width: 185 }}>
            <div style={{ fontSize: 9, color: '#9333ea', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 6 }}>⚡ BEST MATCH</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#9333ea,#c026d3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>MC</div>
              <div>
                <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Marcus Chen</div>
                <div style={{ fontSize: 9, color: '#9333ea' }}>Medical Expert · 2km</div>
              </div>
            </div>
          </div>
        </Html>
      </Float>

      {/* Card 3 — Gemini accuracy */}
      <Float speed={2.2} rotationIntensity={0.15} floatIntensity={0.6} position={[2.2, -1.9, 0.5]}>
        <Html distanceFactor={10} center>
          <div style={{ ...cardBase, border: '1px solid rgba(34,197,94,0.5)', width: 148 }}>
            <div style={{ fontSize: 9, color: '#22c55e', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 4 }}>✓ GEMINI AI</div>
            <div style={{ fontSize: 16, color: '#fff', fontWeight: 700 }}>94% Accuracy</div>
            <div style={{ fontSize: 9, color: '#52525b', marginTop: 2 }}>Powered by Gemini 2.0</div>
          </div>
        </Html>
      </Float>
    </>
  );
}

// ─── Scene export ──────────────────────────────────────────────────────────
export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#9333ea" />
      <pointLight position={[-5, -5, -5]} intensity={0.6} color="#c026d3" />
      <Stars radius={20} depth={10} count={3000} factor={2} saturation={0} fade speed={0.5} />
      <WireGlobe />
      <InnerSphere />
      <FloatingCards />
    </Canvas>
  );
}
