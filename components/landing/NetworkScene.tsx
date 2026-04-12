'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const BASE_POSITIONS: [number, number, number][] = [
  [0, 0, 0],       // hub
  [2.2, 0.8, 0],
  [-2.1, 0.5, 0],
  [1.4, -1.6, 0],
  [-1.5, -1.2, 0],
  [0.2, 2.1, 0],
  [0.1, -2.2, 0],
  [2.6, -0.4, 0],
  [-2.6, -0.3, 0],
  [1.1, 1.9, 0],
  [-1.2, -2, 0],
  [1.9, -0.6, 0.5],
];

const CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [1, 9], [2, 4], [3, 11], [5, 9], [6, 10], [7, 1],
  [8, 2], [9, 5], [10, 6], [11, 3],
];

function Network() {
  const refs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh || i === 0) return;
      mesh.position.y = BASE_POSITIONS[i][1] + Math.sin(t * 0.8 + i * 0.9) * 0.18;
      mesh.position.x = BASE_POSITIONS[i][0] + Math.cos(t * 0.5 + i * 0.6) * 0.09;
    });
  });

  return (
    <>
      {BASE_POSITIONS.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) refs.current[i] = el; }}
          position={pos}
        >
          <sphereGeometry args={[i === 0 ? 0.28 : 0.1, 16, 16]} />
          <meshStandardMaterial
            color={i === 0 ? '#9333ea' : i % 2 === 0 ? '#c026d3' : '#7c3aed'}
            emissive={i === 0 ? '#9333ea' : '#9333ea'}
            emissiveIntensity={i === 0 ? 1 : 0.5}
          />
        </mesh>
      ))}

      {CONNECTIONS.map(([a, b], i) => (
        <Line
          key={i}
          points={[BASE_POSITIONS[a], BASE_POSITIONS[b]]}
          color="#9333ea"
          opacity={0.25}
          transparent
          lineWidth={1}
        />
      ))}
    </>
  );
}

export default function NetworkScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.15} />
      <pointLight color="#9333ea" intensity={2} position={[0, 0, 4]} />
      <pointLight color="#c026d3" intensity={0.8} position={[-3, 3, 2]} />
      <Network />
    </Canvas>
  );
}
