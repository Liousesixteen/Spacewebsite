'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  url: string; // DELETE endpoint
  redirectTo?: string;
  label?: string;
  className?: string;
  /** Optional confirmation message shown via window.confirm */
  confirmMessage?: string;
  small?: boolean;
}

/**
 * Reusable delete button for admin lists. Calls DELETE on the given URL,
 * then refreshes the route or navigates to redirectTo.
 */
export function DeleteButton({
  url,
  redirectTo,
  label,
  className,
  confirmMessage = '确定删除？此操作不可恢复。',
  small,
}: DeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      window.alert(body?.error ?? '删除失败');
      return;
    }
    startTransition(() => {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={
        className ??
        `inline-flex items-center gap-1 ${
          small ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
        } rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50`
      }
    >
      <Trash2 className={small ? 'w-3 h-3' : 'w-4 h-4'} />
      {label ?? '删除'}
    </button>
  );
}
