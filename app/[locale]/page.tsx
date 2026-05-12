import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('site');

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-gray-400">{t('description')}</p>
      </div>
    </main>
  );
}
