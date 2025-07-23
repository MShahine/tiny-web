/**
 * Social Media Preview Generator Tool API Endpoint
 * Built with ❤️ by the TinyWeb team and Rovo (Atlassian AI Assistant)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, analysisResultsTable, usersTable } from '@/db';
import { eq, and } from 'drizzle-orm';
import { validateUrl, createUrlHash } from '@/lib/security';
import { fetchUrl } from '@/lib/http-client';
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit';
import { generateSocialPreviews } from '@/lib/social-preview-generator';

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
    const rateLimitResult = await checkRateLimit(identifier, 'social-media-preview');
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
    console.log('Checking for existing social preview analysis...');
    const existingAnalysis = await db
      .select()
      .from(analysisResultsTable)
      .where(
        and(
          eq(analysisResultsTable.toolType, 'social-media-preview'),
          eq(analysisResultsTable.urlHash, urlHash)
        )
      )
      .limit(1);

    let analysisId: number;

    if (existingAnalysis.length > 0) {
      analysisId = existingAnalysis[0].id;
      console.log('Found existing social preview analysis with ID:', analysisId);

      // Check if analysis is still fresh (24 hours)
      const analysisAge = Date.now() - new Date(existingAnalysis[0].updatedAt).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (analysisAge < maxAge && existingAnalysis[0].status === 'completed') {
        console.log('Returning cached social preview analysis');
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
      console.log('Creating new social preview analysis record...');
      const analysisRecord = await db.insert(analysisResultsTable).values({
        userId,
        toolType: 'social-media-preview',
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
      console.log('Created new social preview analysis with ID:', analysisId);
    }

    console.log('Starting social media preview generation for:', validatedUrl);
    const startTime = Date.now();

    try {
      // Fetch webpage content - SINGLE REQUEST ONLY (safe approach)
      console.log('Fetching webpage content for social preview analysis...');
      const fetchResult = await fetchUrl(validatedUrl, {
        userAgent: 'facebook', // Use Facebook bot to get proper OG tags
        timeout: 15000,
        maxSize: 2 * 1024 * 1024, // 2MB should be enough for metadata
      });

      if (!fetchResult.success || !fetchResult.data) {
        throw new Error(`Failed to fetch webpage: ${fetchResult.error}`);
      }

      console.log('Webpage fetched successfully, generating social previews...');

      // Generate social media previews (NO additional requests)
      const socialAnalysis = await generateSocialPreviews(validatedUrl, fetchResult.data);

      // Prepare results
      const results = {
        url: validatedUrl,
        metadata: socialAnalysis.metadata,
        platforms: socialAnalysis.platforms,
        summary: socialAnalysis.summary,
        recommendations: socialAnalysis.recommendations,
        performance: {
          httpStatus: fetchResult.statusCode || 200,
          responseTime: Date.now() - startTime,
          responseSize: fetchResult.data.length,
          generationTime: Date.now() - startTime
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

      console.log('Social media preview generation completed successfully!');
      console.log(`Generated previews for ${Object.keys(results.platforms).length} platforms with ${results.recommendations.length} recommendations`);

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
      console.error('Social media preview generation failed:', error);

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
        error: 'Social media preview generation failed',
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
    tool: 'Social Media Preview Generator',
    description: 'Generate and analyze social media previews across all major platforms',
    methods: ['POST'],
    rateLimit: '10 requests per minute',
    parameters: {
      url: 'string (required) - Webpage URL to generate social previews for'
    },
    example: {
      url: 'https://example.com'
    },
    platforms: [
      'Facebook - Open Graph optimization',
      'Twitter - Twitter Card analysis',
      'LinkedIn - Professional sharing preview',
      'WhatsApp - Link preview optimization',
      'Discord - Rich embed analysis',
      'Telegram - Link preview generation',
      'Slack - Unfurl preview optimization'
    ],
    features: [
      'Extract all social metadata (Open Graph, Twitter Cards)',
      'Generate platform-specific previews with accurate dimensions',
      'Identify missing or suboptimal metadata',
      'Provide actionable optimization recommendations',
      'Analyze image dimensions and optimization',
      'Score each platform for social sharing readiness',
      'Export comprehensive social media reports'
    ],
    builtWith: '❤️ by TinyWeb team and Rovo (Atlassian AI Assistant)',
    safety: [
      'Single page analysis only - no aggressive crawling',
      'Uses Facebook bot user agent for accurate OG tag detection',
      'Respects rate limits and server resources',
      'Safe for any website without triggering security measures'
    ]
  });
}
