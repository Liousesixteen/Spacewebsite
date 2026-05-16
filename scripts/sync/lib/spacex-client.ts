/**
 * SpaceX API v4 client. No auth, no enforced rate limits.
 * Docs: https://github.com/r-spacex/SpaceX-API
 */

const SPACEX_BASE = 'https://api.spacexdata.com/v4';

export async function fetchSpaceX<T = unknown>(endpoint: string): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${SPACEX_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`SpaceX API request failed: ${res.status} ${res.statusText} for ${url}`);
  }
  return (await res.json()) as T;
}
