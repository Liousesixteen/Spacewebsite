import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function DataSourcesPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <div className="min-h-screen bg-space-900 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">数据来源</h1>
          <p className="text-star-dim">
            SpaceData 整合来自全球领先航天机构和数据提供商的数据
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <p className="text-star-dim leading-relaxed">
              我们的平台汇集来自多个可靠来源的航天数据，确保用户获得最准确、最全面的信息。以下是我们主要的数据来源及其说明。
            </p>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <div className="space-y-8">
          {/* Launch Library 2 */}
          <Card>
            <CardContent className="pt-8">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Launch Library 2</h2>
                <Link
                  href="https://ll.thespacedevs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cosmic-blue hover:text-cosmic-blue/80 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
              <p className="text-star-dim mb-3">
                <strong>提供者：</strong> TheSpaceDevs
              </p>
              <p className="text-star-dim leading-relaxed mb-4">
                Launch Library 2 是全球最全面的火箭发射数据库，包含历史发射记录、即将进行的发射任务、火箭信息和发射场地详情。
              </p>
              <p className="text-star-dim">
                <strong>同步频率：</strong> 每小时更新一次
              </p>
            </CardContent>
          </Card>

          {/* SpaceX API */}
          <Card>
            <CardContent className="pt-8">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">SpaceX API</h2>
                <Link
                  href="https://docs.spacexdata.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cosmic-blue hover:text-cosmic-blue/80 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
              <p className="text-star-dim mb-3">
                <strong>提供者：</strong> SpaceX
              </p>
              <p className="text-star-dim leading-relaxed mb-4">
                SpaceX 官方 API 提供了关于 SpaceX 火箭、发射任务、龙飞船和星舰的详细信息。这是了解 SpaceX 最新动态的权威来源。
              </p>
              <p className="text-star-dim">
                <strong>同步频率：</strong> 每 6 小时更新一次
              </p>
            </CardContent>
          </Card>

          {/* NASA APIs */}
          <Card>
            <CardContent className="pt-8">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">NASA APIs</h2>
                <Link
                  href="https://api.nasa.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cosmic-blue hover:text-cosmic-blue/80 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
              <p className="text-star-dim mb-3">
                <strong>提供者：</strong> 美国国家航空航天局 (NASA)
              </p>
              <p className="text-star-dim leading-relaxed mb-4">
                NASA 提供的多个 API 包含关于航天器、宇航员、太空任务和航天探索的官方数据。
              </p>
              <p className="text-star-dim">
                <strong>同步频率：</strong> 每天更新一次
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Accuracy Notice */}
        <Card className="mt-12">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">数据准确性声明</h2>
            <p className="text-star-dim leading-relaxed mb-4">
              虽然我们从可靠的来源获取数据，但我们不能保证所有信息的完全准确性。航天数据可能会因以下原因而变化：
            </p>
            <ul className="space-y-3 text-star-dim mb-4">
              <li className="flex items-start gap-3">
                <span className="text-cosmic-blue mt-1">•</span>
                <span>发射日期的变更或推迟</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cosmic-blue mt-1">•</span>
                <span>任务状态的实时更新</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cosmic-blue mt-1">•</span>
                <span>数据源之间的信息差异</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cosmic-blue mt-1">•</span>
                <span>数据同步延迟</span>
              </li>
            </ul>
            <p className="text-star-dim leading-relaxed">
              对于关键决策，我们建议您直接查阅官方来源。如果您发现任何数据错误，请通过联系我们报告。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
