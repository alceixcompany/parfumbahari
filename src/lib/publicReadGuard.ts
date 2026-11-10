// Coalesce simultaneous misses within an instance and pause upstream reads after failures.
const pending = new Map<string, Promise<unknown>>();
const blockedUntil = new Map<string, number>();

export class PublicReadError extends Error {
  constructor(public readonly status: number) { super('İçerikler şu anda yüklenemiyor. Lütfen biraz sonra tekrar deneyin.'); }
}

export async function guardPublicRead<T>(key: string, read: () => Promise<T>): Promise<T> {
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'unconfigured';
  const scopedKey = `${project}:${key}`;
  const existing = pending.get(scopedKey);
  if (existing) return existing as Promise<T>;
  if ((blockedUntil.get(project) || 0) > Date.now()) throw new PublicReadError(503);
  const request = (async () => {
    try { return await read(); }
    catch (error) {
      if (!(error instanceof PublicReadError) || error.status !== 404) {
        blockedUntil.set(project, Date.now() + (error instanceof PublicReadError && error.status === 429 ? 60_000 : 10_000));
      }
      throw error;
    } finally { pending.delete(scopedKey); }
  })();
  pending.set(scopedKey, request);
  return request;
}
