import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Wrench,
  Tag,
  Factory,
  Target,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
  Breadcrumbs,
} from '@/components/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      select: {
        name: true,
        description: true,
        category: true,
        manufacturer: true,
      },
    });
    if (!equipment) return { title: '未找到 - SpaceData' };

    const description =
      equipment.description?.slice(0, 160) ??
      `${equipment.name} - ${equipment.manufacturer}`;

    return {
      title: `${equipment.name} - SpaceData`,
      description,
      openGraph: {
        title: equipment.name,
        description,
      },
    };
  } catch (error) {
    console.error('[equipment metadata] failed:', error);
    return { title: '设备详情 - SpaceData' };
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function formatSpecValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (Array.isArray(value)) return value.map((v) => formatSpecValue(v)).join('、');
  return JSON.stringify(value);
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const equipment = await prisma.equipment.findUnique({
    where: { id },
  });

  if (!equipment) notFound();

  const specifications = isPlainObject(equipment.specifications)
    ? equipment.specifications
    : {};
  const specEntries = Object.entries(specifications);

  // Related: equipment in same category
  const sameCategoryEquipment = await prisma.equipment.findMany({
    where: {
      id: { not: equipment.id },
      category: equipment.category,
    },
    select: {
      id: true,
      name: true,
      category: true,
      manufacturer: true,
    },
    take: 3,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: '航天数据', href: `/${locale}` },
          { label: '产业链', href: `/${locale}/industry` },
          { label: '设备', href: `/${locale}/industry/equipment` },
          { label: equipment.name },
        ]}
      />

      <div className="flex items-start gap-3 mb-6">
        <Wrench className="w-8 h-8 text-cosmic-blue mt-1" />
        <div>
          <h1 className="text-3xl font-bold text-white">{equipment.name}</h1>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-star-dim" />
              <StatusBadge status="default" label={equipment.category} />
            </div>
            <div className="flex items-center gap-2 text-sm text-star-dim">
              <Factory className="w-4 h-4" />
              <span>{equipment.manufacturer}</span>
            </div>
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">设备描述</h2>
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {equipment.description}
          </p>
        </CardContent>
      </Card>

      {specEntries.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">技术规格</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {specEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-start p-3 bg-space-700 rounded-lg gap-3"
                >
                  <span className="text-star-dim text-sm">{key}</span>
                  <span className="text-white text-sm text-right break-all">
                    {formatSpecValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {equipment.applications.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cosmic-blue" />
              应用场景
            </h2>
            <div className="flex flex-wrap gap-2">
              {equipment.applications.map((app, index) => (
                <StatusBadge key={index} status="default" label={app} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Content */}
      {sameCategoryEquipment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-cosmic-blue" />
              同类设备
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {sameCategoryEquipment.map((e) => (
                <Link
                  key={e.id}
                  href={`/${locale}/industry/equipment/${e.id}`}
                  className="p-3 bg-space-700 rounded-lg hover:bg-space-600 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-white text-sm font-medium group-hover:text-cosmic-blue transition-colors">
                      {e.name}
                    </span>
                  </div>
                  <span className="text-xs text-star-dim">
                    {e.manufacturer}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
