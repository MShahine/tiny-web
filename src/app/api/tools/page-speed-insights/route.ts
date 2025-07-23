/**
 * Page Speed Insights Tool API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, analysisResultsTable, usersTable } from '@/db';
import { eq, and } from 'drizzle-orm';
import { validateUrl, createUrlHash } from '@/lib/security';
import { fetchUrl } from '@/lib/http-client';
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit';
import { analyzePerformance } from '@/lib/performance-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { url, device } = await request.json();

    // Validate input
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate device parameter
    const validDevice = device === 'mobile' ? 'mobile' : 'desktop';

    // Security validation
    const validation = validateUrl(url);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const validatedUrl = validation.url!.href;
    const urlHash = createUrlHash(validatedUrl + '-' + validDevice);
    const identifier = getIdentifier(request);

    // Rate limiting
    const rateLimitResult = await checkRateLimit(identifier, 'page-speed-insights');
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
    console.log('Checking for existing performance analysis...');
    const existingAnalysis = await db
      .select()
      .from(analysisResultsTable)
      .where(
        and(
          eq(analysisResultsTable.toolType, 'page-speed-insights'),
          eq(analysisResultsTable.urlHash, urlHash)
        )
      )
      .limit(1);

    let analysisId: number;
    
    if (existingAnalysis.length > 0) {
      analysisId = existingAnalysis[0].id;
      console.log('Found existing performance analysis with ID:', analysisId);
      
      // Check if analysis is still fresh (1 hour for performance data)
      const analysisAge = Date.now() - new Date(existingAnalysis[0].updatedAt).getTime();
      const maxAge = 60 * 60 * 1000; // 1 hour
      
      if (analysisAge < maxAge && existingAnalysis[0].status === 'completed') {
        console.log('Returning cached performance analysis');
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
      console.log('Creating new performance analysis record...');
      const analysisRecord = await db.insert(analysisResultsTable).values({
        userId,
        toolType: 'page-speed-insights',
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
      console.log('Created new performance analysis with ID:', analysisId);
    }

    console.log('Starting performance analysis for:', validatedUrl, 'Device:', validDevice);
    const startTime = Date.now();

    try {
      // Fetch website content
      console.log('Fetching website content for performance analysis...');
      const fetchResult = await fetchUrl(validatedUrl, {
        userAgent: validDevice === 'mobile' ? 'mobile-bot' : 'default',
        timeout: 20000,
        maxSize: 10 * 1024 * 1024, // 10MB for full page analysis
      });

      if (!fetchResult.success || !fetchResult.data) {
        throw new Error(`Failed to fetch website: ${fetchResult.error}`);
      }

      console.log('Website fetched successfully, analyzing performance...');
      
      // Analyze performance
      const performanceResults = await analyzePerformance(
        validatedUrl,
        fetchResult.data,
        fetchResult.headers || {},
        validDevice
      );

      // Prepare results
      const results = {
        url: validatedUrl,
        device: validDevice,
        metrics: performanceResults.metrics,
        resources: performanceResults.resources,
        opportunities: performanceResults.opportunities,
        diagnostics: performanceResults.diagnostics,
        summary: performanceResults.summary,
        fetchInfo: {
          httpStatus: fetchResult.statusCode || 200,
          responseTime: Date.now() - startTime,
          responseSize: fetchResult.data.length,
          headers: fetchResult.headers
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
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        })
        .where(eq(analysisResultsTable.id, analysisId));

      console.log('Performance analysis completed successfully!');
      console.log(`Overall Score: ${results.summary.overallScore}/100 (${results.summary.grade})`);
      console.log(`Found ${results.opportunities.length} optimization opportunities`);

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
      console.error('Performance analysis failed:', error);
      
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
        error: 'Performance analysis failed',
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
    tool: 'Page Speed Insights',
    description: 'Analyze website performance, Core Web Vitals, and get optimization recommendations',
    methods: ['POST'],
    rateLimit: '5 requests per minute',
    parameters: {
      url: 'string (required) - Website URL to analyze',
      device: 'string (optional) - desktop or mobile (default: desktop)'
    },
    example: {
      url: 'https://example.com',
      device: 'desktop'
    },
    metrics: [
      'Core Web Vitals (LCP, FID, CLS)',
      'Performance Metrics (TTFB, Load Time)',
      'Resource Analysis (CSS, JS, Images)',
      'Optimization Opportunities',
      'SEO & Accessibility Scores',
      'Best Practices Compliance'
    ]
  });
}