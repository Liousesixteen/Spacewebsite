import { CompanyForm } from '@/components/admin/forms/company-form';
import { Card, CardContent } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function NewCompanyPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">新建企业</h1>
      </div>
      <Card>
        <CardContent>
          <CompanyForm mode="create" locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
