'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';

interface LoginFormProps {
  locale: string;
  hasGitHub: boolean;
  hasGoogle: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ locale, hasGitHub, hasGoogle }: LoginFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || `/${locale}/profile`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_REGEX.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    if (password.length < 8) {
      setError('密码至少需要 8 位');
      return;
    }

    setLoading(true);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (!res || res.error) {
      setError('邮箱或密码错误');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  function handleOAuth(provider: 'github' | 'google') {
    signIn(provider, { callbackUrl });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-star-dim mb-1.5">邮箱</label>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-star-dim mb-1.5">密码</label>
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </Button>
      </form>

      {(hasGitHub || hasGoogle) && (
        <>
          <div className="flex items-center gap-3 text-xs text-star-dim">
            <div className="flex-1 h-px bg-space-600" />
            <span>或使用第三方账号</span>
            <div className="flex-1 h-px bg-space-600" />
          </div>
          <div className="space-y-2">
            {hasGitHub && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuth('github')}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.492.998.107-.776.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.527.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.018.005 2.044.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.654 1.649.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.805 5.624-5.475 5.92.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576 4.765-1.587 8.2-6.084 8.2-11.384 0-6.627-5.373-12-12-12" />
                </svg>
                使用 GitHub 登录
              </Button>
            )}
            {hasGoogle && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuth('google')}
              >
                使用 Google 登录
              </Button>
            )}
          </div>
        </>
      )}

      <p className="text-sm text-center text-star-dim">
        还没有账号？{' '}
        <Link
          href={`/${locale}/register`}
          className="text-cosmic-blue hover:underline"
        >
          立即注册
        </Link>
      </p>
    </div>
  );
}
