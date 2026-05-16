import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { SpacecraftForm } from '@/components/admin/forms/spacecraft-form';
import { Card, CardContent } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditSpacecraftPage({ params }: Props) {
  const { locale, id } = await params;
  const s = await prisma.spacecraft.findUnique({ where: { id } });
  if (!s) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">编辑航天器</h1>
        <p className="text-sm text-star-dim mt-1">{s.name}</p>
      </div>
      <Card>
        <CardContent>
          <SpacecraftForm
            mode="edit"
            initial={{
              id: s.id,
              name: s.name,
              type: s.type,
              operator: s.operator,
              launchDate: s.launchDate.toISOString(),
              status: s.status,
              orbitType: s.orbitType,
              orbitAltitude: s.orbitAltitude == null ? '' : String(s.orbitAltitude),
              orbitInclination: s.orbitInclination == null ? '' : String(s.orbitInclination),
              orbitPeriod: s.orbitPeriod == null ? '' : String(s.orbitPeriod),
              mass: String(s.mass),
              dimensions: s.dimensions,
              mission: s.mission,
              description: s.description,
              images: s.images.join('\n'),
            }}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  );
}
