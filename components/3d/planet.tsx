'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group, Mesh } from 'three';
import { OrbitLine } from './orbit-line';

export interface PlanetData {
  id: string;
  name: string;
  /** Distance from the sun (scene units) */
  distance: number;
  /** Planet radius (scene units) */
  size: number;
  /** Material color */
  color: string;
  /** Orbital angular speed (radians per frame, roughly per-second when scaled) */
  orbitSpeed: number;
  /** Self-rotation speed */
  rotationSpeed?: number;
  /** Initial orbital phase (radians) */
  initialPhase?: number;
  /** Whether this planet has rings (e.g. Saturn) */
  hasRings?: boolean;
  /** Description text */
  description?: string;
}

interface PlanetProps {
  planet: PlanetData;
  /** Tint of the orbit ellipse */
  orbitColor?: string;
  /** Whether to draw the orbit ellipse */
  showOrbit?: boolean;
}

/**
 * A planet that revolves around the origin (sun) on a circular orbit while
 * also rotating around its own axis. Hovering or clicking shows a label.
 */
export function Planet({ planet, orbitColor, showOrbit = true }: PlanetProps) {
  const {
    name,
    distance,
    size,
    color,
    orbitSpeed,
    rotationSpeed = 0.01,
    initialPhase = 0,
    hasRings = false,
    description,
  } = planet;

  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);

  const initial = useMemo(() => initialPhase, [initialPhase]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      const theta = initial + t * orbitSpeed;
      groupRef.current.position.x = Math.cos(theta) * distance;
      groupRef.current.position.z = Math.sin(theta) * distance;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  const showLabel = hovered || pinned;

  return (
    <>
      {showOrbit && (
        <OrbitLine
          radius={distance}
          color={orbitColor ?? '#3a4566'}
          opacity={0.35}
        />
      )}
      <group
        ref={groupRef}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(event) => {
          event.stopPropagation();
          setPinned((p) => !p);
        }}
      >
        <mesh ref={meshRef}>
          <sphereGeometry args={[size, 48, 48]} />
          <meshStandardMaterial
            color={color}
            roughness={0.7}
            metalness={0.1}
            emissive={color}
            emissiveIntensity={hovered ? 0.35 : 0.08}
          />
        </mesh>
        {hasRings && (
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <ringGeometry args={[size * 1.4, size * 2.1, 64]} />
            <meshBasicMaterial color="#d8c79b" transparent opacity={0.55} side={2} />
          </mesh>
        )}
        {showLabel && (
          <Html
            distanceFactor={12}
            position={[0, size + 0.3, 0]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div className="rounded-md bg-space-900/90 border border-space-600 px-2 py-1 text-xs text-white whitespace-nowrap">
              <div className="font-semibold">{name}</div>
              {description && (
                <div className="text-star-dim text-[10px]">{description}</div>
              )}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}
