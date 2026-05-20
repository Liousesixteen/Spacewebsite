export type SpacecraftType =
  | 'SPACE_STATION'
  | 'SATELLITE'
  | 'PROBE'
  | 'CREWED_SPACECRAFT'
  | 'CARGO_SPACECRAFT';

export type SpacecraftStatus = 'OPERATIONAL' | 'RETIRED' | 'LOST';

export interface Spacecraft {
  id: string;
  name: string;
  type: SpacecraftType;
  operator: string;
  launchDate: string;
  status: SpacecraftStatus;
  orbitType: string;
  orbitAltitude: number | null;
  orbitInclination: number | null;
  orbitPeriod: number | null;
  mass: number;
  dimensions: string;
  mission: string;
  description: string;
  images: string[];
}

export interface SpacecraftListResponse {
  data: Spacecraft[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getSpacecraftList(params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  operator?: string;
  orbitType?: string;
  name?: string;
}): Promise<SpacecraftListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.type) searchParams.set('type', params.type);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.operator) searchParams.set('operator', params.operator);
  if (params?.orbitType) searchParams.set('orbitType', params.orbitType);
  if (params?.name) searchParams.set('name', params.name);

  const res = await fetch(`/api/spacecraft?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch spacecraft');
  return res.json();
}

export async function getSpacecraft(id: string): Promise<Spacecraft> {
  const res = await fetch(`/api/spacecraft/${id}`);
  if (!res.ok) throw new Error('Failed to fetch spacecraft');
  return res.json();
}
