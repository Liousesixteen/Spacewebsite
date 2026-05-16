export type AstronautStatus = 'ACTIVE' | 'RETIRED' | 'DECEASED';

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  weibo?: string;
  [key: string]: string | undefined;
}

export interface Astronaut {
  id: string;
  name: string;
  nationality: string;
  agency: string;
  birthDate: string;
  status: AstronautStatus;
  spaceFlights: number;
  totalTimeInSpace: number;
  bio: string;
  photo: string | null;
  socialLinks: SocialLinks | null;
}

export interface AstronautMission {
  id: string;
  role: string;
  launch: {
    id: string;
    name: string;
    date: string;
    status: string;
    rocket: { id: string; name: string; country: string };
    launchSite: { id: string; name: string };
  };
}

export interface AstronautDetail extends Astronaut {
  launchCrews: AstronautMission[];
}

export interface AstronautListResponse {
  data: Astronaut[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getAstronauts(params?: {
  page?: number;
  limit?: number;
  nationality?: string;
  agency?: string;
  status?: string;
}): Promise<AstronautListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.nationality) searchParams.set('nationality', params.nationality);
  if (params?.agency) searchParams.set('agency', params.agency);
  if (params?.status) searchParams.set('status', params.status);

  const res = await fetch(`/api/astronauts?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch astronauts');
  return res.json();
}

export async function getAstronaut(id: string): Promise<AstronautDetail> {
  const res = await fetch(`/api/astronauts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch astronaut');
  return res.json();
}

export function formatTimeInSpace(minutes: number): string {
  if (!minutes || minutes < 0) return '0 小时';
  const totalHours = Math.floor(minutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days === 0) return `${hours} 小时`;
  return `${days} 天 ${hours} 小时`;
}
