const store = new Map<string, { data: unknown; expiresAt: number }>();

const TTL = 30 * 60 * 1000;

export function setTemp<T>(key: string, data: T): void {
  store.set(key, { data, expiresAt: Date.now() + TTL });
}

export function getTemp<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function deleteTemp(key: string): void {
  store.delete(key);
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key);
  }
}, 60 * 1000);
