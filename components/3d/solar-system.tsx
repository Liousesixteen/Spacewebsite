'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Planet, type PlanetData } from './planet';

/**
 * Scaled planet data. Distances and sizes are visualization-friendly
 * (not to scale) so all planets remain visible in the same scene.
 */
const PLANETS: PlanetData[] = [
  {
    id: 'mercury',
    name: '水星 Mercury',
    distance: 4,
    size: 0.18,
    color: '#a8a29e',
    orbitSpeed: 0.42,
    initialPhase: 0,
    description: '距太阳最近的行星',
  },
  {
    id: 'venus',
    name: '金星 Venus',
    distance: 5.5,
    size: 0.32,
    color: '#e0b97a',
    orbitSpeed: 0.32,
    initialPhase: 1.2,
    description: '最热的行星',
  },
  {
    id: 'earth',
    name: '地球 Earth',
    distance: 7,
    size: 0.34,
    color: '#4f8fff',
    orbitSpeed: 0.26,
    initialPhase: 2.5,
    description: '我们的家园',
  },
  {
    id: 'mars',
    name: '火星 Mars',
    distance: 8.5,
    size: 0.26,
    color: '#d97757',
    orbitSpeed: 0.21,
    initialPhase: 3.8,
    description: '红色星球',
  },
  {
    id: 'jupiter',
    name: '木星 Jupiter',
    distance: 11,
    size: 0.85,
    color: '#d2a679',
    orbitSpeed: 0.11,
    initialPhase: 0.6,
    description: '太阳系最大行星',
  },
  {
    id: 'saturn',
    name: '土星 Saturn',
    distance: 14,
    size: 0.72,
    color: '#e3c17f',
    orbitSpeed: 0.08,
    initialPhase: 2.0,
    hasRings: true,
    description: '美丽的环系',
  },
  {
    id: 'uranus',
    name: '天王星 Uranus',
    distance: 17,
    size: 0.5,
    color: '#7fd1d6',
    orbitSpeed: 0.06,
    initialPhase: 4.2,
    description: '侧躺自转',
  },
  {
    id: 'neptune',
    name: '海王星 Neptune',
    distance: 20,
    size: 0.48,
    color: '#3b6cd1',
    orbitSpeed: 0.045,
    initialPhase: 5.5,
    description: '最远的行星',
  },
];

function Sun() {
  const meshRef = useRef<Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });
  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial
          color="#ffd166"
          emissive="#ffb347"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      {/* light source emitting from the sun */}
      <pointLight color="#ffd166" intensity={2} distance={60} decay={2} />
    </group>
  );
}

interface SolarSystemProps {
  showOrbits?: boolean;
}

export function SolarSystem({ showOrbits = true }: SolarSystemProps) {
  return (
    <group>
      <Sun />
      {PLANETS.map((p) => (
        <Planet key={p.id} planet={p} showOrbit={showOrbits} />
      ))}
    </group>
  );
}

export const SOLAR_SYSTEM_PLANETS = PLANETS;
