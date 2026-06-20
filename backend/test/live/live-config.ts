/**
 * Shared configuration for the black-box live tests that run against the
 * DEPLOYED NaviMart system (frontend on Vercel, backend on Render), not an
 * in-process app. Override the targets via environment variables when the
 * deployment URLs change:
 *
 *   LIVE_API_ORIGIN  default https://navimart.onrender.com   (NestJS backend)
 *   LIVE_WEB_ORIGIN  default https://navi-mart-iota.vercel.app (Vite frontend)
 *
 * The API is served under the global prefix /api.
 */
export const API_ORIGIN =
  process.env.LIVE_API_ORIGIN ?? 'https://navimart.onrender.com';
export const WEB_ORIGIN =
  process.env.LIVE_WEB_ORIGIN ?? 'https://navi-mart-iota.vercel.app';
export const API_PREFIX = '/api';

export const api = (path: string): string => `${API_PREFIX}${path}`;

/** Valid-shape password that satisfies the @Length(8,72) rule. */
export const STRONG_PASSWORD = 'Sup3rSecret!';

/**
 * A unique, clearly-marked QA email. Tests register throwaway accounts on the
 * production database (there is no self-delete endpoint), so the prefix makes
 * them easy to identify and purge. `seed` keeps parallel suites from colliding.
 */
export function qaEmail(seed: string): string {
  return `qa.${seed}.${Date.now()}.${Math.floor(
    Math.random() * 1e6,
  )}@navimart.test`;
}

/**
 * Render's free tier cold-starts (can take 30-60s on the first request after
 * idle). Ping /api/health until it answers so the real assertions don't eat
 * the cold-start latency and flake. Safe to call in every suite's beforeAll.
 */
export async function warmUpBackend(maxWaitMs = 90_000): Promise<void> {
  const deadline = Date.now() + maxWaitMs;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(`${API_ORIGIN}${api('/health')}`, {
        method: 'GET',
      });
      if (res.ok) return;
    } catch {
      // network/cold-start in progress — retry until the deadline
    }
    if (Date.now() > deadline) {
      throw new Error(
        `Backend ${API_ORIGIN} did not become healthy within ${maxWaitMs}ms`,
      );
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
}
