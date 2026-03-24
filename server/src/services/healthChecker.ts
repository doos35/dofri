import axios from 'axios';
import cron from 'node-cron';
import { readJSON, writeJSON } from '../storage/fileStore';
import { Link, HealthStatus } from '../types';

const LINKS_FILE = 'links.json';
const HEALTH_FILE = 'health.json';
const CONCURRENCY = 5;
const TIMEOUT_MS = 10000;
const SLOW_THRESHOLD_MS = 3000;

async function checkSingleLink(link: Link): Promise<HealthStatus> {
  const start = Date.now();
  try {
    const response = await axios.head(link.url, {
      timeout: TIMEOUT_MS,
      maxRedirects: 5,
      validateStatus: () => true,
    });

    const elapsed = Date.now() - start;

    if (response.status === 405) {
      const getResponse = await axios.get(link.url, {
        timeout: TIMEOUT_MS,
        maxRedirects: 5,
        validateStatus: () => true,
        headers: { Range: 'bytes=0-0' },
      });
      const getElapsed = Date.now() - start;
      return {
        linkId: link.id,
        status: getResponse.status < 400
          ? (getElapsed >= SLOW_THRESHOLD_MS ? 'slow' : 'ok')
          : 'dead',
        httpCode: getResponse.status,
        responseTimeMs: getElapsed,
        lastCheckedAt: new Date().toISOString(),
      };
    }

    return {
      linkId: link.id,
      status: response.status < 400
        ? (elapsed >= SLOW_THRESHOLD_MS ? 'slow' : 'ok')
        : 'dead',
      httpCode: response.status,
      responseTimeMs: elapsed,
      lastCheckedAt: new Date().toISOString(),
    };
  } catch {
    return {
      linkId: link.id,
      status: 'dead',
      httpCode: null,
      responseTimeMs: Date.now() - start,
      lastCheckedAt: new Date().toISOString(),
    };
  }
}

async function runInPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const p = fn(item).then(result => {
      results.push(result);
    });
    executing.push(p);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(0, executing.findIndex(e =>
        e === Promise.resolve(e)) || 1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

export async function checkAllLinks(): Promise<HealthStatus[]> {
  const links = await readJSON<Link[]>(LINKS_FILE);
  if (links.length === 0) return [];

  const results = await runInPool(links, CONCURRENCY, checkSingleLink);
  await writeJSON(HEALTH_FILE, results);
  return results;
}

export async function getHealthStatuses(): Promise<HealthStatus[]> {
  return readJSON<HealthStatus[]>(HEALTH_FILE);
}

export async function getHealthForLink(linkId: string): Promise<HealthStatus | undefined> {
  const statuses = await readJSON<HealthStatus[]>(HEALTH_FILE);
  return statuses.find(s => s.linkId === linkId);
}

export function startHealthCheckCron(): void {
  console.log('[HealthChecker] Starting cron job (every 5 minutes)');

  // Run once on startup after a short delay
  setTimeout(() => {
    console.log('[HealthChecker] Running initial health check...');
    checkAllLinks()
      .then(results => console.log(`[HealthChecker] Initial check complete: ${results.length} links checked`))
      .catch(err => console.error('[HealthChecker] Initial check failed:', err));
  }, 5000);

  // Then every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('[HealthChecker] Running scheduled health check...');
    try {
      const results = await checkAllLinks();
      console.log(`[HealthChecker] Check complete: ${results.length} links checked`);
    } catch (err) {
      console.error('[HealthChecker] Check failed:', err);
    }
  });
}
