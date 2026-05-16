'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui';
import {
  addFavorite,
  fetchFavoriteStatus,
  removeFavorite,
  type FavoriteType,
} from '@/lib/api/favorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  targetType: FavoriteType;
  targetId: string;
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
}

export function FavoriteButton({
  targetType,
  targetId,
  locale = 'zh-CN',
  size = 'md',
  variant = 'outline',
}: FavoriteButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryKey = ['favorite', targetType, targetId];
  const enabled = status === 'authenticated';

  const { data } = useQuery({
    queryKey,
    queryFn: () => fetchFavoriteStatus(targetType, targetId),
    enabled,
  });

  const addMutation = useMutation({
    mutationFn: () => addFavorite(targetType, targetId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, {
        favorited: true,
        favorite: { id: 'optimistic', userId: '', targetType, targetId, createdAt: '' },
      });
      return { prev };
    },
    onError: (err, _v, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
      setErrorMessage(err instanceof Error ? err.message : '操作失败');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeFavorite(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, { favorited: false, favorite: null });
      return { prev };
    },
    onError: (err, _v, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
      setErrorMessage(err instanceof Error ? err.message : '操作失败');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const favorited = Boolean(data?.favorited);
  const favoriteId = data?.favorite?.id;
  const isPending = addMutation.isPending || removeMutation.isPending;

  function handleClick() {
    setErrorMessage(null);
    if (status !== 'authenticated') {
      const path = window.location.pathname + window.location.search;
      router.push(`/${locale}/login?callbackUrl=${encodeURIComponent(path)}`);
      return;
    }
    if (favorited && favoriteId && favoriteId !== 'optimistic') {
      removeMutation.mutate(favoriteId);
    } else if (!favorited) {
      addMutation.mutate();
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          favorited && 'border-rose-500 text-rose-400 hover:bg-rose-500/10'
        )}
      >
        <Heart
          className={cn('w-4 h-4 mr-2', favorited && 'fill-rose-400 text-rose-400')}
        />
        {favorited ? '已收藏' : '收藏'}
      </Button>
      {errorMessage && (
        <span className="text-xs text-red-400">{errorMessage}</span>
      )}
    </div>
  );
}
