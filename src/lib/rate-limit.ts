/**
 * Rate limiting utilities using database
 */

import { db, rateLimitsTable } from '@/db';
import { eq, and, gte } from 'drizzle-orm';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  total: number;
}

// Default rate limits per tool
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  opengraph: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
  'meta-tags': { windowMs: 60 * 1000, maxRequests: 15 }, // 15 per minute
  'http-headers': { windowMs: 60 * 1000, maxRequests: 20 }, // 20 per minute
  'sitemap-finder': { windowMs: 60 * 1000, maxRequests: 5 }, // 5 per minute
  'robots-txt-tester': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
  'serp-checker': { windowMs: 60 * 1000, maxRequests: 3 }, // 3 per minute (expensive)
  'website-technology-checker': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
  'page-speed-insights': { windowMs: 60 * 1000, maxRequests: 5 }, // 5 per minute (performance analysis is intensive)
  'website-crawl-test': { windowMs: 60 * 1000, maxRequests: 2 }, // 2 per minute (crawling is very intensive)
  'website-crawl': { windowMs: 60 * 1000, maxRequests: 2 }, // 2 per minute (very expensive)
  'tech-checker': { windowMs: 60 * 1000, maxRequests: 8 }, // 8 per minute
  'link-extractor': { windowMs: 60 * 1000, maxRequests: 5 }, // 5 per minute
  'social-media-preview': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute (single page analysis)
  default: { windowMs: 60 * 1000, maxRequests: 10 }, // Default fallback
};

/**
 * Check and update rate limit for a user/tool combination
 */
export async function checkRateLimit(
  identifier: string, // IP address or session ID
  toolType: string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[toolType] || RATE_LIMITS.default;
  const windowStart = new Date(Date.now() - config.windowMs);
  const currentWindow = new Date();

  try {
    // Clean up old entries first (optional optimization)
    await db
      .delete(rateLimitsTable)
      .where(gte(rateLimitsTable.windowStart, new Date(Date.now() - config.windowMs * 2)));

    // Get current rate limit record
    const existing = await db
      .select()
      .from(rateLimitsTable)
      .where(
        and(
          eq(rateLimitsTable.identifier, identifier),
          eq(rateLimitsTable.toolType, toolType),
          gte(rateLimitsTable.windowStart, windowStart)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      // First request in this window
      await db.insert(rateLimitsTable).values({
        identifier,
        toolType,
        requestCount: 1,
        windowStart: currentWindow,
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: new Date(currentWindow.getTime() + config.windowMs),
        total: config.maxRequests,
      };
    }

    const record = existing[0];

    if (record.requestCount >= config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(record.windowStart.getTime() + config.windowMs),
        total: config.maxRequests,
      };
    }

    // Increment request count
    await db
      .update(rateLimitsTable)
      .set({
        requestCount: record.requestCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(rateLimitsTable.id, record.id));

    return {
      allowed: true,
      remaining: config.maxRequests - (record.requestCount + 1),
      resetTime: new Date(record.windowStart.getTime() + config.windowMs),
      total: config.maxRequests,
    };

  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: new Date(Date.now() + config.windowMs),
      total: config.maxRequests,
    };
  }
}

/**
 * Get rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  toolType: string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[toolType] || RATE_LIMITS.default;
  const windowStart = new Date(Date.now() - config.windowMs);

  try {
    const existing = await db
      .select()
      .from(rateLimitsTable)
      .where(
        and(
          eq(rateLimitsTable.identifier, identifier),
          eq(rateLimitsTable.toolType, toolType),
          gte(rateLimitsTable.windowStart, windowStart)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: new Date(Date.now() + config.windowMs),
        total: config.maxRequests,
      };
    }

    const record = existing[0];
    const allowed = record.requestCount < config.maxRequests;

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - record.requestCount),
      resetTime: new Date(record.windowStart.getTime() + config.windowMs),
      total: config.maxRequests,
    };

  } catch (error) {
    console.error('Rate limit status check failed:', error);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs),
      total: config.maxRequests,
    };
  }
}

/**
 * Reset rate limit for a user/tool (admin function)
 */
export async function resetRateLimit(identifier: string, toolType: string): Promise<void> {
  try {
    await db
      .delete(rateLimitsTable)
      .where(
        and(
          eq(rateLimitsTable.identifier, identifier),
          eq(rateLimitsTable.toolType, toolType)
        )
      );
  } catch (error) {
    console.error('Rate limit reset failed:', error);
  }
}

/**
 * Get identifier from request (IP or session)
 */
export function getIdentifier(request: Request): string {
  // Try to get IP from headers (for production with reverse proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback to a session-based identifier
  // In a real app, you'd use cookies or session storage
  return 'anonymous';
}
