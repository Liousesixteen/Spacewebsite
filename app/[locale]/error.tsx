'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">出错了</h1>
        <p className="text-star-dim mb-2">
          遇到了未知问题。我们已记录错误，正在处理。
        </p>
        {error.digest && (
          <p className="text-xs text-star-dim/60 mb-8 font-mono">
            错误编号: {error.digest}
          </p>
        )}
        <Button onClick={reset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    </div>
  );
}
