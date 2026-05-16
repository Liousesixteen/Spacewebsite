'use client';

import { Stars } from '@react-three/drei';

interface StarsBackgroundProps {
  count?: number;
  radius?: number;
  depth?: number;
  factor?: number;
  speed?: number;
}

/**
 * Standalone stars background that can be embedded inside any Canvas.
 * Provided as a thin wrapper over drei's `Stars` so consumers don't need to
 * import drei directly when assembling scenes.
 */
export function StarsBackground({
  count = 5000,
  radius = 300,
  depth = 60,
  factor = 5,
  speed = 1,
}: StarsBackgroundProps) {
  return (
    <Stars
      radius={radius}
      depth={depth}
      count={count}
      factor={factor}
      fade
      speed={speed}
    />
  );
}
