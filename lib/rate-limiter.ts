import { RateLimiterMemory } from 'rate-limiter-flexible';
import { config } from './config';

export const rateLimiter = new RateLimiterMemory({
  points: config.RATE_LIMIT_MAX_REQUESTS,
  duration: config.RATE_LIMIT_WINDOW,
});

export async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    await rateLimiter.consume(ip);
    return true;
  } catch (error) {
    return false;
  }
}