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

const TYPES = ['STATE_OWNED', 'PRIVATE', 'PUBLIC', 'STARTUP'] as const;

export interface CompanyFormValues {
  id?: string;
  name: string;
  country: string;
  type: (typeof TYPES)[number];
  foundedYear: string;
  headquarters: string;
  employees: string;
  revenue: string;
  products: string;
  achievements: string;
  website: string;
  stockCode: string;
  description: string;
  logo: string;
}

export function CompanyForm({
  mode,
  initial,
  locale,
}: {
  mode: 'create' | 'edit';
  initial?: Partial<CompanyFormValues>;
  locale: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<CompanyFormValues>({
    name: initial?.name ?? '',
    country: initial?.country ?? '',
    type: (initial?.type as any) ?? 'PRIVATE',
    foundedYear: initial?.foundedYear ?? String(new Date().getFullYear()),
    headquarters: initial?.headquarters ?? '',
    employees: initial?.employees ?? '',
    revenue: initial?.revenue ?? '',
    products: initial?.products ?? '',
    achievements: initial?.achievements ?? '',
    website: initial?.website ?? '',
    stockCode: initial?.stockCode ?? '',
    description: initial?.description ?? '',
    logo: initial?.logo ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof CompanyFormValues>(key: K, v: CompanyFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.name.trim()) return setError('企业名称必填');
    if (!values.country.trim()) return setError('国家必填');
    if (!values.foundedYear) return setError('成立年份必填');
    if (!values.headquarters.trim()) return setError('总部地址必填');

    const body = {
      name: values.name.trim(),
      country: values.country.trim(),
      type: values.type,
      foundedYear: Number(values.foundedYear) || 0,
      headquarters: values.headquarters.trim(),
      employees: values.employees ? Number(values.employees) : null,
      revenue: values.revenue ? Number(values.revenue) : null,
      products: values.products.split('\n').map((s) => s.trim()).filter(Boolean),
      achievements: values.achievements.split('\n').map((s) => s.trim()).filter(Boolean),
      website: values.website.trim() || null,
      stockCode: values.stockCode.trim() || null,
      description: values.description.trim(),
      logo: values.logo.trim() || null,
    };

    setSubmitting(true);
    try {
      const url =
        mode === 'create'
          ? '/api/admin/companies'
          : `/api/admin/companies/${initial?.id}`;
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
      router.push(`/${locale}/admin/companies`);
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
        <FormField label="企业名称" required>
          <TextField value={values.name} onChange={(e) => update('name', e.target.value)} />
        </FormField>
        <FormField label="国家" required>
          <TextField value={values.country} onChange={(e) => update('country', e.target.value)} />
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
        <FormField label="成立年份" required>
          <TextField
            type="number"
            value={values.foundedYear}
            onChange={(e) => update('foundedYear', e.target.value)}
          />
        </FormField>
        <FormField label="总部" required>
          <TextField
            value={values.headquarters}
            onChange={(e) => update('headquarters', e.target.value)}
          />
        </FormField>
        <FormField label="员工数">
          <TextField
            type="number"
            value={values.employees}
            onChange={(e) => update('employees', e.target.value)}
          />
        </FormField>
        <FormField label="营收 (USD)">
          <TextField
            type="number"
            step="0.01"
            value={values.revenue}
            onChange={(e) => update('revenue', e.target.value)}
          />
        </FormField>
        <FormField label="官网">
          <TextField
            value={values.website}
            onChange={(e) => update('website', e.target.value)}
          />
        </FormField>
        <FormField label="股票代码">
          <TextField
            value={values.stockCode}
            onChange={(e) => update('stockCode', e.target.value)}
          />
        </FormField>
        <FormField label="Logo URL">
          <TextField value={values.logo} onChange={(e) => update('logo', e.target.value)} />
        </FormField>
      </div>

      <FormField label="产品 (每行一个)">
        <TextArea
          value={values.products}
          onChange={(e) => update('products', e.target.value)}
        />
      </FormField>

      <FormField label="成就 (每行一个)">
        <TextArea
          value={values.achievements}
          onChange={(e) => update('achievements', e.target.value)}
        />
      </FormField>

      <FormField label="描述">
        <TextArea
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </FormField>

      <FormActions>
        <Button type="submit" disabled={submitting}>
          {submitting ? '保存中...' : mode === 'create' ? '创建' : '保存'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/admin/companies`)}
        >
          取消
        </Button>
      </FormActions>
    </form>
  );
}
