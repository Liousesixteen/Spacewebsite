'use client';

import { OrbitLine } from './orbit-line';
import { Satellite, type SatelliteData } from './satellite';

/**
 * Per-satellite descriptor that lives inside an orbit group. The orbit fills
 * in `radius`/`inclination`/`color` if the satellite does not override them.
 */
export type OrbitSatellite = Omit<SatelliteData, 'radius'> & {
  radius?: number;
};

export interface OrbitGroupData {
  id: string;
  /** Display label for the orbit (e.g. LEO, MEO, GEO) */
  label?: string;
  radius: number;
  inclination?: number;
  color?: string;
  satellites: OrbitSatellite[];
}

interface SatelliteOrbitProps {
  orbits: OrbitGroupData[];
}

/**
 * Composes one or more orbits and their satellites around a common origin.
 * Each orbit shares its radius/inclination with its satellites unless those
 * satellites override them individually.
 */
export function SatelliteOrbit({ orbits }: SatelliteOrbitProps) {
  return (
    <group>
      {orbits.map((orbit) => (
        <group key={orbit.id}>
          <OrbitLine
            radius={orbit.radius}
            inclination={orbit.inclination}
            color={orbit.color ?? '#4f8fff'}
            opacity={0.45}
          />
          {orbit.satellites.map((sat) => (
            <Satellite
              key={sat.id}
              satellite={{
                radius: orbit.radius,
                inclination: orbit.inclination,
                color: orbit.color,
                ...sat,
              }}
            />
          ))}
        </group>
      ))}
    </group>
  );
}
