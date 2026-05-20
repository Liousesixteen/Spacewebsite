'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Trash2, Reply, User as UserIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { CommentForm } from './comment-form';
import {
  fetchComments,
  deleteComment,
  type Comment,
  type CommentTargetType,
} from '@/lib/api/comments';

interface CommentSectionProps {
  targetType: CommentTargetType;
  targetId: string;
  locale?: string;
}

export function CommentSection({
  targetType,
  targetId,
  locale = 'zh-CN',
}: CommentSectionProps) {
  const { data: session, status } = useSession();
  const queryKey = ['comments', targetType, targetId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchComments(targetType, targetId),
  });

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const comments = data?.comments ?? [];
  const totalCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-star-white mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cosmic-blue" />
          评论 ({totalCount})
        </h2>

        {status === 'authenticated' ? (
          <div className="mb-6">
            <CommentForm targetType={targetType} targetId={targetId} />
          </div>
        ) : (
          <div className="mb-6 p-4 bg-space-700 rounded-lg text-center text-sm text-star-dim">
            <Link
              href={`/${locale}/login`}
              className="text-cosmic-blue hover:underline"
            >
              登录
            </Link>{' '}
            后参与讨论
          </div>
        )}

        {isLoading ? (
          <div className="text-sm text-star-dim text-center py-6">加载评论中...</div>
        ) : comments.length === 0 ? (
          <div className="text-sm text-star-dim text-center py-6">
            还没有评论，来发表第一条吧
          </div>
        ) : (
          <ul className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                targetType={targetType}
                targetId={targetId}
                currentUserId={session?.user?.id}
                onDelete={(id) => deleteMutation.mutate(id)}
                isAuthenticated={status === 'authenticated'}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface CommentItemProps {
  comment: Comment;
  targetType: CommentTargetType;
  targetId: string;
  currentUserId?: string;
  onDelete: (id: string) => void;
  isAuthenticated: boolean;
  isReply?: boolean;
}

function CommentItem({
  comment,
  targetType,
  targetId,
  currentUserId,
  onDelete,
  isAuthenticated,
  isReply = false,
}: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const isOwn = currentUserId === comment.userId;
  const displayName = comment.user.name || '用户';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <li className={isReply ? '' : 'pb-4 border-b border-space-700 last:border-b-0 last:pb-0'}>
      <div className="flex gap-3">
        <div className="shrink-0">
          {comment.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.user.image}
              alt={displayName}
              className="w-9 h-9 rounded-full"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-cosmic-blue/20 border border-cosmic-blue/40 flex items-center justify-center text-sm text-cosmic-blue">
              {initial || <UserIcon className="w-4 h-4" />}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-star-white font-medium">{displayName}</span>
            <span className="text-xs text-star-dim">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-star-dim whitespace-pre-line break-words">
            {comment.content}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs">
            {!isReply && isAuthenticated && (
              <button
                type="button"
                onClick={() => setReplyOpen((v) => !v)}
                className="flex items-center gap-1 text-star-dim hover:text-cosmic-blue"
              >
                <Reply className="w-3 h-3" />
                {replyOpen ? '取消' : '回复'}
              </button>
            )}
            {isOwn && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-star-dim hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
                删除
              </button>
            )}
          </div>

          {replyOpen && (
            <div className="mt-3">
              <CommentForm
                targetType={targetType}
                targetId={targetId}
                parentId={comment.id}
                placeholder={`回复 ${displayName}...`}
                onSuccess={() => setReplyOpen(false)}
                autoFocus
                compact
              />
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <ul className="mt-4 space-y-4 pl-4 border-l-2 border-space-700">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  targetType={targetType}
                  targetId={targetId}
                  currentUserId={currentUserId}
                  onDelete={onDelete}
                  isAuthenticated={isAuthenticated}
                  isReply
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}
