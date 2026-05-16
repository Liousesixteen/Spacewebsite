import { SpacecraftForm } from '@/components/admin/forms/spacecraft-form';
import { Card, CardContent } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function NewSpacecraftPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">新建航天器</h1>
      </div>
      <Card>
        <CardContent>
          <SpacecraftForm mode="create" locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
