import Link from 'next/link';
import { Globe, Orbit, Sparkles } from 'lucide-react';

interface ExplorePageProps {
  params: { locale: string };
}

const cards = [
  {
    href: 'satellites',
    title: '地球卫星轨道',
    description: '可视化展示 LEO / MEO / GEO 轨道与代表性卫星',
    icon: Orbit,
    accent: 'text-cosmic-blue',
  },
  {
    href: 'solar-system',
    title: '太阳系探索',
    description: '8 大行星围绕太阳运行的 3D 演示，可拖拽旋转视角',
    icon: Globe,
    accent: 'text-amber-300',
  },
];

export default function ExplorePage({ params: { locale } }: ExplorePageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-8 h-8 text-cosmic-blue" />
        <h1 className="text-3xl font-bold text-star-white">深空探索</h1>
      </div>
      <p className="text-star-dim mb-8 max-w-3xl">
        通过交互式 3D 场景探索地球轨道空间与太阳系。建议在桌面端使用以获得最佳体验。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map(({ href, title, description, icon: Icon, accent }) => (
          <Link
            key={href}
            href={`/${locale}/explore/${href}`}
            className="group rounded-xl bg-space-800 border border-space-600 hover:border-cosmic-blue transition-all p-6 block"
          >
            <Icon className={`w-10 h-10 mb-4 ${accent} group-hover:scale-110 transition-transform`} />
            <h2 className="text-xl font-semibold text-star-white mb-2">{title}</h2>
            <p className="text-star-dim text-sm">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
