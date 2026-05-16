'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface EarthProps {
  rotationSpeed?: number;
  size?: number;
}

export function Earth({ rotationSpeed = 0.001, size = 2 }: EarthProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial color="#4f8fff" roughness={0.7} metalness={0.2} />
    </mesh>
  );
}
