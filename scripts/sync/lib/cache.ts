export function memoizeAsync<Key, Value>(
  resolve: (key: Key) => Promise<Value>,
  getCacheKey: (key: Key) => string = (key) => String(key)
): (key: Key) => Promise<Value> {
  const cache = new Map<string, Promise<Value>>();

  return async (key: Key) => {
    const cacheKey = getCacheKey(key);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const pending = resolve(key).catch((error) => {
      cache.delete(cacheKey);
      throw error;
    });
    cache.set(cacheKey, pending);
    return pending;
  };
}

export async function mapLimit<Item, Result>(
  items: Item[],
  concurrency: number,
  worker: (item: Item, index: number) => Promise<Result>
): Promise<Result[]> {
  const limit = Math.max(1, Math.floor(concurrency));
  const results = new Array<Result>(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await worker(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => runWorker()
  );
  await Promise.all(workers);
  return results;
}
