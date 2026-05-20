'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { locales } from '@/lib/i18n/config';

interface SettingsFormProps {
  initialName: string | null;
  initialLocale: string;
}

const LOCALE_LABELS: Record<string, string> = {
  'zh-CN': '中文',
  en: 'English',
  ru: 'Русский',
  ja: '日本語',
};

export function SettingsForm({ initialName, initialLocale }: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? '');
  const [locale, setLocale] = useState(initialLocale);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'err', text: data.error || '保存失败' });
        return;
      }
      setMessage({ type: 'ok', text: '已保存' });
      router.refresh();
    } catch (err) {
      setMessage({ type: 'err', text: '网络错误，请稍后重试' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm text-star-dim mb-1.5">昵称</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="您的昵称"
          maxLength={50}
        />
      </div>
      <div>
        <label className="block text-sm text-star-dim mb-1.5">语言偏好</label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-space-700 border border-space-500 text-star-white focus:outline-none focus:border-cosmic-blue"
        >
          {locales.map((l) => (
            <option key={l} value={l}>
              {LOCALE_LABELS[l] || l}
            </option>
          ))}
        </select>
      </div>
      {message && (
        <div
          className={
            message.type === 'ok'
              ? 'text-sm text-emerald-400'
              : 'text-sm text-red-400'
          }
        >
          {message.text}
        </div>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? '保存中...' : '保存设置'}
      </Button>
    </form>
  );
}
