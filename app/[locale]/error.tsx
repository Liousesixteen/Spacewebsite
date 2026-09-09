'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
        <h1 className="mb-4 text-3xl font-semibold text-star-white">{t('error')}</h1>
        <p className="text-star-dim mb-2">
          {t('unexpectedError')}
        </p>
        {error.digest && (
          <p className="text-xs text-star-dim/60 mb-8 font-mono">
            {t('errorReference')}: {error.digest}
          </p>
        )}
        <Button onClick={reset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('tryAgain')}
        </Button>
      </div>
    </div>
  );
}
