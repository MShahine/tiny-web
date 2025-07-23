/**
 * Link Extractor Tool API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, analysisResultsTable, usersTable } from '@/db';
import { eq, and } from 'drizzle-orm';
import { validateUrl, createUrlHash } from '@/lib/security';
import { fetchUrl } from '@/lib/http-client';
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit';
import { extractLinks } from '@/lib/link-extractor';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

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
    const urlHash = createUrlHash(validatedUrl);
    const identifier = getIdentifier(request);

    // Rate limiting
    const rateLimitResult = await checkRateLimit(identifier, 'link-extractor');
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
    console.log('Checking for existing link analysis...');
    const existingAnalysis = await db
      .select()
      .from(analysisResultsTable)
      .where(
        and(
          eq(analysisResultsTable.toolType, 'link-extractor'),
          eq(analysisResultsTable.urlHash, urlHash)
        )
      )
      .limit(1);

    let analysisId: number;
    
    if (existingAnalysis.length > 0) {
      analysisId = existingAnalysis[0].id;
      console.log('Found existing link analysis with ID:', analysisId);
      
      // Check if analysis is still fresh (24 hours)
      const analysisAge = Date.now() - new Date(existingAnalysis[0].updatedAt).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (analysisAge < maxAge && existingAnalysis[0].status === 'completed') {
        console.log('Returning cached link analysis');
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
      console.log('Creating new link analysis record...');
      const analysisRecord = await db.insert(analysisResultsTable).values({
        userId,
        toolType: 'link-extractor',
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
      console.log('Created new link analysis with ID:', analysisId);
    }

    console.log('Starting link extraction for:', validatedUrl);
    const startTime = Date.now();

    try {
      // Fetch webpage content - SINGLE REQUEST ONLY (safe approach)
      console.log('Fetching webpage content for link extraction...');
      const fetchResult = await fetchUrl(validatedUrl, {
        userAgent: 'default',
        timeout: 15000,
        maxSize: 5 * 1024 * 1024, // 5MB for full page analysis
      });

      if (!fetchResult.success || !fetchResult.data) {
        throw new Error(`Failed to fetch webpage: ${fetchResult.error}`);
      }

      console.log('Webpage fetched successfully, extracting links...');
      
      // Extract and analyze links from the HTML (NO additional requests)
      const linkAnalysis = await extractLinks(validatedUrl, fetchResult.data);

      // Prepare results
      const results = {
        url: validatedUrl,
        totalLinks: linkAnalysis.totalLinks,
        linksByType: linkAnalysis.linksByType,
        internalLinks: linkAnalysis.internalLinks,
        externalLinks: linkAnalysis.externalLinks,
        emailLinks: linkAnalysis.emailLinks,
        phoneLinks: linkAnalysis.phoneLinks,
        fileLinks: linkAnalysis.fileLinks,
        anchorLinks: linkAnalysis.anchorLinks,
        imageLinks: linkAnalysis.imageLinks,
        insights: linkAnalysis.insights,
        seoIssues: linkAnalysis.seoIssues,
        performance: {
          ...linkAnalysis.performance,
          httpStatus: fetchResult.statusCode || 200,
          responseTime: Date.now() - startTime
        },
        lastChecked: new Date().toISOString(),
      };

      // Update analysis record
      await db.update(analysisResultsTable)
        .set({
          status: 'completed',
          results,
          processingTimeMs: Date.now() - startTime,
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        })
        .where(eq(analysisResultsTable.id, analysisId));

      console.log('Link extraction completed successfully!');
      console.log(`Extracted ${results.totalLinks} links with ${results.seoIssues.length} SEO issues identified`);

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
      console.error('Link extraction failed:', error);
      
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
        error: 'Link extraction failed',
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
    tool: 'Link Extractor',
    description: 'Extract and analyze all links from a webpage with SEO insights',
    methods: ['POST'],
    rateLimit: '10 requests per minute',
    parameters: {
      url: 'string (required) - Webpage URL to extract links from'
    },
    example: {
      url: 'https://example.com'
    },
    features: [
      'Extract all links from a single webpage (safe, no following)',
      'Categorize links (internal, external, email, phone, file, anchor)',
      'Analyze anchor text quality and SEO issues',
      'Identify security issues (target="_blank" without noopener)',
      'Calculate link metrics and insights',
      'Detect duplicate links and empty anchor texts',
      'Provide actionable SEO recommendations',
      'Export comprehensive link reports'
    ],
    safety: [
      'Single page analysis only - no link following',
      'Respects rate limits to avoid server overload',
      'No aggressive crawling or multiple requests',
      'Safe for any website without triggering security measures'
    ]
  });
}