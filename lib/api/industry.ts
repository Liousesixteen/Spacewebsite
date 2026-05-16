export type IndustryLevel = 'UPSTREAM' | 'MIDSTREAM' | 'DOWNSTREAM';
export type CompanyType = 'STATE_OWNED' | 'PRIVATE' | 'PUBLIC' | 'STARTUP';
export type TechnologyMaturity =
  | 'RESEARCH'
  | 'EXPERIMENTAL'
  | 'APPLIED'
  | 'MATURE';

export interface IndustrySegment {
  id: string;
  name: string;
  level: IndustryLevel;
  category: string;
  description: string;
  technologies: string[];
  marketSize: number | null;
  growthRate: number | null;
  challenges: string[];
  trends: string[];
  _count?: { companies: number };
}

export interface CompanySegmentRef {
  segment: { id: string; name: string; level: IndustryLevel };
}

export interface Company {
  id: string;
  name: string;
  country: string;
  type: CompanyType;
  foundedYear: number;
  headquarters: string;
  employees: number | null;
  revenue: number | null;
  products: string[];
  achievements: string[];
  website: string | null;
  stockCode: string | null;
  description: string;
  logo: string | null;
  segments?: CompanySegmentRef[];
}

export interface Technology {
  id: string;
  name: string;
  category: string;
  maturityLevel: TechnologyMaturity;
  description: string;
  applications: string[];
  keyPlayers: string[];
  challenges: string[];
  breakthroughs: unknown;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  properties: unknown;
  applications: string[];
  manufacturers: string[];
  description: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  specifications: unknown;
  applications: string[];
  description: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getIndustrySegments(params?: {
  level?: IndustryLevel | string;
}): Promise<{ data: IndustrySegment[] }> {
  const searchParams = new URLSearchParams();
  if (params?.level) searchParams.set('level', params.level);
  const res = await fetch(`/api/industry/segments?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch segments');
  return res.json();
}

export async function getCompanies(params?: {
  page?: number;
  limit?: number;
  country?: string;
  type?: string;
  segmentId?: string;
}): Promise<PaginatedResponse<Company>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.country) searchParams.set('country', params.country);
  if (params?.type) searchParams.set('type', params.type);
  if (params?.segmentId) searchParams.set('segmentId', params.segmentId);
  const res = await fetch(`/api/industry/companies?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch companies');
  return res.json();
}

export async function getCompany(id: string): Promise<Company> {
  const res = await fetch(`/api/industry/companies/${id}`);
  if (!res.ok) throw new Error('Failed to fetch company');
  return res.json();
}

export async function getTechnologies(params?: {
  page?: number;
  limit?: number;
  category?: string;
  maturity?: string;
}): Promise<PaginatedResponse<Technology>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.category) searchParams.set('category', params.category);
  if (params?.maturity) searchParams.set('maturity', params.maturity);
  const res = await fetch(`/api/industry/technologies?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch technologies');
  return res.json();
}

export async function getTechnology(id: string): Promise<Technology> {
  const res = await fetch(`/api/industry/technologies/${id}`);
  if (!res.ok) throw new Error('Failed to fetch technology');
  return res.json();
}

export async function getMaterials(params?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<PaginatedResponse<Material>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.category) searchParams.set('category', params.category);
  const res = await fetch(`/api/industry/materials?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch materials');
  return res.json();
}

export async function getMaterial(id: string): Promise<Material> {
  const res = await fetch(`/api/industry/materials/${id}`);
  if (!res.ok) throw new Error('Failed to fetch material');
  return res.json();
}

export async function getEquipment(params?: {
  page?: number;
  limit?: number;
  category?: string;
  manufacturer?: string;
}): Promise<PaginatedResponse<Equipment>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.category) searchParams.set('category', params.category);
  if (params?.manufacturer) searchParams.set('manufacturer', params.manufacturer);
  const res = await fetch(`/api/industry/equipment?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch equipment');
  return res.json();
}

export async function getEquipmentItem(id: string): Promise<Equipment> {
  const res = await fetch(`/api/industry/equipment/${id}`);
  if (!res.ok) throw new Error('Failed to fetch equipment');
  return res.json();
}
