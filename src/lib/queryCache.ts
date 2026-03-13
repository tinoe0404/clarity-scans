import { unstable_cache } from "next/cache";

/**
 * Higher order function to wrap database queries in Next.js Data Cache.
 * Provides granular revalidation via tags and TTLs for expensive analytical queries.
 */
export function withQueryCache<T extends (...args: unknown[]) => Promise<unknown>>(
  queryFn: T,
  tags: string[],
  revalidateSeconds: number = 60
): T {
  return unstable_cache(queryFn, tags, {
    tags,
    revalidate: revalidateSeconds,
  }) as T;
}
