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

const STATUSES = ['PLANNED', 'IN_FLIGHT', 'SUCCESS', 'FAILURE', 'POSTPONED'] as const;

interface RocketOption {
  id: string;
  name: string;
}
interface LaunchSiteOption {
  id: string;
  name: string;
}

export interface LaunchFormValues {
  id?: string;
  name: string;
  date: string; // ISO yyyy-MM-ddTHH:mm
  status: (typeof STATUSES)[number];
  rocketId: string;
  launchSiteId: string;
  missionDescription: string;
  payloads: string; // JSON string
  videoUrl: string;
  images: string; // newline-separated URLs
}

interface LaunchFormProps {
  mode: 'create' | 'edit';
  initial?: Partial<LaunchFormValues>;
  rockets: RocketOption[];
  launchSites: LaunchSiteOption[];
  locale: string;
}

function toLocalInputValue(date?: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  // YYYY-MM-DDTHH:MM
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function LaunchForm({ mode, initial, rockets, launchSites, locale }: LaunchFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<LaunchFormValues>({
    name: initial?.name ?? '',
    date: toLocalInputValue(initial?.date as any) ?? '',
    status: (initial?.status as any) ?? 'PLANNED',
    rocketId: initial?.rocketId ?? rockets[0]?.id ?? '',
    launchSiteId: initial?.launchSiteId ?? launchSites[0]?.id ?? '',
    missionDescription: initial?.missionDescription ?? '',
    payloads:
      typeof initial?.payloads === 'string'
        ? initial.payloads
        : initial?.payloads
        ? JSON.stringify(initial.payloads, null, 2)
        : '[]',
    videoUrl: initial?.videoUrl ?? '',
    images: initial?.images ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof LaunchFormValues>(key: K, v: LaunchFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError('请填写任务名称');
      return;
    }
    if (!values.date) {
      setError('请填写发射时间');
      return;
    }
    if (!values.rocketId) {
      setError('请选择运载火箭');
      return;
    }
    if (!values.launchSiteId) {
      setError('请选择发射场');
      return;
    }

    let payloadsJson: unknown = [];
    try {
      payloadsJson = values.payloads.trim() ? JSON.parse(values.payloads) : [];
    } catch {
      setError('载荷字段必须是合法 JSON');
      return;
    }

    const imagesArr = values.images
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      name: values.name.trim(),
      date: new Date(values.date).toISOString(),
      status: values.status,
      rocketId: values.rocketId,
      launchSiteId: values.launchSiteId,
      missionDescription: values.missionDescription.trim(),
      payloads: payloadsJson,
      videoUrl: values.videoUrl.trim() || null,
      images: imagesArr,
    };

    setSubmitting(true);
    try {
      const url =
        mode === 'create'
          ? '/api/admin/launches'
          : `/api/admin/launches/${initial?.id}`;
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
      router.push(`/${locale}/admin/launches`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <FormError message={error} />

      <FormField label="任务名称" htmlFor="name" required>
        <TextField
          id="name"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="如：神舟十八号"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="发射时间" htmlFor="date" required>
          <TextField
            id="date"
            type="datetime-local"
            value={values.date}
            onChange={(e) => update('date', e.target.value)}
          />
        </FormField>

        <FormField label="状态" htmlFor="status" required>
          <Select
            id="status"
            value={values.status}
            onChange={(e) => update('status', e.target.value as any)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="运载火箭" htmlFor="rocketId" required>
          <Select
            id="rocketId"
            value={values.rocketId}
            onChange={(e) => update('rocketId', e.target.value)}
          >
            <option value="">— 请选择 —</option>
            {rockets.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="发射场" htmlFor="launchSiteId" required>
          <Select
            id="launchSiteId"
            value={values.launchSiteId}
            onChange={(e) => update('launchSiteId', e.target.value)}
          >
            <option value="">— 请选择 —</option>
            {launchSites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="任务描述" htmlFor="missionDescription">
        <TextArea
          id="missionDescription"
          value={values.missionDescription}
          onChange={(e) => update('missionDescription', e.target.value)}
        />
      </FormField>

      <FormField
        label="载荷 (JSON)"
        htmlFor="payloads"
        hint='示例：[{"name":"载荷A","mass":1000}]'
      >
        <TextArea
          id="payloads"
          value={values.payloads}
          onChange={(e) => update('payloads', e.target.value)}
          className="font-mono text-xs"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="视频链接" htmlFor="videoUrl">
          <TextField
            id="videoUrl"
            value={values.videoUrl}
            onChange={(e) => update('videoUrl', e.target.value)}
            placeholder="https://..."
          />
        </FormField>

        <FormField label="图片 (每行一个 URL)" htmlFor="images">
          <TextArea
            id="images"
            value={values.images}
            onChange={(e) => update('images', e.target.value)}
            className="font-mono text-xs"
          />
        </FormField>
      </div>

      <FormActions>
        <Button type="submit" disabled={submitting}>
          {submitting ? '保存中...' : mode === 'create' ? '创建' : '保存'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/admin/launches`)}
        >
          取消
        </Button>
      </FormActions>
    </form>
  );
}
