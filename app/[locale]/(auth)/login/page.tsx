import { Card } from '@/components/ui';
import { LoginForm } from '@/components/auth/login-form';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;
  const hasGitHub = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET);
  const hasGoogle = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 backdrop-blur-md bg-space-800/70" variant="glow">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gradient">欢迎回来</h1>
          <p className="text-sm text-star-dim mt-2">登录以使用收藏、评论等功能</p>
        </div>
        <LoginForm locale={locale} hasGitHub={hasGitHub} hasGoogle={hasGoogle} />
      </Card>
    </div>
  );
}
