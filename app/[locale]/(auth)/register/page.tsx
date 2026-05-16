import { Card } from '@/components/ui';
import { RegisterForm } from '@/components/auth/register-form';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RegisterPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 backdrop-blur-md bg-space-800/70" variant="glow">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gradient">加入 SpaceData</h1>
          <p className="text-sm text-star-dim mt-2">创建账号，开启探索宇宙之旅</p>
        </div>
        <RegisterForm locale={locale} />
      </Card>
    </div>
  );
}
