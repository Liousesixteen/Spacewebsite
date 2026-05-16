'use client';

import { Globe } from 'lucide-react';
import { LazyScene } from '@/components/3d/lazy-3d-scene';
import { SolarSystem, SOLAR_SYSTEM_PLANETS } from '@/components/3d/solar-system';

export default function SolarSystemPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-4">
        <Globe className="w-8 h-8 text-amber-300" />
        <h1 className="text-3xl font-bold text-white">太阳系</h1>
      </div>
      <p className="text-star-dim mb-6 max-w-3xl">
        太阳与 8 大行星按相对比例缩放展示（实际距离与体积差距较大，已为可视化做调整）。
        鼠标拖拽旋转视角，滚轮缩放，悬停或点击行星查看名称。
      </p>

      <div className="rounded-xl overflow-hidden border border-space-600 bg-space-900 h-[75vh] min-h-[520px]">
        <LazyScene cameraPosition={[0, 14, 26]}>
          <SolarSystem />
        </LazyScene>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {SOLAR_SYSTEM_PLANETS.map((planet) => (
          <div
            key={planet.id}
            className="rounded-lg bg-space-800 border border-space-600 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: planet.color }}
              />
              <span className="text-white text-sm font-semibold">
                {planet.name}
              </span>
            </div>
            {planet.description && (
              <p className="text-star-dim text-xs">{planet.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
