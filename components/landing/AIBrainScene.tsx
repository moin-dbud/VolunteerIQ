'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function Icosahedron() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.005;
    ref.current.rotation.x += 0.002;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[2, 1]} />
      <meshStandardMaterial color="#9333ea" wireframe opacity={0.55} transparent />
    </mesh>
  );
}

function Core() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 0.9 + Math.sin(clock.getElapsedTime() * 1.5) * 0.08;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.75, 32, 32]} />
      <meshStandardMaterial color="#c026d3" emissive="#c026d3" emissiveIntensity={0.6} />
    </mesh>
  );
}

function OrbitingSpheres() {
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const angle = t * 0.9 + (i * Math.PI * 2) / 3;
      mesh.position.x = Math.cos(angle) * 2.6;
      mesh.position.z = Math.sin(angle) * 2.6;
      mesh.position.y = Math.sin(t * 0.6 + i * 1.2) * 0.5;
    });
  });

  return (
    <>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) refs.current[i] = el; }}
        >
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial
            color="#9333ea"
            emissive="#9333ea"
            emissiveIntensity={0.9}
          />
        </mesh>
      ))}
    </>
  );
}

export default function AIBrainScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.2} />
      <pointLight color="#9333ea" intensity={2.5} position={[0, 0, 0]} />
      <pointLight color="#c026d3" intensity={1} position={[4, 4, 4]} />
      <Icosahedron />
      <Core />
      <OrbitingSpheres />
    </Canvas>
  );
}
