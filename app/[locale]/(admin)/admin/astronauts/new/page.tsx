import { AstronautForm } from '@/components/admin/forms/astronaut-form';
import { Card, CardContent } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function NewAstronautPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">新建宇航员</h1>
      </div>
      <Card>
        <CardContent>
          <AstronautForm mode="create" locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
