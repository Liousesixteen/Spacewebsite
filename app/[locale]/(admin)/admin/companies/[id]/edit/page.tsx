import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { CompanyForm } from '@/components/admin/forms/company-form';
import { Card, CardContent } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditCompanyPage({ params }: Props) {
  const { locale, id } = await params;
  const c = await prisma.company.findUnique({ where: { id } });
  if (!c) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">编辑企业</h1>
        <p className="text-sm text-star-dim mt-1">{c.name}</p>
      </div>
      <Card>
        <CardContent>
          <CompanyForm
            mode="edit"
            initial={{
              id: c.id,
              name: c.name,
              country: c.country,
              type: c.type,
              foundedYear: String(c.foundedYear),
              headquarters: c.headquarters,
              employees: c.employees == null ? '' : String(c.employees),
              revenue: c.revenue == null ? '' : String(c.revenue),
              products: c.products.join('\n'),
              achievements: c.achievements.join('\n'),
              website: c.website ?? '',
              stockCode: c.stockCode ?? '',
              description: c.description,
              logo: c.logo ?? '',
            }}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  );
}
