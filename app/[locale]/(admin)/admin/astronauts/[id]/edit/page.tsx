import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AstronautForm } from '@/components/admin/forms/astronaut-form';
import { Card, CardContent } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditAstronautPage({ params }: Props) {
  const { locale, id } = await params;
  const a = await prisma.astronaut.findUnique({ where: { id } });
  if (!a) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">编辑宇航员</h1>
        <p className="text-sm text-star-dim mt-1">{a.name}</p>
      </div>
      <Card>
        <CardContent>
          <AstronautForm
            mode="edit"
            initial={{
              id: a.id,
              name: a.name,
              nationality: a.nationality,
              agency: a.agency,
              birthDate: a.birthDate.toISOString(),
              status: a.status,
              spaceFlights: String(a.spaceFlights),
              totalTimeInSpace: String(a.totalTimeInSpace),
              bio: a.bio,
              photo: a.photo ?? '',
              socialLinks: a.socialLinks as any,
            }}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  );
}
