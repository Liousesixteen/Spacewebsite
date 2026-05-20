import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { AlertCircle, Mail } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <div className="min-h-screen bg-space-900 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-star-white mb-4">联系我们</h1>
          <p className="text-lg text-star-dim">
            有任何问题或建议？我们很乐意听取您的意见
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Email */}
          <Card>
            <CardContent className="pt-8">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-cosmic-blue" />
                <h2 className="text-xl font-bold text-star-white">邮件联系</h2>
              </div>
              <p className="text-star-dim mb-4">
                对于一般咨询、反馈或合作机会，请发送邮件至：
              </p>
              <a
                href="mailto:contact@spacedata.example"
                className="inline-block px-4 py-2 bg-cosmic-blue hover:bg-cosmic-blue/80 text-star-white rounded-lg transition-colors"
              >
                contact@spacedata.example
              </a>
            </CardContent>
          </Card>

          {/* GitHub */}
          <Card>
            <CardContent className="pt-8">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-cosmic-blue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <h2 className="text-xl font-bold text-star-white">GitHub</h2>
              </div>
              <p className="text-star-dim mb-4">
                查看我们的开源项目、提交问题或贡献代码：
              </p>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-cosmic-blue hover:bg-cosmic-blue/80 text-star-white rounded-lg transition-colors"
              >
                访问 GitHub
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Report Issues */}
        <Card className="mb-12">
          <CardContent className="pt-8">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-cosmic-blue flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-star-white mb-2">报告问题</h2>
                <p className="text-star-dim leading-relaxed">
                  如果您发现了 bug、数据错误或安全问题，请在我们的 GitHub 仓库中提交 Issue。请提供尽可能详细的信息，包括：
                </p>
                <ul className="space-y-2 text-star-dim mt-4 ml-4">
                  <li>• 问题的详细描述</li>
                  <li>• 复现步骤（如适用）</li>
                  <li>• 您使用的浏览器和操作系统</li>
                  <li>• 相关的截图或日志</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardContent className="pt-8">
            <h2 className="text-xl font-bold text-star-white mb-4">响应时间</h2>
            <p className="text-star-dim leading-relaxed">
              我们致力于在 48 小时内回复所有邮件和 GitHub Issue。对于紧急问题，请在邮件主题中标注&quot;紧急&quot;。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
