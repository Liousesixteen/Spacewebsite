'use client';

import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface LaunchStatsChartProps {
  data: {
    byYear: { year: number; count: number }[];
    byCountry: { country: string; count: number }[];
    byStatus: { status: string; count: number }[];
    total: number;
  };
}

export function LaunchStatsChart({ data }: LaunchStatsChartProps) {
  const yearOption = {
    backgroundColor: 'transparent',
    title: { text: '年度发射趋势', textStyle: { color: '#fff' } },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.byYear.map((d) => d.year),
      axisLine: { lineStyle: { color: '#353550' } },
      axisLabel: { color: '#a1a1aa' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#353550' } },
      axisLabel: { color: '#a1a1aa' },
      splitLine: { lineStyle: { color: '#252535' } },
    },
    series: [
      {
        data: data.byYear.map((d) => d.count),
        type: 'line',
        smooth: true,
        lineStyle: { color: '#4f8fff', width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(79, 143, 255, 0.4)' },
              { offset: 1, color: 'rgba(79, 143, 255, 0)' },
            ],
          },
        },
      },
    ],
  };

  const countryOption = {
    backgroundColor: 'transparent',
    title: { text: '各国发射占比', textStyle: { color: '#fff' } },
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: data.byCountry.map((d) => ({ name: d.country, value: d.count })),
        label: { color: '#a1a1aa' },
        itemStyle: {
          borderColor: '#0a0a0f',
          borderWidth: 2,
        },
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-space-800 rounded-xl p-6 border border-space-600">
        <ReactECharts option={yearOption} style={{ height: 300 }} />
      </div>
      <div className="bg-space-800 rounded-xl p-6 border border-space-600">
        <ReactECharts option={countryOption} style={{ height: 300 }} />
      </div>
    </div>
  );
}
