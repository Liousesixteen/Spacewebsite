export interface LaunchPayload {
  name: string;
  type: string;
  [key: string]: unknown;
}

export interface Launch {
  id: string;
  name: string;
  date: string;
  status: string;
  missionDescription: string;
  payloads: LaunchPayload[] | unknown;
  videoUrl?: string | null;
  images: string[];
  rocket: { id: string; name: string; country: string };
  launchSite: { id: string; name: string };
}

export interface LaunchListResponse {
  data: Launch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LaunchStats {
  byYear: { year: number; count: number }[];
  byCountry: { country: string; count: number }[];
  byStatus: { status: string; count: number }[];
  total: number;
}

export async function getLaunches(params?: {
  page?: number;
  limit?: number;
  status?: string;
  country?: string;
  year?: string;
}): Promise<LaunchListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.status) searchParams.set('status', params.status);
  if (params?.country) searchParams.set('country', params.country);
  if (params?.year) searchParams.set('year', params.year);

  const res = await fetch(`/api/launches?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch launches');
  return res.json();
}

export async function getLaunch(id: string): Promise<Launch> {
  const res = await fetch(`/api/launches/${id}`);
  if (!res.ok) throw new Error('Failed to fetch launch');
  return res.json();
}

export async function getLaunchStats(): Promise<LaunchStats> {
  const res = await fetch('/api/launches/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
