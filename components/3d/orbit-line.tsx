'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

interface OrbitLineProps {
  /** Orbit radius (semi-major axis in scene units) */
  radius: number;
  /** Inclination in degrees */
  inclination?: number;
  /** Segments used to draw the ellipse */
  segments?: number;
  /** Line color */
  color?: string;
  /** Line opacity */
  opacity?: number;
  /** Line width (in screen pixels) */
  lineWidth?: number;
}

/**
 * Renders a closed orbit ellipse around the origin. By default it draws a
 * circle in the XZ plane; supply `inclination` to tilt the orbit.
 */
export function OrbitLine({
  radius,
  inclination = 0,
  segments = 128,
  color = '#4f8fff',
  opacity = 0.4,
  lineWidth = 1,
}: OrbitLineProps) {
  const points = useMemo(() => {
    const inc = (inclination * Math.PI) / 180;
    const cos = Math.cos(inc);
    const sin = Math.sin(inc);
    const result: Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      // rotate around X axis to apply inclination
      const y = z * sin;
      const z2 = z * cos;
      result.push(new Vector3(x, y, z2));
    }
    return result;
  }, [radius, inclination, segments]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
    />
  );
}
