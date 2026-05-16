'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, type ReactNode } from 'react';
import type { ComponentProps } from 'react';
import type { SceneContainer } from './scene-container';

const SceneContainerDynamic = dynamic(
  () => import('./scene-container').then((mod) => ({ default: mod.SceneContainer })),
  {
    ssr: false,
    loading: () => <SceneSkeleton />,
  }
);

function SceneSkeleton() {
  return (
    <div className="w-full h-full bg-space-800 animate-pulse rounded-xl flex items-center justify-center">
      <div className="text-star-dim text-sm">3D 场景加载中...</div>
    </div>
  );
}

/**
 * Detects whether the current device is "low-end" so we can avoid spinning up
 * an expensive Three.js scene on it. Heuristics:
 *  - Mobile UA on a narrow viewport, OR
 *  - `navigator.hardwareConcurrency <= 2`, OR
 *  - `navigator.deviceMemory <= 2`, OR
 *  - WebGL is not available.
 */
function useLowEndDevice() {
  const [isLowEnd, setIsLowEnd] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cores = navigator.hardwareConcurrency ?? 8;
    const memory =
      (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const narrow = window.innerWidth < 640;

    let webglOk = true;
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      webglOk = !!gl;
    } catch {
      webglOk = false;
    }

    setIsLowEnd(!webglOk || cores <= 2 || memory <= 2 || (isMobile && narrow));
  }, []);

  return isLowEnd;
}

interface LazySceneProps extends ComponentProps<typeof SceneContainer> {
  /** Custom fallback shown on low-end devices */
  lowEndFallback?: ReactNode;
  /** Show a "Best viewed on desktop" hint over the scene */
  showDesktopHint?: boolean;
}

/**
 * Lazy-loaded 3D scene wrapper. Skips Three.js entirely on low-end / no-WebGL
 * devices and renders a static fallback instead.
 */
export function LazyScene({
  lowEndFallback,
  showDesktopHint = true,
  children,
  ...sceneProps
}: LazySceneProps) {
  const isLowEnd = useLowEndDevice();

  if (isLowEnd === null) {
    return <SceneSkeleton />;
  }

  if (isLowEnd) {
    return (
      lowEndFallback ?? (
        <div className="w-full h-full rounded-xl bg-space-800 border border-space-600 flex flex-col items-center justify-center text-center p-6">
          <div className="text-white font-semibold mb-2">3D 场景已暂停</div>
          <p className="text-star-dim text-sm max-w-xs">
            当前设备性能较低或不支持 WebGL，已自动跳过 3D 渲染。
            建议在桌面端浏览器中获得完整体验。
          </p>
        </div>
      )
    );
  }

  return (
    <div className="relative w-full h-full">
      <SceneContainerDynamic {...sceneProps}>{children}</SceneContainerDynamic>
      {showDesktopHint && (
        <div className="pointer-events-none absolute bottom-3 right-3 hidden sm:block">
          <div className="rounded-md bg-space-900/70 border border-space-600 px-2 py-1 text-[11px] text-star-dim">
            提示：拖拽旋转 · 滚轮缩放
          </div>
        </div>
      )}
    </div>
  );
}
