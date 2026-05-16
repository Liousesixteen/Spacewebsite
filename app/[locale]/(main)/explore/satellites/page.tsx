'use client';

import { LazyScene } from '@/components/3d/lazy-3d-scene';
import { Earth } from '@/components/3d/earth';
import { SatelliteOrbit, type OrbitGroupData } from '@/components/3d/satellite-orbit';
import { Satellite as SatelliteIcon } from 'lucide-react';

const orbits: OrbitGroupData[] = [
  {
    id: 'leo',
    label: 'LEO',
    radius: 3.2,
    inclination: 51.6,
    color: '#4f8fff',
    satellites: [
      {
        id: 'iss',
        name: '国际空间站 ISS',
        phase: 0,
        speed: 0.018,
        size: 0.12,
        description: 'LEO · 高度约 400km',
      },
      {
        id: 'tiangong',
        name: '中国空间站 天宫',
        phase: Math.PI * 0.7,
        speed: 0.018,
        size: 0.12,
        description: 'LEO · 高度约 400km',
      },
      {
        id: 'starlink',
        name: 'Starlink',
        phase: Math.PI * 1.3,
        speed: 0.02,
        size: 0.07,
        color: '#a3e635',
        description: 'LEO 通信卫星',
      },
    ],
  },
  {
    id: 'meo',
    label: 'MEO',
    radius: 5.5,
    inclination: 55,
    color: '#c084fc',
    satellites: [
      {
        id: 'beidou',
        name: '北斗导航',
        phase: 0.4,
        speed: 0.01,
        size: 0.09,
        description: 'MEO · 高度约 21,500km',
      },
      {
        id: 'gps',
        name: 'GPS',
        phase: Math.PI * 1.1,
        speed: 0.009,
        size: 0.09,
        description: 'MEO · 高度约 20,200km',
      },
    ],
  },
  {
    id: 'geo',
    label: 'GEO',
    radius: 7.8,
    inclination: 0,
    color: '#ffd166',
    satellites: [
      {
        id: 'fengyun',
        name: '风云气象卫星',
        phase: 0.0,
        speed: 0.004,
        size: 0.1,
        description: 'GEO · 高度约 35,786km',
      },
      {
        id: 'tianlian',
        name: '天链中继卫星',
        phase: Math.PI,
        speed: 0.004,
        size: 0.1,
        description: 'GEO · 高度约 35,786km',
      },
    ],
  },
];

export default function SatellitesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-4">
        <SatelliteIcon className="w-8 h-8 text-cosmic-blue" />
        <h1 className="text-3xl font-bold text-white">地球卫星轨道</h1>
      </div>
      <p className="text-star-dim mb-6 max-w-3xl">
        以可视化的方式展示低地球轨道（LEO）、中地球轨道（MEO）以及地球同步轨道（GEO）。
        鼠标拖拽旋转，滚轮缩放，点击卫星查看详情。建议在桌面端体验。
      </p>

      <div className="rounded-xl overflow-hidden border border-space-600 bg-space-900 h-[70vh] min-h-[500px]">
        <LazyScene cameraPosition={[8, 6, 12]}>
          <Earth size={2} rotationSpeed={0.0015} />
          <SatelliteOrbit orbits={orbits} />
        </LazyScene>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {orbits.map((orbit) => (
          <div
            key={orbit.id}
            className="rounded-xl bg-space-800 border border-space-600 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: orbit.color }}
              />
              <span className="text-white font-semibold">{orbit.label}</span>
            </div>
            <ul className="text-sm text-star-dim space-y-1">
              {orbit.satellites.map((sat) => (
                <li key={sat.id}>· {sat.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
