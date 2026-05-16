import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { TechnologyForm } from '@/components/admin/forms/technology-form';
import { Card, CardContent } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditTechnologyPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await prisma.technology.findUnique({ where: { id } });
  if (!t) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">编辑技术</h1>
        <p className="text-sm text-star-dim mt-1">{t.name}</p>
      </div>
      <Card>
        <CardContent>
          <TechnologyForm
            mode="edit"
            initial={{
              id: t.id,
              name: t.name,
              category: t.category,
              maturityLevel: t.maturityLevel,
              description: t.description,
              applications: t.applications.join('\n'),
              keyPlayers: t.keyPlayers.join('\n'),
              challenges: t.challenges.join('\n'),
              breakthroughs: t.breakthroughs as any,
            }}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  );
}
