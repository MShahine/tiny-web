/**
 * Meta Tags Checker Tool API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, analysisResultsTable, metaTagsTable, usersTable } from '@/db';
import { eq, and } from 'drizzle-orm';
import { validateUrl, createUrlHash } from '@/lib/security';
import { fetchUrl } from '@/lib/http-client';
import { parseMetaTags } from '@/lib/meta-tags-parser';
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit';

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
    const rateLimitResult = await checkRateLimit(identifier, 'meta-tags');
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

    // CACHING DISABLED - Always fetch fresh results for debugging
    console.log('Caching disabled - will analyze fresh for URL:', validatedUrl);

    // Create or get user record
    let userId: number | undefined;
    try {
      const userAgent = request.headers.get('user-agent') || '';
      const sessionId = `${identifier}-${Date.now()}`;

      // Try to find existing user first
      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.ipAddress, identifier))
        .limit(1);

      if (existingUser.length > 0) {
        // Update existing user
        userId = existingUser[0].id;
        await db
          .update(usersTable)
          .set({ lastActiveAt: new Date() })
          .where(eq(usersTable.id, userId));
      } else {
        // Create new user
        const result = await db.insert(usersTable).values({
          sessionId,
          ipAddress: identifier,
          userAgent,
        });
        
        // @ts-ignore - Drizzle MySQL insertId access
        if (result.insertId) {
          // @ts-ignore
          userId = Number(result.insertId);
        } else {
          console.warn('Could not get user ID, continuing without userId');
        }
      }
    } catch (error) {
      console.error('User creation failed:', error);
      // Continue without user ID
    }

    // Check for existing analysis record first
    console.log('Checking for existing analysis record...');
    const existingAnalysis = await db
      .select()
      .from(analysisResultsTable)
      .where(
        and(
          eq(analysisResultsTable.toolType, 'meta-tags'),
          eq(analysisResultsTable.urlHash, urlHash)
        )
      )
      .limit(1);

    let analysisId: number;

    if (existingAnalysis.length > 0) {
      // Use existing record
      analysisId = existingAnalysis[0].id;
      console.log('Found existing analysis record with ID:', analysisId);
      console.log('Updating existing record for re-analysis...');

      // Reset status to pending for re-analysis
      await db.update(analysisResultsTable)
        .set({
          status: 'pending',
          updatedAt: new Date(),
          errorMessage: null, // Clear any previous errors
        })
        .where(eq(analysisResultsTable.id, analysisId));
      console.log('Successfully updated existing record to pending');
    } else {
      // Create new record
      console.log('No existing record found, creating new analysis record...');
      const analysisRecord = await db.insert(analysisResultsTable).values({
        userId,
        toolType: 'meta-tags',
        targetUrl: validatedUrl,
        urlHash,
        status: 'pending',
      });
      
      // @ts-ignore - Drizzle MySQL insertId access
      if (analysisRecord.insertId) {
        // @ts-ignore
        analysisId = Number(analysisRecord.insertId);
      } else {
        throw new Error('Failed to get insert ID from database');
      }
      console.log('Created new analysis record with ID:', analysisId);
    }

    // Validate analysisId before proceeding
    if (!analysisId || isNaN(analysisId)) {
      console.error('Invalid analysisId:', analysisId);
      return NextResponse.json({
        success: false,
        error: 'Failed to create analysis record',
      }, { status: 500 });
    }

    console.log('Starting meta tags analysis for:', validatedUrl);
    console.log('Analysis ID:', analysisId);
    const startTime = Date.now();

    try {
      // Fetch the URL
      console.log('Fetching URL:', validatedUrl);
      const fetchResult = await fetchUrl(validatedUrl, {
        userAgent: 'default',
        timeout: 15000,
        maxSize: 2 * 1024 * 1024, // 2MB for HTML
      });

      console.log('Fetch completed. Success:', fetchResult.success, 'Status:', fetchResult.statusCode, 'Response time:', fetchResult.responseTime + 'ms');

      if (!fetchResult.success) {
        await db.update(analysisResultsTable)
          .set({
            status: 'failed',
            errorMessage: fetchResult.error,
            processingTimeMs: Date.now() - startTime,
            updatedAt: new Date(),
          })
          .where(eq(analysisResultsTable.id, analysisId));

        return NextResponse.json({
          success: false,
          error: fetchResult.error || 'Failed to fetch URL',
        }, { status: 400 });
      }

      // Parse meta tags
      console.log('Parsing meta tags from HTML...');
      const metaTagsData = parseMetaTags(fetchResult.data!, validatedUrl);
      console.log('Meta tags parsed. Found', metaTagsData.totalTags, 'tags. SEO Score:', metaTagsData.seoAnalysis.score);

      // Prepare results
      const results = {
        url: validatedUrl,
        finalUrl: fetchResult.finalUrl,
        statusCode: fetchResult.statusCode,
        responseTime: fetchResult.responseTime,
        metaTags: metaTagsData,
        seoScore: metaTagsData.seoAnalysis.score,
        totalTags: metaTagsData.totalTags,
        headers: fetchResult.headers,
      };

      console.log('Storing fresh meta tags analysis results for analysis ID:', analysisId);

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

      // Store detailed meta tags data
      if (metaTagsData.allTags.length > 0) {
        console.log('Storing', metaTagsData.allTags.length, 'meta tags to database...');
        const metaTagsToInsert = metaTagsData.allTags.map(tag => ({
          analysisId,
          name: tag.name || null,
          property: tag.property || null,
          content: tag.content || null,
          httpEquiv: tag.httpEquiv || null,
          charset: tag.charset || null,
        }));

        // Insert in batches to avoid query size limits
        const batchSize = 50;
        for (let i = 0; i < metaTagsToInsert.length; i += batchSize) {
          const batch = metaTagsToInsert.slice(i, i + batchSize);
          await db.insert(metaTagsTable).values(batch);
        }
        console.log('Meta tags stored successfully in database');
      }

      console.log('Meta tags analysis completed successfully!');
      console.log('Final results - SEO Score:', results.seoScore, 'Total Tags:', results.totalTags, 'Processing Time:', Date.now() - startTime + 'ms');

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
      console.error('Meta tags analysis failed:', error);

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
        error: 'Analysis failed',
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
    tool: 'Meta Tags Checker',
    description: 'Analyze all meta tags and get SEO recommendations',
    methods: ['POST'],
    rateLimit: '15 requests per minute',
    parameters: {
      url: 'string (required) - URL to analyze'
    },
    example: {
      url: 'https://example.com'
    }
  });
}
