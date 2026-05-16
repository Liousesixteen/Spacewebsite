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

const STATUSES = ['ACTIVE', 'RETIRED', 'DECEASED'] as const;

export interface AstronautFormValues {
  id?: string;
  name: string;
  nationality: string;
  agency: string;
  birthDate: string; // yyyy-MM-dd
  status: (typeof STATUSES)[number];
  spaceFlights: string;
  totalTimeInSpace: string;
  bio: string;
  photo: string;
  socialLinks: string; // JSON string
}

function toDateInputValue(date?: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function AstronautForm({
  mode,
  initial,
  locale,
}: {
  mode: 'create' | 'edit';
  initial?: Partial<AstronautFormValues>;
  locale: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<AstronautFormValues>({
    name: initial?.name ?? '',
    nationality: initial?.nationality ?? '',
    agency: initial?.agency ?? '',
    birthDate: toDateInputValue(initial?.birthDate as any) ?? '',
    status: (initial?.status as any) ?? 'ACTIVE',
    spaceFlights: initial?.spaceFlights ?? '0',
    totalTimeInSpace: initial?.totalTimeInSpace ?? '0',
    bio: initial?.bio ?? '',
    photo: initial?.photo ?? '',
    socialLinks:
      typeof initial?.socialLinks === 'string'
        ? initial.socialLinks
        : initial?.socialLinks
        ? JSON.stringify(initial.socialLinks, null, 2)
        : '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof AstronautFormValues>(key: K, v: AstronautFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.name.trim()) return setError('姓名必填');
    if (!values.nationality.trim()) return setError('国籍必填');
    if (!values.agency.trim()) return setError('机构必填');
    if (!values.birthDate) return setError('出生日期必填');

    let socialLinks: unknown = null;
    if (values.socialLinks.trim()) {
      try {
        socialLinks = JSON.parse(values.socialLinks);
      } catch {
        return setError('社交链接必须是合法 JSON');
      }
    }

    const body = {
      name: values.name.trim(),
      nationality: values.nationality.trim(),
      agency: values.agency.trim(),
      birthDate: new Date(values.birthDate).toISOString(),
      status: values.status,
      spaceFlights: Number(values.spaceFlights) || 0,
      totalTimeInSpace: Number(values.totalTimeInSpace) || 0,
      bio: values.bio.trim(),
      photo: values.photo.trim() || null,
      socialLinks,
    };

    setSubmitting(true);
    try {
      const url =
        mode === 'create'
          ? '/api/admin/astronauts'
          : `/api/admin/astronauts/${initial?.id}`;
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
      router.push(`/${locale}/admin/astronauts`);
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
        <FormField label="姓名" required>
          <TextField value={values.name} onChange={(e) => update('name', e.target.value)} />
        </FormField>
        <FormField label="国籍" required>
          <TextField
            value={values.nationality}
            onChange={(e) => update('nationality', e.target.value)}
          />
        </FormField>
        <FormField label="机构" required>
          <TextField
            value={values.agency}
            onChange={(e) => update('agency', e.target.value)}
            placeholder="如：CNSA, NASA"
          />
        </FormField>
        <FormField label="出生日期" required>
          <TextField
            type="date"
            value={values.birthDate}
            onChange={(e) => update('birthDate', e.target.value)}
          />
        </FormField>
        <FormField label="状态" required>
          <Select value={values.status} onChange={(e) => update('status', e.target.value as any)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="飞行次数">
          <TextField
            type="number"
            min="0"
            value={values.spaceFlights}
            onChange={(e) => update('spaceFlights', e.target.value)}
          />
        </FormField>
        <FormField label="累计太空时间 (分钟)">
          <TextField
            type="number"
            min="0"
            value={values.totalTimeInSpace}
            onChange={(e) => update('totalTimeInSpace', e.target.value)}
          />
        </FormField>
        <FormField label="头像 URL">
          <TextField value={values.photo} onChange={(e) => update('photo', e.target.value)} />
        </FormField>
      </div>

      <FormField label="个人简介">
        <TextArea value={values.bio} onChange={(e) => update('bio', e.target.value)} />
      </FormField>

      <FormField label="社交链接 (JSON)" hint='示例：{"twitter":"https://..."}'>
        <TextArea
          value={values.socialLinks}
          onChange={(e) => update('socialLinks', e.target.value)}
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
          onClick={() => router.push(`/${locale}/admin/astronauts`)}
        >
          取消
        </Button>
      </FormActions>
    </form>
  );
}
