import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Beaker, Tag, Target, Factory, ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Card, CardContent, Badge, Button } from '@/components/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const material = await prisma.material.findUnique({
      where: { id },
      select: { name: true, description: true, category: true },
    });
    if (!material) return { title: '未找到 - SpaceData' };

    const description =
      material.description?.slice(0, 160) ??
      `${material.name} - ${material.category}`;

    return {
      title: `${material.name} - SpaceData`,
      description,
      openGraph: {
        title: material.name,
        description,
      },
    };
  } catch (error) {
    console.error('[material metadata] failed:', error);
    return { title: '材料详情 - SpaceData' };
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function formatPropertyValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (Array.isArray(value)) return value.map((v) => formatPropertyValue(v)).join('、');
  return JSON.stringify(value);
}

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const material = await prisma.material.findUnique({
    where: { id },
  });

  if (!material) notFound();

  const properties = isPlainObject(material.properties) ? material.properties : {};
  const propertyEntries = Object.entries(properties);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href={`/${locale}/industry/materials`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>
      </Link>

      <div className="flex items-start gap-3 mb-6">
        <Beaker className="w-8 h-8 text-cosmic-blue mt-1" />
        <div>
          <h1 className="text-3xl font-bold text-white">{material.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-star-dim" />
            <Badge variant="default">{material.category}</Badge>
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">材料描述</h2>
          <p className="text-star-dim leading-relaxed whitespace-pre-line">
            {material.description}
          </p>
        </CardContent>
      </Card>

      {propertyEntries.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">性能参数</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {propertyEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-start p-3 bg-space-700 rounded-lg gap-3"
                >
                  <span className="text-star-dim text-sm">{key}</span>
                  <span className="text-white text-sm text-right break-all">
                    {formatPropertyValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {material.applications.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-cosmic-blue" />
                应用领域
              </h2>
              <div className="flex flex-wrap gap-2">
                {material.applications.map((app, index) => (
                  <Badge key={index} variant="info">
                    {app}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {material.manufacturers.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Factory className="w-5 h-5 text-cosmic-blue" />
                主要制造商
              </h2>
              <div className="flex flex-wrap gap-2">
                {material.manufacturers.map((m, index) => (
                  <Badge key={index} variant="default">
                    {m}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
