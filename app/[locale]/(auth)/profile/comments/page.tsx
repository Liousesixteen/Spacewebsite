import Link from 'next/link';
import { format } from 'date-fns';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { CommentTargetType } from '@prisma/client';

const TYPE_LABELS: Record<CommentTargetType, string> = {
  LAUNCH: '发射任务',
  ROCKET: '火箭',
  SPACECRAFT: '航天器',
  ASTRONAUT: '宇航员',
  COMPANY: '公司',
  TECHNOLOGY: '技术',
};

const TYPE_PATHS: Record<CommentTargetType, (locale: string, id: string) => string> = {
  LAUNCH: (l, id) => `/${l}/launches/${id}`,
  ROCKET: (l, id) => `/${l}/rockets/${id}`,
  SPACECRAFT: (l, id) => `/${l}/spacecraft/${id}`,
  ASTRONAUT: (l, id) => `/${l}/astronauts/${id}`,
  COMPANY: (l, id) => `/${l}/industry/companies/${id}`,
  TECHNOLOGY: (l, id) => `/${l}/industry/technologies/${id}`,
};

export default async function ProfileCommentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const comments = await prisma.comment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 mx-auto text-star-dim mb-3" />
        <p className="text-star-dim">还没有发表过评论</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-white">我的评论</h2>
        <Badge variant="default">{comments.length}</Badge>
      </div>
      <ul className="space-y-3">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className="p-4 bg-space-700 rounded-lg border border-space-600"
          >
            <div className="flex items-center justify-between text-xs text-star-dim mb-2">
              <Link
                href={TYPE_PATHS[comment.targetType](locale, comment.targetId)}
                className="text-cosmic-blue hover:underline"
              >
                {TYPE_LABELS[comment.targetType]}
              </Link>
              <span>
                {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm')}
              </span>
            </div>
            <p className="text-star-dim whitespace-pre-line break-words">
              {comment.content}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
