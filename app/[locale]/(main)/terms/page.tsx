import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <div className="min-h-screen bg-space-900 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">服务条款</h1>
          <p className="text-star-dim">最后更新：2026 年 5 月 16 日</p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <p className="text-star-dim leading-relaxed">
              欢迎使用 SpaceData。通过访问和使用本平台，您同意受本服务条款的约束。如果您不同意这些条款，请不要使用本平台。
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          {/* Service Description */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">服务说明</h2>
              <p className="text-star-dim leading-relaxed">
                SpaceData 是一个提供全球航天数据的在线平台，包括火箭发射、航天器、宇航员和航天产业链信息。我们的服务包括数据查询、可视化、用户账户管理和社区功能。
              </p>
            </CardContent>
          </Card>

          {/* User Conduct */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">用户行为</h2>
              <p className="text-star-dim leading-relaxed mb-4">
                使用本平台时，您同意：
              </p>
              <ul className="space-y-3 text-star-dim">
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span>遵守所有适用的法律和法规</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span>不从事任何非法或有害的活动</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span>不尝试未授权访问我们的系统</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span>不发布骚扰、仇恨或不当内容</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span>不进行大规模数据抓取或自动化访问</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">知识产权</h2>
              <p className="text-star-dim leading-relaxed">
                SpaceData 平台的设计、代码和内容受版权保护。您可以为个人、非商业用途查看和使用本平台，但不得复制、修改或分发任何内容，除非获得明确许可。
              </p>
            </CardContent>
          </Card>

          {/* Data Accuracy Disclaimer */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">数据准确性免责声明</h2>
              <p className="text-star-dim leading-relaxed">
                虽然我们努力确保平台上的信息准确和最新，但我们不保证数据的完全准确性、完整性或及时性。我们从第三方来源获取数据，这些数据可能包含错误或过时信息。您使用本平台的数据需自行承担风险。
              </p>
            </CardContent>
          </Card>

          {/* Service Changes */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">服务变更</h2>
              <p className="text-star-dim leading-relaxed">
                我们保留随时修改、暂停或终止本平台或其任何部分的权利，无需事先通知。我们不对因服务变更或中断而造成的任何损失负责。
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">责任限制</h2>
              <p className="text-star-dim leading-relaxed">
                在适用法律允许的最大范围内，SpaceData 及其所有者、员工和代理人对因使用或无法使用本平台而产生的任何间接、附带、特殊或后果性损害不承担责任。
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">联系方式</h2>
              <p className="text-star-dim leading-relaxed">
                如果您对本服务条款有任何疑问，请通过以下方式与我们联系：
              </p>
              <p className="text-white mt-4">
                邮箱：<a href="mailto:contact@spacedata.example" className="text-cosmic-blue hover:underline">contact@spacedata.example</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
