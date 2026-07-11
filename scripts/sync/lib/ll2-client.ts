/**
 * Launch Library 2 (LL2) HTTP client.
 *
 * Public API at https://ll.thespacedevs.com/2.3.0
 * Rate limit: 15 requests/hour anonymous; production should use API key.
 */

const LL2_BASE = process.env.LL2_API_BASE ?? 'https://ll.thespacedevs.com/2.3.0';
const LL2_API_KEY = process.env.LL2_API_KEY;
const USER_AGENT = 'SpaceWebsite/1.0 (https://github.com/Liousesixteen/Spacewebsite)';
const DELAY_MS = Number(process.env.LL2_DELAY_MS) || 200;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryAsync<T>(
  operation: () => Promise<T>,
  options: {
    attempts: number;
    delayMs: number;
    shouldRetry: (error: unknown) => boolean;
  }
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === options.attempts || !options.shouldRetry(error)) {
        throw error;
      }
      await sleep(options.delayMs * attempt);
    }
  }

  throw lastError;
}

interface LL2Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

async function getJson<T>(url: string): Promise<T> {
  return retryAsync(
    async () => {
      const headers: Record<string, string> = {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      };
      if (LL2_API_KEY) {
        headers['Authorization'] = `Token ${LL2_API_KEY}`;
      }
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(
          `LL2 request failed: ${res.status} ${res.statusText} for ${url}\n${body.slice(0, 200)}`
        );
      }
      return (await res.json()) as T;
    },
    {
      attempts: 3,
      delayMs: 500,
      shouldRetry: (error) => {
        const message = error instanceof Error ? error.message : String(error);
        const status = message.match(/LL2 request failed: (\d{3})/)?.[1];
        return status ? Number(status) >= 500 : true;
      },
    }
  );
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
 *
 * On 429 (rate limited), returns whatever has been collected so far rather than
 * throwing — partial data is still useful.
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
    try {
      const page: LL2Page<T> = await getJson<LL2Page<T>>(nextUrl);
      all.push(...page.results);
      nextUrl = page.next;
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('429')) {
        console.warn(`[LL2] Rate limited after ${all.length} items; returning partial results`);
        break;
      }
      throw err;
    }
  }
  return all.slice(0, maxItems);
}
