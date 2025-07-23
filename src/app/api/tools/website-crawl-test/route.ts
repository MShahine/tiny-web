/**
 * Website Crawl Test Tool API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, analysisResultsTable, usersTable } from '@/db';
import { eq, and } from 'drizzle-orm';
import { validateUrl, createUrlHash } from '@/lib/security';
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit';
import { crawlWebsite } from '@/lib/website-crawler';

export async function POST(request: NextRequest) {
  try {
    const { url, maxPages, maxDepth, respectRobots } = await request.json();

    // Validate input
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Security validation
    const validation = validateUrl(url);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const validatedUrl = validation.url!.href;
    const crawlSettings = {
      maxPages: Math.min(maxPages || 50, 100), // Limit to 100 pages max
      maxDepth: Math.min(maxDepth || 3, 5), // Limit to 5 levels max
      respectRobots: respectRobots !== false // Default to true
    };
    
    const urlHash = createUrlHash(validatedUrl + JSON.stringify(crawlSettings));
    const identifier = getIdentifier(request);

    // Rate limiting - Crawling is expensive, so lower limits
    const rateLimitResult = await checkRateLimit(identifier, 'website-crawl-test');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          resetTime: rateLimitResult.resetTime,
          remaining: rateLimitResult.remaining
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.total.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
          }
        }
      );
    }

    // Create or get user record
    let userId: number | undefined;
    try {
      const userAgent = request.headers.get('user-agent') || '';
      const sessionId = `${identifier}-${Date.now()}`;
      
      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.ipAddress, identifier))
        .limit(1);

      if (existingUser.length > 0) {
        userId = existingUser[0].id;
        await db
          .update(usersTable)
          .set({ lastActiveAt: new Date() })
          .where(eq(usersTable.id, userId));
      } else {
        const result = await db.insert(usersTable).values({
          sessionId,
          ipAddress: identifier,
          userAgent,
        });
        
        // @ts-ignore - Drizzle MySQL insertId access
        if (result.insertId) {
          // @ts-ignore
          userId = Number(result.insertId);
        }
      }
    } catch (error) {
      console.error('User creation failed:', error);
    }

    // Check for existing analysis
    console.log('Checking for existing crawl analysis...');
    const existingAnalysis = await db
      .select()
      .from(analysisResultsTable)
      .where(
        and(
          eq(analysisResultsTable.toolType, 'website-crawl-test'),
          eq(analysisResultsTable.urlHash, urlHash)
        )
      )
      .limit(1);

    let analysisId: number;
    
    if (existingAnalysis.length > 0) {
      analysisId = existingAnalysis[0].id;
      console.log('Found existing crawl analysis with ID:', analysisId);
      
      // Check if analysis is still fresh (6 hours for crawl data)
      const analysisAge = Date.now() - new Date(existingAnalysis[0].updatedAt).getTime();
      const maxAge = 6 * 60 * 60 * 1000; // 6 hours
      
      if (analysisAge < maxAge && existingAnalysis[0].status === 'completed') {
        console.log('Returning cached crawl analysis');
        return NextResponse.json({
          success: true,
          data: existingAnalysis[0].results,
          cached: true,
          fresh: false,
          analyzedAt: existingAnalysis[0].updatedAt,
        }, {
          headers: {
            'X-RateLimit-Limit': rateLimitResult.total.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
          }
        });
      }
      
      // Reset status for re-analysis
      await db.update(analysisResultsTable)
        .set({
          status: 'pending',
          updatedAt: new Date(),
          errorMessage: null,
        })
        .where(eq(analysisResultsTable.id, analysisId));
    } else {
      console.log('Creating new crawl analysis record...');
      const analysisRecord = await db.insert(analysisResultsTable).values({
        userId,
        toolType: 'website-crawl-test',
        targetUrl: validatedUrl,
        urlHash,
        status: 'pending',
      });
      
      // @ts-ignore - Drizzle MySQL insertId access
      if (analysisRecord.insertId) {
        // @ts-ignore
        analysisId = Number(analysisRecord.insertId);
      } else {
        analysisId = Date.now(); // Fallback
        console.warn('Using timestamp as fallback analysisId:', analysisId);
      }
      console.log('Created new crawl analysis with ID:', analysisId);
    }

    console.log('Starting website crawl for:', validatedUrl);
    console.log('Crawl settings:', crawlSettings);
    const startTime = Date.now();

    try {
      // Start crawling
      const crawlResults = await crawlWebsite(validatedUrl, {
        maxPages: crawlSettings.maxPages,
        maxDepth: crawlSettings.maxDepth,
        respectRobots: crawlSettings.respectRobots,
        followExternalLinks: false,
        delay: 500, // 500ms delay between requests
        userAgent: 'default',
        onProgress: (progress) => {
          console.log(`Crawl progress: ${progress.current}/${progress.total} - ${progress.currentUrl}`);
        }
      });

      // Prepare results
      const results = {
        startUrl: validatedUrl,
        crawlSettings: crawlSettings,
        pages: crawlResults.pages,
        issues: crawlResults.issues,
        summary: crawlResults.summary,
        crawlStats: crawlResults.crawlStats,
        lastChecked: new Date().toISOString(),
      };

      // Update analysis record
      await db.update(analysisResultsTable)
        .set({
          status: 'completed',
          results,
          processingTimeMs: Date.now() - startTime,
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
        })
        .where(eq(analysisResultsTable.id, analysisId));

      console.log('Website crawl completed successfully!');
      console.log(`Crawled ${results.pages.length} pages, found ${results.issues.length} issues`);

      return NextResponse.json({
        success: true,
        data: results,
        cached: false,
        fresh: true,
        analyzedAt: new Date(),
      }, {
        headers: {
          'X-RateLimit-Limit': rateLimitResult.total.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
        }
      });

    } catch (error) {
      console.error('Website crawl failed:', error);
      
      await db.update(analysisResultsTable)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          processingTimeMs: Date.now() - startTime,
          updatedAt: new Date(),
        })
        .where(eq(analysisResultsTable.id, analysisId));

      return NextResponse.json({
        success: false,
        error: 'Website crawl failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    tool: 'Website Crawl Test',
    description: 'Crawl websites to analyze SEO, technical issues, and content structure',
    methods: ['POST'],
    rateLimit: '2 requests per minute',
    parameters: {
      url: 'string (required) - Website URL to crawl',
      maxPages: 'number (optional) - Maximum pages to crawl (default: 50, max: 100)',
      maxDepth: 'number (optional) - Maximum crawl depth (default: 3, max: 5)',
      respectRobots: 'boolean (optional) - Respect robots.txt rules (default: true)'
    },
    example: {
      url: 'https://example.com',
      maxPages: 50,
      maxDepth: 3,
      respectRobots: true
    },
    features: [
      'SEO Analysis (titles, descriptions, headings)',
      'Technical Issues (404s, redirects, broken links)',
      'Content Analysis (duplicate content, thin content)',
      'Internal Link Structure',
      'Image Analysis (alt tags, optimization)',
      'Performance Issues (slow pages, large files)',
      'Robots.txt Compliance',
      'Comprehensive Issue Reporting'
    ]
  });
}