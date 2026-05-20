import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <div className="min-h-screen bg-space-900 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-star-white mb-2">隐私政策</h1>
          <p className="text-star-dim">最后更新：2026 年 5 月 16 日</p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <p className="text-star-dim leading-relaxed">
              SpaceData（以下简称&quot;我们&quot;或&quot;本平台&quot;）致力于保护您的隐私。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。请仔细阅读本政策。
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          {/* Information Collection */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-star-white mb-4">信息收集</h2>
              <p className="text-star-dim leading-relaxed mb-4">
                我们收集以下类型的信息：
              </p>
              <ul className="space-y-3 text-star-dim">
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span><strong>账户信息：</strong>注册时提供的姓名、邮箱地址和密码</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span><strong>使用数据：</strong>您访问的页面、点击的链接、搜索查询和交互行为</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span><strong>设备信息：</strong>IP 地址、浏览器类型、操作系统和设备标识符</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span><strong>偏好设置：</strong>语言选择、主题偏好和其他用户设置</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookie Usage */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-star-white mb-4">Cookie 使用</h2>
              <p className="text-star-dim leading-relaxed">
                我们使用 Cookie 和类似技术来改进您的浏览体验。Cookie 是存储在您设备上的小文件，帮助我们记住您的偏好、保持登录状态和分析网站使用情况。您可以通过浏览器设置控制 Cookie 的接受。
              </p>
            </CardContent>
          </Card>

          {/* Data Storage */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-star-white mb-4">数据存储</h2>
              <p className="text-star-dim leading-relaxed">
                您的个人信息存储在由 Neon 提供的安全数据库中。我们采用行业标准的加密和安全措施来保护您的数据免受未授权访问、修改或泄露。
              </p>
            </CardContent>
          </Card>

          {/* Third-party Services */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-star-white mb-4">第三方服务</h2>
              <p className="text-star-dim leading-relaxed mb-4">
                我们使用以下第三方服务来提供和改进我们的平台：
              </p>
              <ul className="space-y-3 text-star-dim">
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span><strong>NextAuth：</strong>用于身份验证和会话管理</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span><strong>Neon：</strong>用于数据库托管和管理</span>
                </li>
              </ul>
              <p className="text-star-dim leading-relaxed mt-4">
                这些服务提供商可能会根据其各自的隐私政策收集和处理您的信息。
              </p>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-star-white mb-4">用户权利</h2>
              <p className="text-star-dim leading-relaxed mb-4">
                根据 GDPR 和其他适用的隐私法规，您拥有以下权利：
              </p>
              <ul className="space-y-3 text-star-dim">
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span><strong>访问权：</strong>您可以请求访问我们持有的关于您的个人信息</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span><strong>更正权：</strong>您可以要求更正不准确的信息</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span><strong>删除权：</strong>您可以请求删除您的个人信息</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cosmic-blue mt-1">•</span>
                  <span><strong>数据可携带权：</strong>您可以请求以可读格式获取您的数据</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-star-white mb-4">联系方式</h2>
              <p className="text-star-dim leading-relaxed">
                如果您对本隐私政策有任何疑问或想行使您的权利，请通过以下方式与我们联系：
              </p>
              <p className="text-star-white mt-4">
                邮箱：<a href="mailto:contact@spacedata.example" className="text-cosmic-blue hover:underline">contact@spacedata.example</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
