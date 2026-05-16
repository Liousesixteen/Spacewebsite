import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileNav } from '@/components/profile/profile-nav';

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/profile`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-6">
          <ProfileHeader user={user} />
          <ProfileNav locale={locale} />
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
