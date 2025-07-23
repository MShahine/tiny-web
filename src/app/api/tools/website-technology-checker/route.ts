/**
 * Website Technology Checker Tool API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, analysisResultsTable, usersTable } from '@/db';
import { eq, and } from 'drizzle-orm';
import { validateUrl, createUrlHash } from '@/lib/security';
import { fetchUrl } from '@/lib/http-client';
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit';
import { detectTechnologies } from '@/lib/technology-detector';

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
    const rateLimitResult = await checkRateLimit(identifier, 'website-technology-checker');
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
    console.log('Checking for existing technology analysis...');
    const existingAnalysis = await db
      .select()
      .from(analysisResultsTable)
      .where(
        and(
          eq(analysisResultsTable.toolType, 'website-technology-checker'),
          eq(analysisResultsTable.urlHash, urlHash)
        )
      )
      .limit(1);

    let analysisId: number;
    
    if (existingAnalysis.length > 0) {
      analysisId = existingAnalysis[0].id;
      console.log('Found existing technology analysis with ID:', analysisId);
      
      // Check if analysis is still fresh (24 hours)
      const analysisAge = Date.now() - new Date(existingAnalysis[0].updatedAt).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (analysisAge < maxAge && existingAnalysis[0].status === 'completed') {
        console.log('Returning cached technology analysis');
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
      console.log('Creating new technology analysis record...');
      const analysisRecord = await db.insert(analysisResultsTable).values({
        userId,
        toolType: 'website-technology-checker',
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
      console.log('Created new technology analysis with ID:', analysisId);
    }

    console.log('Starting technology analysis for:', validatedUrl);
    const startTime = Date.now();

    try {
      // Fetch website content
      console.log('Fetching website content...');
      const fetchResult = await fetchUrl(validatedUrl, {
        userAgent: 'default',
        timeout: 15000,
        maxSize: 5 * 1024 * 1024, // 5MB for full page analysis
      });

      if (!fetchResult.success || !fetchResult.data) {
        throw new Error(`Failed to fetch website: ${fetchResult.error}`);
      }

      console.log('Website fetched successfully, analyzing technologies...');
      
      // Detect technologies
      const technologyResults = await detectTechnologies(
        validatedUrl,
        fetchResult.data,
        fetchResult.headers || {}
      );

      // Prepare results
      const results = {
        url: validatedUrl,
        technologies: technologyResults.technologies,
        categories: technologyResults.categories,
        summary: technologyResults.summary,
        meta: technologyResults.meta,
        performance: {
          ...technologyResults.performance,
          httpStatus: fetchResult.statusCode || 200
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

      console.log('Technology analysis completed successfully!');
      console.log(`Detected ${results.technologies.length} technologies across ${Object.keys(results.categories).length} categories`);

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
      console.error('Technology analysis failed:', error);
      
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
        error: 'Technology analysis failed',
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
    tool: 'Website Technology Checker',
    description: 'Detect CMS, frameworks, libraries, analytics tools, and other technologies used by websites',
    methods: ['POST'],
    rateLimit: '10 requests per minute',
    parameters: {
      url: 'string (required) - Website URL to analyze'
    },
    example: {
      url: 'https://example.com'
    },
    detects: [
      'CMS (WordPress, Drupal, Shopify, etc.)',
      'JavaScript Frameworks (React, Vue, Angular)',
      'CSS Frameworks (Bootstrap, Tailwind)',
      'Analytics (Google Analytics, Facebook Pixel)',
      'CDN (Cloudflare, AWS CloudFront)',
      'Web Servers (Apache, Nginx)',
      'Libraries (jQuery, Font Awesome)',
      'And much more...'
    ]
  });
}