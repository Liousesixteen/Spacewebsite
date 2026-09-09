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
  locale?: string;
}

export function CommentForm({
  targetType,
  targetId,
  parentId = null,
  placeholder,
  onSuccess,
  autoFocus,
  compact,
  locale = 'zh-CN',
}: CommentFormProps) {
  const isEnglish = locale === 'en';
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
      setError(err instanceof Error ? err.message : isEnglish ? 'Unable to submit comment' : '提交失败');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError(isEnglish ? 'Enter a comment before posting' : '请输入评论内容');
      return;
    }
    mutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder ?? (isEnglish ? 'Share your thoughts...' : '分享您的想法...')}
        rows={compact ? 2 : 3}
        autoFocus={autoFocus}
        maxLength={2000}
        className="w-full px-4 py-2 rounded-lg bg-space-700 border border-space-500 text-star-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue focus:ring-1 focus:ring-cosmic-blue resize-y"
      />
      {error && <div className="text-xs text-red-400">{error}</div>}
      <div className="flex items-center justify-between">
        <span className="text-xs text-star-dim">{content.length}/2000</span>
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? (isEnglish ? 'Posting...' : '发布中...') : parentId ? (isEnglish ? 'Reply' : '回复') : (isEnglish ? 'Post comment' : '发表评论')}
        </Button>
      </div>
    </form>
  );
}
