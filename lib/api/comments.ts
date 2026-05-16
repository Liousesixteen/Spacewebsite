export type CommentTargetType =
  | 'LAUNCH'
  | 'ROCKET'
  | 'SPACECRAFT'
  | 'ASTRONAUT'
  | 'COMPANY'
  | 'TECHNOLOGY';

export interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface Comment {
  id: string;
  userId: string;
  targetType: CommentTargetType;
  targetId: string;
  content: string;
  parentId: string | null;
  likes: number;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  replies?: Comment[];
}

export async function fetchComments(
  targetType: CommentTargetType,
  targetId: string
): Promise<{ comments: Comment[] }> {
  const params = new URLSearchParams({ targetType, targetId });
  const res = await fetch(`/api/comments?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function fetchUserComments(): Promise<{ comments: Comment[] }> {
  const res = await fetch('/api/comments?userOnly=1', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch user comments');
  return res.json();
}

export async function createComment(
  payload: {
    targetType: CommentTargetType;
    targetId: string;
    content: string;
    parentId?: string | null;
  }
): Promise<{ comment: Comment }> {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to post comment');
  }
  return res.json();
}

export async function deleteComment(id: string): Promise<void> {
  const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete comment');
  }
}
