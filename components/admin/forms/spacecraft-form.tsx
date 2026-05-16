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

const TYPES = [
  'SPACE_STATION',
  'SATELLITE',
  'PROBE',
  'CREWED_SPACECRAFT',
  'CARGO_SPACECRAFT',
] as const;
const STATUSES = ['OPERATIONAL', 'RETIRED', 'LOST'] as const;

export interface SpacecraftFormValues {
  id?: string;
  name: string;
  type: (typeof TYPES)[number];
  operator: string;
  launchDate: string;
  status: (typeof STATUSES)[number];
  orbitType: string;
  orbitAltitude: string;
  orbitInclination: string;
  orbitPeriod: string;
  mass: string;
  dimensions: string;
  mission: string;
  description: string;
  images: string;
}

function toDateInputValue(date?: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function SpacecraftForm({
  mode,
  initial,
  locale,
}: {
  mode: 'create' | 'edit';
  initial?: Partial<SpacecraftFormValues>;
  locale: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<SpacecraftFormValues>({
    name: initial?.name ?? '',
    type: (initial?.type as any) ?? 'SATELLITE',
    operator: initial?.operator ?? '',
    launchDate: toDateInputValue(initial?.launchDate as any) ?? '',
    status: (initial?.status as any) ?? 'OPERATIONAL',
    orbitType: initial?.orbitType ?? '',
    orbitAltitude: initial?.orbitAltitude ?? '',
    orbitInclination: initial?.orbitInclination ?? '',
    orbitPeriod: initial?.orbitPeriod ?? '',
    mass: initial?.mass ?? '0',
    dimensions: initial?.dimensions ?? '',
    mission: initial?.mission ?? '',
    description: initial?.description ?? '',
    images: initial?.images ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof SpacecraftFormValues>(key: K, v: SpacecraftFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.name.trim()) return setError('名称必填');
    if (!values.operator.trim()) return setError('运营方必填');
    if (!values.launchDate) return setError('发射日期必填');

    const body = {
      name: values.name.trim(),
      type: values.type,
      operator: values.operator.trim(),
      launchDate: new Date(values.launchDate).toISOString(),
      status: values.status,
      orbitType: values.orbitType.trim(),
      orbitAltitude: values.orbitAltitude ? Number(values.orbitAltitude) : null,
      orbitInclination: values.orbitInclination ? Number(values.orbitInclination) : null,
      orbitPeriod: values.orbitPeriod ? Number(values.orbitPeriod) : null,
      mass: Number(values.mass) || 0,
      dimensions: values.dimensions.trim(),
      mission: values.mission.trim(),
      description: values.description.trim(),
      images: values.images.split('\n').map((s) => s.trim()).filter(Boolean),
    };

    setSubmitting(true);
    try {
      const url =
        mode === 'create'
          ? '/api/admin/spacecraft'
          : `/api/admin/spacecraft/${initial?.id}`;
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
      router.push(`/${locale}/admin/spacecraft`);
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
        <FormField label="名称" required>
          <TextField value={values.name} onChange={(e) => update('name', e.target.value)} />
        </FormField>
        <FormField label="类型" required>
          <Select value={values.type} onChange={(e) => update('type', e.target.value as any)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="运营方" required>
          <TextField
            value={values.operator}
            onChange={(e) => update('operator', e.target.value)}
          />
        </FormField>
        <FormField label="发射日期" required>
          <TextField
            type="date"
            value={values.launchDate}
            onChange={(e) => update('launchDate', e.target.value)}
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
        <FormField label="轨道类型">
          <TextField
            value={values.orbitType}
            onChange={(e) => update('orbitType', e.target.value)}
            placeholder="LEO / GEO / Sun-synchronous..."
          />
        </FormField>
        <FormField label="轨道高度 (km)">
          <TextField
            type="number"
            step="0.01"
            value={values.orbitAltitude}
            onChange={(e) => update('orbitAltitude', e.target.value)}
          />
        </FormField>
        <FormField label="轨道倾角 (°)">
          <TextField
            type="number"
            step="0.01"
            value={values.orbitInclination}
            onChange={(e) => update('orbitInclination', e.target.value)}
          />
        </FormField>
        <FormField label="轨道周期 (min)">
          <TextField
            type="number"
            step="0.01"
            value={values.orbitPeriod}
            onChange={(e) => update('orbitPeriod', e.target.value)}
          />
        </FormField>
        <FormField label="质量 (kg)">
          <TextField
            type="number"
            step="0.01"
            value={values.mass}
            onChange={(e) => update('mass', e.target.value)}
          />
        </FormField>
        <FormField label="尺寸">
          <TextField
            value={values.dimensions}
            onChange={(e) => update('dimensions', e.target.value)}
            placeholder="如：4.4m x 3m"
          />
        </FormField>
      </div>

      <FormField label="任务">
        <TextArea
          value={values.mission}
          onChange={(e) => update('mission', e.target.value)}
        />
      </FormField>

      <FormField label="描述">
        <TextArea
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </FormField>

      <FormField label="图片 (每行一个 URL)">
        <TextArea
          value={values.images}
          onChange={(e) => update('images', e.target.value)}
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
          onClick={() => router.push(`/${locale}/admin/spacecraft`)}
        >
          取消
        </Button>
      </FormActions>
    </form>
  );
}
