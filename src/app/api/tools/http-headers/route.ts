/**
 * HTTP Headers Checker Tool API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, analysisResultsTable, httpHeadersTable, usersTable } from '@/db';
import { eq, and } from 'drizzle-orm';
import { validateUrl, createUrlHash } from '@/lib/security';
import { fetchUrl } from '@/lib/http-client';
import { parseHttpHeaders, getStatusCodeInfo } from '@/lib/http-headers-parser';
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
    console.log('Validated URL:', validatedUrl);
    
    const urlHash = createUrlHash(validatedUrl);
    console.log('URL hash created:', urlHash);
    
    const identifier = getIdentifier(request);
    console.log('Identifier:', identifier);

    // Rate limiting
    const rateLimitResult = await checkRateLimit(identifier, 'http-headers');
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

    // Test database connection
    console.log('Testing database connection...');
    try {
      await db.select().from(usersTable).limit(1);
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }

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
        
        // For Drizzle with MySQL, the insertId should be available directly
        
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
          eq(analysisResultsTable.toolType, 'http-headers'),
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
        toolType: 'http-headers',
        targetUrl: validatedUrl,
        urlHash,
        status: 'pending',
      });
      
      // For Drizzle with MySQL, the insertId should be available directly
      
      // @ts-ignore - Drizzle MySQL insertId access
      if (analysisRecord.insertId) {
        // @ts-ignore
        analysisId = Number(analysisRecord.insertId);
      } else {
        console.error('Could not find insertId in result:', analysisRecord);
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

    console.log('Starting HTTP headers analysis for:', validatedUrl);
    console.log('Analysis ID:', analysisId);
    const startTime = Date.now();

    try {
      // Fetch the URL (HEAD request first for headers only)
      console.log('Fetching headers for URL:', validatedUrl);
      console.log('Fetching URL:', validatedUrl);
      const fetchResult = await fetchUrl(validatedUrl, {
        userAgent: 'default',
        timeout: 15000,
        maxSize: 1024 * 1024, // 1MB - very generous for headers analysis
        method: 'HEAD', // Only fetch headers, not the full content
      });
      
      console.log('Fetch result details:', {
        success: fetchResult.success,
        error: fetchResult.error,
        statusCode: fetchResult.statusCode,
        headersCount: fetchResult.headers ? Object.keys(fetchResult.headers).length : 0
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

      // Parse HTTP headers
      console.log('Parsing HTTP headers...');
      const headersData = parseHttpHeaders(
        fetchResult.headers || {},
        fetchResult.statusCode || 0,
        fetchResult.responseTime
      );
      console.log('Headers parsed. Security Score:', headersData.securityAnalysis.score, 'Performance Score:', headersData.performanceAnalysis.score);

      // Get status code information
      const statusInfo = getStatusCodeInfo(fetchResult.statusCode || 0);

      // Prepare results
      const results = {
        url: validatedUrl,
        finalUrl: fetchResult.finalUrl,
        statusCode: fetchResult.statusCode,
        statusInfo,
        responseTime: fetchResult.responseTime,
        headers: headersData,
        securityScore: headersData.securityAnalysis.score,
        securityGrade: headersData.securityAnalysis.grade,
        performanceScore: headersData.performanceAnalysis.score,
        totalHeaders: headersData.totalHeaders,
      };

      console.log('Storing fresh HTTP headers analysis results for analysis ID:', analysisId);

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

      // Store detailed headers data
      if (Object.keys(headersData.rawHeaders).length > 0) {
        console.log('Storing', Object.keys(headersData.rawHeaders).length, 'headers to database...');
        const headersToInsert = Object.entries(headersData.rawHeaders).map(([name, value]) => ({
          analysisId,
          headerName: name,
          headerValue: value,
        }));

        // Insert in batches to avoid query size limits
        const batchSize = 50;
        for (let i = 0; i < headersToInsert.length; i += batchSize) {
          const batch = headersToInsert.slice(i, i + batchSize);
          await db.insert(httpHeadersTable).values(batch);
        }
        console.log('Headers stored successfully in database');
      }

      console.log('HTTP headers analysis completed successfully!');
      console.log('Final results - Security Score:', results.securityScore, 'Grade:', results.securityGrade, 'Performance Score:', results.performanceScore, 'Processing Time:', Date.now() - startTime + 'ms');

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
      console.error('HTTP headers analysis failed:', error);

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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    tool: 'HTTP Headers Checker',
    description: 'Analyze HTTP response headers for security and performance',
    methods: ['POST'],
    rateLimit: '20 requests per minute',
    parameters: {
      url: 'string (required) - URL to analyze'
    },
    example: {
      url: 'https://example.com'
    }
  });
}
