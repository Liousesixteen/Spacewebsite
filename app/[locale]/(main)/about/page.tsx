import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <div className="min-h-screen bg-space-900 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            关于我们
          </h1>
          <p className="text-lg text-star-dim">
            全面的航天数据平台，致力于让全球用户了解太空探索的最新动态
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">我们的使命</h2>
            <p className="text-star-dim leading-relaxed mb-4">
              SpaceData 致力于为全球用户提供最全面、最实时的航天数据。我们相信透明、开放的数据能够激发人们对太空探索的热情，促进航天产业的发展。
            </p>
            <p className="text-star-dim leading-relaxed">
              通过整合全球领先的航天数据源，我们为研究人员、爱好者、投资者和决策者提供了一个统一的平台来追踪火箭发射、航天器、宇航员和航天产业链的最新信息。
            </p>
          </CardContent>
        </Card>

        {/* What We Cover Section */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">我们涵盖的内容</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-cosmic-blue mb-2">发射数据</h3>
                <p className="text-star-dim">
                  全球火箭发射记录、发射状态、火箭信息和发射场地详情
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cosmic-blue mb-2">航天器</h3>
                <p className="text-star-dim">
                  卫星、空间站、探测器和载人飞船的轨道与任务信息
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cosmic-blue mb-2">宇航员</h3>
                <p className="text-star-dim">
                  全球宇航员的个人信息、太空任务履历和成就
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cosmic-blue mb-2">产业链</h3>
                <p className="text-star-dim">
                  航天企业、技术、材料和设备的全面信息
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sources Section */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">数据来源</h2>
            <p className="text-star-dim leading-relaxed mb-6">
              我们的数据来自全球最可靠的航天数据提供商和官方机构：
            </p>
            <ul className="space-y-3 text-star-dim">
              <li className="flex items-start gap-3">
                <span className="text-cosmic-blue mt-1">•</span>
                <span><strong>Launch Library 2</strong> - TheSpaceDevs 提供的全球发射数据库</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cosmic-blue mt-1">•</span>
                <span><strong>SpaceX API</strong> - SpaceX 官方提供的火箭和发射信息</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cosmic-blue mt-1">•</span>
                <span><strong>NASA APIs</strong> - 美国国家航空航天局提供的航天数据</span>
              </li>
            </ul>
            <p className="text-star-dim leading-relaxed mt-6">
              我们定期同步这些数据源，确保平台上的信息始终保持最新。
            </p>
          </CardContent>
        </Card>

        {/* Open Source Section */}
        <Card>
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">开源项目</h2>
            <p className="text-star-dim leading-relaxed mb-6">
              SpaceData 是一个开源项目，我们相信开放和透明的开发能够创造更好的产品。
            </p>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cosmic-blue hover:bg-cosmic-blue/80 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              在 GitHub 上查看
              <ExternalLink className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
