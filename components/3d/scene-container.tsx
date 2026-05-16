'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense } from 'react';

interface SceneContainerProps {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  enableControls?: boolean;
  className?: string;
}

export function SceneContainer({
  children,
  cameraPosition = [0, 0, 10],
  enableControls = true,
  className = 'w-full h-full',
}: SceneContainerProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: cameraPosition, fov: 60 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars radius={300} depth={60} count={5000} factor={5} fade speed={1} />
          {children}
          {enableControls && <OrbitControls enablePan={false} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
