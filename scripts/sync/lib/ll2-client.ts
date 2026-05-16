/**
 * Launch Library 2 (LL2) HTTP client.
 *
 * Public API at https://ll.thespacedevs.com/2.2.0
 * Rate limit: 15 requests/hour anonymous. Be polite.
 */

const LL2_BASE = 'https://ll.thespacedevs.com/2.2.0';
const USER_AGENT = 'SpaceWebsite/1.0 (https://github.com/Liousesixteen/Spacewebsite)';
const DELAY_MS = 200;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface LL2Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`LL2 request failed: ${res.status} ${res.statusText} for ${url}\n${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/**
 * Fetch a single LL2 endpoint without pagination.
 */
export async function fetchLL2<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const url = new URL(endpoint.startsWith('http') ? endpoint : `${LL2_BASE}${endpoint}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  await sleep(DELAY_MS);
  return getJson<T>(url.toString());
}

/**
 * Fetch an LL2 list endpoint, automatically following `next` pagination URLs
 * until either there is no next page or we collect at least `maxItems` results.
 */
export async function fetchLL2List<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  maxItems = 200
): Promise<T[]> {
  const url = new URL(endpoint.startsWith('http') ? endpoint : `${LL2_BASE}${endpoint}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const all: T[] = [];
  let nextUrl: string | null = url.toString();
  while (nextUrl && all.length < maxItems) {
    await sleep(DELAY_MS);
    const page = await getJson<LL2Page<T>>(nextUrl);
    all.push(...page.results);
    nextUrl = page.next;
  }
  return all.slice(0, maxItems);
}
