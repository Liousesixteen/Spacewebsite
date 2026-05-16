export type FavoriteType =
  | 'LAUNCH'
  | 'ROCKET'
  | 'SPACECRAFT'
  | 'ASTRONAUT'
  | 'COMPANY'
  | 'TECHNOLOGY';

export interface Favorite {
  id: string;
  userId: string;
  targetType: FavoriteType;
  targetId: string;
  createdAt: string;
}

export async function fetchFavoriteStatus(
  targetType: FavoriteType,
  targetId: string
): Promise<{ favorited: boolean; favorite: Favorite | null }> {
  const params = new URLSearchParams({ targetType, targetId });
  const res = await fetch(`/api/favorites?${params}`, { cache: 'no-store' });
  if (res.status === 401) {
    return { favorited: false, favorite: null };
  }
  if (!res.ok) throw new Error('Failed to fetch favorite status');
  return res.json();
}

export async function fetchFavorites(): Promise<{ favorites: Favorite[] }> {
  const res = await fetch('/api/favorites', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json();
}

export async function addFavorite(
  targetType: FavoriteType,
  targetId: string
): Promise<{ favorite: Favorite }> {
  const res = await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetType, targetId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to add favorite');
  }
  return res.json();
}

export async function removeFavorite(id: string): Promise<void> {
  const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to remove favorite');
  }
}
