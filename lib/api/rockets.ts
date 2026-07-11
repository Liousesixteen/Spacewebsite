export type RocketStatus = 'ACTIVE' | 'RETIRED' | 'IN_DEVELOPMENT';

export interface Rocket {
  id: string;
  name: string;
  manufacturer: string;
  country: string;
  height: number;
  diameter: number;
  mass: number;
  payloadToLEO: number;
  payloadToGTO: number;
  stages: number;
  firstFlight: string;
  status: RocketStatus;
  successRate: number;
  description: string;
  images: string[];
}

export interface RocketListResponse {
  data: Rocket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getRocketList(params?: {
  page?: number;
  limit?: number;
  country?: string;
  status?: string;
  manufacturer?: string;
}): Promise<RocketListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.country) searchParams.set('country', params.country);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.manufacturer) searchParams.set('manufacturer', params.manufacturer);

  const res = await fetch(`/api/rockets?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch rockets');
  return res.json();
}
