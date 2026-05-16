'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui';
import {
  FormField,
  TextField,
  TextArea,
  Select,
  FormActions,
  FormError,
} from './form-fields';

const MATURITY = ['RESEARCH', 'EXPERIMENTAL', 'APPLIED', 'MATURE'] as const;

export interface TechnologyFormValues {
  id?: string;
  name: string;
  category: string;
  maturityLevel: (typeof MATURITY)[number];
  description: string;
  applications: string;
  keyPlayers: string;
  challenges: string;
  breakthroughs: string; // JSON string
}

export function TechnologyForm({
  mode,
  initial,
  locale,
}: {
  mode: 'create' | 'edit';
  initial?: Partial<TechnologyFormValues>;
  locale: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<TechnologyFormValues>({
    name: initial?.name ?? '',
    category: initial?.category ?? '',
    maturityLevel: (initial?.maturityLevel as any) ?? 'RESEARCH',
    description: initial?.description ?? '',
    applications: initial?.applications ?? '',
    keyPlayers: initial?.keyPlayers ?? '',
    challenges: initial?.challenges ?? '',
    breakthroughs:
      typeof initial?.breakthroughs === 'string'
        ? initial.breakthroughs
        : initial?.breakthroughs
        ? JSON.stringify(initial.breakthroughs, null, 2)
        : '[]',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof TechnologyFormValues>(key: K, v: TechnologyFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.name.trim()) return setError('技术名称必填');
    if (!values.category.trim()) return setError('分类必填');

    let breakthroughs: unknown = [];
    try {
      breakthroughs = values.breakthroughs.trim() ? JSON.parse(values.breakthroughs) : [];
    } catch {
      return setError('突破字段必须是合法 JSON');
    }

    const body = {
      name: values.name.trim(),
      category: values.category.trim(),
      maturityLevel: values.maturityLevel,
      description: values.description.trim(),
      applications: values.applications.split('\n').map((s) => s.trim()).filter(Boolean),
      keyPlayers: values.keyPlayers.split('\n').map((s) => s.trim()).filter(Boolean),
      challenges: values.challenges.split('\n').map((s) => s.trim()).filter(Boolean),
      breakthroughs,
    };

    setSubmitting(true);
    try {
      const url =
        mode === 'create'
          ? '/api/admin/technologies'
          : `/api/admin/technologies/${initial?.id}`;
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? '保存失败');
        setSubmitting(false);
        return;
      }
      router.push(`/${locale}/admin/technologies`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <FormError message={error} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="技术名称" required>
          <TextField value={values.name} onChange={(e) => update('name', e.target.value)} />
        </FormField>
        <FormField label="分类" required>
          <TextField
            value={values.category}
            onChange={(e) => update('category', e.target.value)}
          />
        </FormField>
        <FormField label="成熟度" required>
          <Select
            value={values.maturityLevel}
            onChange={(e) => update('maturityLevel', e.target.value as any)}
          >
            {MATURITY.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="描述">
        <TextArea
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </FormField>

      <FormField label="应用 (每行一个)">
        <TextArea
          value={values.applications}
          onChange={(e) => update('applications', e.target.value)}
        />
      </FormField>

      <FormField label="关键玩家 (每行一个)">
        <TextArea
          value={values.keyPlayers}
          onChange={(e) => update('keyPlayers', e.target.value)}
        />
      </FormField>

      <FormField label="挑战 (每行一个)">
        <TextArea
          value={values.challenges}
          onChange={(e) => update('challenges', e.target.value)}
        />
      </FormField>

      <FormField label="突破 (JSON)" hint='示例：[{"year":2024,"title":"..."}]'>
        <TextArea
          value={values.breakthroughs}
          onChange={(e) => update('breakthroughs', e.target.value)}
          className="font-mono text-xs"
        />
      </FormField>

      <FormActions>
        <Button type="submit" disabled={submitting}>
          {submitting ? '保存中...' : mode === 'create' ? '创建' : '保存'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/admin/technologies`)}
        >
          取消
        </Button>
      </FormActions>
    </form>
  );
}
