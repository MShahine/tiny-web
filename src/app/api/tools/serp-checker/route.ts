/**
 * SERP Rank Checker Tool API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, analysisResultsTable, usersTable } from '@/db';
import { eq, and } from 'drizzle-orm';
import { validateUrl, createUrlHash } from '@/lib/security';
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit';
import { checkSerpRanking } from '@/lib/serp-checker';

export async function POST(request: NextRequest) {
  try {
    const { keyword, targetUrl, searchEngine, location, device, maxResults } = await request.json();

    // Validate input
    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    // Validate target URL if provided
    let validatedTargetUrl: string | undefined;
    if (targetUrl) {
      const validation = validateUrl(targetUrl);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: `Invalid target URL: ${validation.error}` },
          { status: 400 }
        );
      }
      validatedTargetUrl = validation.url!.href;
    }

    const identifier = getIdentifier(request);

    // Rate limiting - SERP checking is expensive, so lower limits
    const rateLimitResult = await checkRateLimit(identifier, 'serp-checker');
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

    // Create unique hash for this search query
    const queryString = `${keyword}-${searchEngine || 'google'}-${location || 'US'}-${device || 'desktop'}`;
    // Create a simple hash without using URL parsing
    const queryHash = Buffer.from(queryString).toString('base64').substring(0, 10);

    // Check for existing analysis
    console.log('Checking for existing SERP analysis...');
    const existingAnalysis = await db
      .select()
      .from(analysisResultsTable)
      .where(
        and(
          eq(analysisResultsTable.toolType, 'serp-checker'),
          eq(analysisResultsTable.urlHash, queryHash)
        )
      )
      .limit(1);

    let analysisId: number;
    
    if (existingAnalysis.length > 0) {
      analysisId = existingAnalysis[0].id;
      console.log('Found existing SERP analysis with ID:', analysisId);
      
      // Reset status for re-analysis
      await db.update(analysisResultsTable)
        .set({
          status: 'pending',
          updatedAt: new Date(),
          errorMessage: null,
        })
        .where(eq(analysisResultsTable.id, analysisId));
    } else {
      console.log('Creating new SERP analysis record...');
      const analysisRecord = await db.insert(analysisResultsTable).values({
        userId,
        toolType: 'serp-checker',
        targetUrl: queryString, // Store the query instead of URL
        urlHash: queryHash,
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
      console.log('Created new SERP analysis with ID:', analysisId);
    }

    console.log('Starting SERP analysis for keyword:', keyword);
    const startTime = Date.now();

    try {
      // Perform SERP analysis
      const serpResults = await checkSerpRanking({
        keyword,
        targetUrl: validatedTargetUrl,
        searchEngine: searchEngine || 'google',
        location: location || 'US',
        device: device || 'desktop',
        maxResults: Math.min(maxResults || 100, 100)
      });

      // Prepare results
      const results = {
        keyword: serpResults.keyword,
        searchEngine: serpResults.searchEngine,
        location: serpResults.location,
        device: serpResults.device,
        totalResults: serpResults.totalResults,
        results: serpResults.results,
        features: serpResults.features,
        targetUrl: serpResults.targetUrl,
        targetPosition: serpResults.targetPosition,
        targetFound: serpResults.targetFound,
        competitorUrls: serpResults.competitorUrls,
        searchTime: serpResults.searchTime,
        lastChecked: new Date().toISOString(),
      };

      // Update analysis record
      await db.update(analysisResultsTable)
        .set({
          status: 'completed',
          results,
          processingTimeMs: Date.now() - startTime,
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours (SERP results change frequently)
        })
        .where(eq(analysisResultsTable.id, analysisId));

      console.log('SERP analysis completed successfully!');

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
      console.error('SERP analysis failed:', error);
      
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
        error: 'SERP analysis failed',
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
    tool: 'SERP Rank Checker',
    description: 'Check search engine rankings for keywords and analyze SERP features',
    methods: ['POST'],
    rateLimit: '3 requests per minute',
    parameters: {
      keyword: 'string (required) - Keyword to check rankings for',
      targetUrl: 'string (optional) - Website URL to find in results',
      searchEngine: 'string (optional) - google or bing (default: google)',
      location: 'string (optional) - Country code (default: US)',
      device: 'string (optional) - desktop or mobile (default: desktop)',
      maxResults: 'number (optional) - Max results to analyze (default: 100)'
    },
    example: {
      keyword: 'best pizza recipe',
      targetUrl: 'https://example.com',
      searchEngine: 'google',
      location: 'US',
      device: 'desktop'
    }
  });
}