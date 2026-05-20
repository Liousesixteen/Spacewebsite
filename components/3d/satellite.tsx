'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group } from 'three';

export interface SatelliteData {
  id: string;
  name: string;
  /** Orbit radius (semi-major axis in scene units) */
  radius: number;
  /** Inclination in degrees */
  inclination?: number;
  /** Initial phase in radians (0..2pi) */
  phase?: number;
  /** Angular speed (radians per frame) */
  speed?: number;
  /** Marker color */
  color?: string;
  /** Marker size */
  size?: number;
  /** Optional description */
  description?: string;
}

interface SatelliteProps {
  satellite: SatelliteData;
}

/**
 * Animated satellite marker that orbits the origin along a tilted circle.
 * Hovering or clicking the marker reveals a label with the satellite name.
 */
export function Satellite({ satellite }: SatelliteProps) {
  const {
    name,
    radius,
    inclination = 0,
    phase = 0,
    speed = 0.005,
    color = '#ffd166',
    size = 0.08,
    description,
  } = satellite;

  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);

  // precompute inclination rotation factors
  const { cosI, sinI } = useMemo(() => {
    const inc = (inclination * Math.PI) / 180;
    return { cosI: Math.cos(inc), sinI: Math.sin(inc) };
  }, [inclination]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const theta = phase + t * speed * 60; // scale loosely to per-second motion
    const x = Math.cos(theta) * radius;
    const zRaw = Math.sin(theta) * radius;
    groupRef.current.position.set(x, zRaw * sinI, zRaw * cosI);
  });

  const showLabel = hovered || pinned;

  return (
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
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.2 : 0.6}
        />
      </mesh>
      {showLabel && (
        <Html
          distanceFactor={10}
          position={[0, size * 1.6, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="rounded-md bg-space-900/90 border border-space-600 px-2 py-1 text-xs text-star-white whitespace-nowrap">
            <div className="font-semibold">{name}</div>
            {description && (
              <div className="text-star-dim text-[10px]">{description}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
