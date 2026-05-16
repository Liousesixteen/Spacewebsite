import { TechnologyForm } from '@/components/admin/forms/technology-form';
import { Card, CardContent } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function NewTechnologyPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">新建技术</h1>
      </div>
      <Card>
        <CardContent>
          <TechnologyForm mode="create" locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
