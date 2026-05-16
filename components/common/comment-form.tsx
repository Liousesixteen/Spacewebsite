'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui';
import {
  createComment,
  type CommentTargetType,
} from '@/lib/api/comments';

interface CommentFormProps {
  targetType: CommentTargetType;
  targetId: string;
  parentId?: string | null;
  placeholder?: string;
  onSuccess?: () => void;
  autoFocus?: boolean;
  compact?: boolean;
}

export function CommentForm({
  targetType,
  targetId,
  parentId = null,
  placeholder = '分享您的想法...',
  onSuccess,
  autoFocus,
  compact,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createComment({ targetType, targetId, content: content.trim(), parentId }),
    onSuccess: () => {
      setContent('');
      setError(null);
      queryClient.invalidateQueries({
        queryKey: ['comments', targetType, targetId],
      });
      onSuccess?.();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : '提交失败');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError('请输入评论内容');
      return;
    }
    mutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        autoFocus={autoFocus}
        maxLength={2000}
        className="w-full px-4 py-2 rounded-lg bg-space-700 border border-space-500 text-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue resize-y"
      />
      {error && <div className="text-xs text-red-400">{error}</div>}
      <div className="flex items-center justify-between">
        <span className="text-xs text-star-dim">{content.length}/2000</span>
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? '发布中...' : parentId ? '回复' : '发表评论'}
        </Button>
      </div>
    </form>
  );
}
