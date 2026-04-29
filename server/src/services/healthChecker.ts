import axios from 'axios';
import cron from 'node-cron';
import { LinkModel, HealthModel } from '../db/models';
import { Link, HealthStatus } from '../types';

const CONCURRENCY = 5;
const TIMEOUT_MS = 10000;
const SLOW_THRESHOLD_MS = 3000;
const PROJ = { _id: 0, __v: 0 };

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
  const executing = new Set<Promise<void>>();

  for (const item of items) {
    const p: Promise<void> = fn(item).then(result => {
      results.push(result);
      executing.delete(p);
    });
    executing.add(p);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

export async function checkAllLinks(): Promise<HealthStatus[]> {
  const links = await LinkModel.find({}, PROJ).lean<Link[]>();
  if (links.length === 0) return [];

  const results = await runInPool(links, CONCURRENCY, checkSingleLink);

  await Promise.all(
    results.map(r =>
      HealthModel.findOneAndUpdate(
        { linkId: r.linkId },
        r,
        { upsert: true }
      )
    )
  );

  return results;
}

export async function getHealthStatuses(): Promise<HealthStatus[]> {
  return HealthModel.find({}, PROJ).lean<HealthStatus[]>();
}

export async function getHealthForLink(linkId: string): Promise<HealthStatus | undefined> {
  const doc = await HealthModel.findOne({ linkId }, PROJ).lean<HealthStatus>();
  return doc ?? undefined;
}

export function startHealthCheckCron(): void {
  console.log('[HealthChecker] Starting cron job (every 5 minutes)');

  setTimeout(() => {
    console.log('[HealthChecker] Running initial health check...');
    checkAllLinks()
      .then(results => console.log(`[HealthChecker] Initial check complete: ${results.length} links checked`))
      .catch(err => console.error('[HealthChecker] Initial check failed:', err));
  }, 5000);

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
