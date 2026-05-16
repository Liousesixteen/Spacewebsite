'use client';

import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { Shield, ShieldOff } from 'lucide-react';

interface ToggleRoleButtonProps {
  userId: string;
  currentRole: 'USER' | 'ADMIN';
  isSelf: boolean;
}

export function ToggleRoleButton({ userId, currentRole, isSelf }: ToggleRoleButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  if (isSelf) {
    return (
      <span
        title="不能修改自己的角色"
        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-space-700 text-star-dim cursor-not-allowed opacity-60"
      >
        <Shield className="w-3 h-3" /> 当前账户
      </span>
    );
  }

  const isAdmin = currentRole === 'ADMIN';
  const verb = isAdmin ? '撤销管理员' : '设为管理员';
  const Icon = isAdmin ? ShieldOff : Shield;

  async function handleClick() {
    if (
      !window.confirm(
        isAdmin ? '确定撤销该用户的管理员权限？' : '确定将该用户设为管理员？'
      )
    )
      return;
    setBusy(true);
    const res = await fetch(`/api/admin/users/${userId}/toggle-role`, { method: 'POST' });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      window.alert(body?.error ?? '操作失败');
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || pending}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-space-600 text-white hover:border-cosmic-blue/40 disabled:opacity-50"
    >
      <Icon className="w-3 h-3" />
      {verb}
    </button>
  );
}
