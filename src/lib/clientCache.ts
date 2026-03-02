type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

type CacheOptions = {
  ttlMs?: number;
};

const DEFAULT_TTL_MS = 2 * 60 * 1000;
const CACHE_PREFIX = "portfolio-cache:";

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inflightRequests = new Map<string, Promise<unknown>>();

const toStorageKey = (key: string) => `${CACHE_PREFIX}${key}`;

const readFromSessionStorage = <T>(key: string): CacheEntry<T> | null => {
  try {
    const raw = window.sessionStorage.getItem(toStorageKey(key));
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
};

const writeToSessionStorage = <T>(key: string, entry: CacheEntry<T>): void => {
  try {
    window.sessionStorage.setItem(toStorageKey(key), JSON.stringify(entry));
  } catch {
    // Ignore storage failures (private mode/full quota).
  }
};

const removeFromSessionStorage = (key: string): void => {
  try {
    window.sessionStorage.removeItem(toStorageKey(key));
  } catch {
    // Ignore storage failures.
  }
};

export const getCachedOrFetch = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions,
): Promise<T> => {
  const now = Date.now();
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;

  const memoryEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memoryEntry && memoryEntry.expiresAt > now) {
    return memoryEntry.value;
  }

  const sessionEntry = readFromSessionStorage<T>(key);
  if (sessionEntry && sessionEntry.expiresAt > now) {
    memoryCache.set(key, sessionEntry);
    return sessionEntry.value;
  }

  const existingInflight = inflightRequests.get(key) as Promise<T> | undefined;
  if (existingInflight) {
    return existingInflight;
  }

  const request = (async () => {
    const value = await fetcher();
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttlMs,
    };
    memoryCache.set(key, entry);
    writeToSessionStorage(key, entry);
    return value;
  })();

  inflightRequests.set(key, request);

  try {
    return await request;
  } finally {
    inflightRequests.delete(key);
  }
};

export const invalidateCacheKey = (key: string): void => {
  memoryCache.delete(key);
  inflightRequests.delete(key);
  removeFromSessionStorage(key);
};

export const invalidateCachePrefix = (prefix: string): void => {
  const prefixedKey = `${CACHE_PREFIX}${prefix}`;

  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }

  for (const key of Array.from(inflightRequests.keys())) {
    if (key.startsWith(prefix)) {
      inflightRequests.delete(key);
    }
  }

  try {
    const keysToRemove: string[] = [];
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (key && key.startsWith(prefixedKey)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // Ignore storage failures.
  }
};
