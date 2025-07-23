/**
 * Sitemap Finder & Checker Tool API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, analysisResultsTable, usersTable } from '@/db';
import { eq, and } from 'drizzle-orm';
import { validateUrl, createUrlHash } from '@/lib/security';
import { fetchUrl } from '@/lib/http-client';
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
    const rateLimitResult = await checkRateLimit(identifier, 'sitemap-finder');
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
          console.log('User insert result:', JSON.stringify(result, null, 2));
        }
      }
    } catch (error) {
      console.error('User creation failed:', error);
      // Continue without user ID
    }

    // Check for existing analysis record first
    console.log('Checking for existing sitemap analysis...');
    const existingAnalysis = await db
      .select()
      .from(analysisResultsTable)
      .where(
        and(
          eq(analysisResultsTable.toolType, 'sitemap-finder'),
          eq(analysisResultsTable.urlHash, urlHash)
        )
      )
      .limit(1);

    let analysisId: number;
    
    if (existingAnalysis.length > 0) {
      // Use existing record
      analysisId = existingAnalysis[0].id;
      console.log('Found existing sitemap analysis with ID:', analysisId);
      
      // Reset status to pending for re-analysis
      await db.update(analysisResultsTable)
        .set({
          status: 'pending',
          updatedAt: new Date(),
          errorMessage: null,
        })
        .where(eq(analysisResultsTable.id, analysisId));
    } else {
      // Create new record
      console.log('Creating new sitemap analysis record...');
      const analysisRecord = await db.insert(analysisResultsTable).values({
        userId,
        toolType: 'sitemap-finder',
        targetUrl: validatedUrl,
        urlHash,
        status: 'pending',
      });
      
      // @ts-ignore - Drizzle MySQL insertId access
      if (analysisRecord.insertId) {
        // @ts-ignore
        analysisId = Number(analysisRecord.insertId);
      } else {
        console.error('Could not find insertId in result:', analysisRecord);
        console.error('Result keys:', Object.keys(analysisRecord));
        // Fallback: try to continue without proper ID tracking
        analysisId = Date.now(); // Use timestamp as fallback ID
        console.warn('Using timestamp as fallback analysisId:', analysisId);
      }
      console.log('Created new sitemap analysis with ID:', analysisId);
    }

    console.log('Starting sitemap analysis for:', validatedUrl);
    const startTime = Date.now();

    try {
      // Find and analyze sitemaps
      const sitemapResults = await findAndAnalyzeSitemaps(validatedUrl);

      // Prepare results
      const results = {
        url: validatedUrl,
        sitemaps: sitemapResults.sitemaps,
        summary: sitemapResults.summary,
        issues: sitemapResults.issues,
        recommendations: sitemapResults.recommendations,
        totalUrls: sitemapResults.totalUrls,
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

      console.log('Sitemap analysis completed successfully!');

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
      console.error('Sitemap analysis failed:', error);
      
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
        error: 'Sitemap analysis failed',
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
    tool: 'Sitemap Finder & Checker',
    description: 'Find and analyze XML sitemaps for SEO optimization',
    methods: ['POST'],
    rateLimit: '5 requests per minute',
    parameters: {
      url: 'string (required) - Website URL to analyze'
    },
    example: {
      url: 'https://example.com'
    }
  });
}

// Helper function to find and analyze sitemaps
async function findAndAnalyzeSitemaps(baseUrl: string) {
  const results = {
    sitemaps: [] as any[],
    summary: {
      found: 0,
      accessible: 0,
      totalUrls: 0,
      lastModified: null as string | null,
    },
    issues: [] as string[],
    recommendations: [] as string[],
    totalUrls: 0,
  };

  try {
    const domain = new URL(baseUrl);
    const baseUrlClean = `${domain.protocol}//${domain.hostname}`;

    // Common sitemap locations to check
    const sitemapLocations = [
      `${baseUrlClean}/sitemap.xml`,
      `${baseUrlClean}/sitemap_index.xml`,
      `${baseUrlClean}/sitemaps.xml`,
      `${baseUrlClean}/sitemap1.xml`,
      `${baseUrlClean}/wp-sitemap.xml`, // WordPress
      `${baseUrlClean}/sitemap-index.xml`,
    ];

    // Check robots.txt for sitemap references
    try {
      const robotsUrl = `${baseUrlClean}/robots.txt`;
      const robotsResult = await fetchUrl(robotsUrl, { timeout: 10000, maxSize: 50 * 1024 });
      
      if (robotsResult.success && robotsResult.data) {
        const sitemapMatches = robotsResult.data.match(/Sitemap:\s*(https?:\/\/[^\s]+)/gi);
        if (sitemapMatches) {
          sitemapMatches.forEach(match => {
            const sitemapUrl = match.replace(/Sitemap:\s*/i, '').trim();
            if (!sitemapLocations.includes(sitemapUrl)) {
              sitemapLocations.push(sitemapUrl);
            }
          });
        }
      }
    } catch (error) {
      console.log('Could not fetch robots.txt:', error);
    }

    // Check each potential sitemap location
    for (const sitemapUrl of sitemapLocations) {
      try {
        console.log('Checking sitemap:', sitemapUrl);
        const sitemapResult = await fetchUrl(sitemapUrl, { 
          timeout: 15000, 
          maxSize: 10 * 1024 * 1024 // 10MB for large sitemaps
        });

        if (sitemapResult.success && sitemapResult.data) {
          const analysis = await analyzeSitemapXML(sitemapUrl, sitemapResult.data);
          if (analysis) {
            results.sitemaps.push(analysis);
            results.summary.found++;
            results.summary.accessible++;
            results.totalUrls += analysis.urlCount;
            
            if (analysis.lastModified && (!results.summary.lastModified || analysis.lastModified > results.summary.lastModified)) {
              results.summary.lastModified = analysis.lastModified;
            }
          }
        }
      } catch (error) {
        console.log(`Failed to fetch sitemap ${sitemapUrl}:`, error);
      }
    }

    // Generate insights and recommendations
    if (results.sitemaps.length === 0) {
      results.issues.push('No sitemaps found');
      results.recommendations.push('Create an XML sitemap to help search engines discover your content');
      results.recommendations.push('Add sitemap reference to robots.txt file');
    } else {
      results.recommendations.push('Sitemaps found and accessible');
      
      if (results.totalUrls > 50000) {
        results.issues.push('Sitemap contains more than 50,000 URLs');
        results.recommendations.push('Consider splitting large sitemaps into multiple files');
      }
      
      if (!results.summary.lastModified) {
        results.issues.push('No lastmod dates found in sitemaps');
        results.recommendations.push('Add <lastmod> tags to help search engines understand content freshness');
      }
    }

    results.summary.totalUrls = results.totalUrls;

  } catch (error) {
    console.error('Error in sitemap analysis:', error);
    results.issues.push('Error occurred during sitemap analysis');
  }

  return results;
}

// Helper function to analyze sitemap XML content
async function analyzeSitemapXML(sitemapUrl: string, xmlContent: string) {
  try {
    // Basic XML validation
    if (!xmlContent.includes('<urlset') && !xmlContent.includes('<sitemapindex')) {
      return null;
    }

    const analysis = {
      url: sitemapUrl,
      type: xmlContent.includes('<sitemapindex') ? 'index' : 'urlset',
      urlCount: 0,
      lastModified: null as string | null,
      size: xmlContent.length,
      issues: [] as string[],
      status: 'valid',
      urls: [] as Array<{
        loc: string;
        lastmod?: string;
        changefreq?: string;
        priority?: string;
      }>,
    };

    // Extract URLs from urlset
    if (analysis.type === 'urlset') {
      const urlRegex = /<url>([\s\S]*?)<\/url>/g;
      let urlMatch;
      
      while ((urlMatch = urlRegex.exec(xmlContent)) !== null) {
        const urlBlock = urlMatch[1];
        
        const locMatch = urlBlock.match(/<loc>([^<]+)<\/loc>/);
        const lastmodMatch = urlBlock.match(/<lastmod>([^<]+)<\/lastmod>/);
        const changefreqMatch = urlBlock.match(/<changefreq>([^<]+)<\/changefreq>/);
        const priorityMatch = urlBlock.match(/<priority>([^<]+)<\/priority>/);
        
        if (locMatch) {
          analysis.urls.push({
            loc: locMatch[1],
            lastmod: lastmodMatch ? lastmodMatch[1] : undefined,
            changefreq: changefreqMatch ? changefreqMatch[1] : undefined,
            priority: priorityMatch ? priorityMatch[1] : undefined,
          });
        }
      }
    }
    
    // Extract sitemap URLs from sitemap index
    if (analysis.type === 'index') {
      const sitemapRegex = /<sitemap>([\s\S]*?)<\/sitemap>/g;
      let sitemapMatch;
      
      while ((sitemapMatch = sitemapRegex.exec(xmlContent)) !== null) {
        const sitemapBlock = sitemapMatch[1];
        
        const locMatch = sitemapBlock.match(/<loc>([^<]+)<\/loc>/);
        const lastmodMatch = sitemapBlock.match(/<lastmod>([^<]+)<\/lastmod>/);
        
        if (locMatch) {
          analysis.urls.push({
            loc: locMatch[1],
            lastmod: lastmodMatch ? lastmodMatch[1] : undefined,
          });
        }
      }
    }

    analysis.urlCount = analysis.urls.length;

    // Extract last modified date from first URL if not found globally
    const lastmodMatch = xmlContent.match(/<lastmod>([^<]+)<\/lastmod>/);
    if (lastmodMatch) {
      analysis.lastModified = lastmodMatch[1];
    }

    // Check for common issues
    if (analysis.size > 50 * 1024 * 1024) { // 50MB
      analysis.issues.push('Sitemap file is very large');
    }

    if (analysis.urlCount > 50000) {
      analysis.issues.push('Contains more than 50,000 URLs');
    }

    if (!xmlContent.includes('<?xml')) {
      analysis.issues.push('Missing XML declaration');
    }

    // Limit URLs to prevent memory issues (show first 1000)
    if (analysis.urls.length > 1000) {
      analysis.urls = analysis.urls.slice(0, 1000);
      analysis.issues.push(`Showing first 1000 URLs out of ${analysis.urlCount} total`);
    }

    return analysis;

  } catch (error) {
    console.error('Error analyzing sitemap XML:', error);
    return null;
  }
}