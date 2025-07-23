/**
 * Robots.txt Tester Tool API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, analysisResultsTable, usersTable } from '@/db';
import { eq, and } from 'drizzle-orm';
import { validateUrl, createUrlHash } from '@/lib/security';
import { fetchUrl } from '@/lib/http-client';
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { url, testUrl } = await request.json();

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
    const rateLimitResult = await checkRateLimit(identifier, 'robots-txt-tester');
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
        } else {
          console.warn('Could not get user ID, continuing without userId');
        }
      }
    } catch (error) {
      console.error('User creation failed:', error);
    }

    // Check for existing analysis record
    console.log('Checking for existing robots.txt analysis...');
    const existingAnalysis = await db
      .select()
      .from(analysisResultsTable)
      .where(
        and(
          eq(analysisResultsTable.toolType, 'robots-txt-tester'),
          eq(analysisResultsTable.urlHash, urlHash)
        )
      )
      .limit(1);

    let analysisId: number;
    
    if (existingAnalysis.length > 0) {
      analysisId = existingAnalysis[0].id;
      console.log('Found existing robots.txt analysis with ID:', analysisId);
      
      // Reset status for re-analysis
      await db.update(analysisResultsTable)
        .set({
          status: 'pending',
          updatedAt: new Date(),
          errorMessage: null,
        })
        .where(eq(analysisResultsTable.id, analysisId));
    } else {
      console.log('Creating new robots.txt analysis record...');
      const analysisRecord = await db.insert(analysisResultsTable).values({
        userId,
        toolType: 'robots-txt-tester',
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
        analysisId = Date.now(); // Fallback
        console.warn('Using timestamp as fallback analysisId:', analysisId);
      }
      console.log('Created new robots.txt analysis with ID:', analysisId);
    }

    console.log('Starting robots.txt analysis for:', validatedUrl);
    const startTime = Date.now();

    try {
      // Analyze robots.txt
      const robotsResults = await analyzeRobotsTxt(validatedUrl, testUrl);

      // Prepare results
      const results = {
        url: validatedUrl,
        robotsTxtUrl: robotsResults.robotsTxtUrl,
        exists: robotsResults.exists,
        content: robotsResults.content,
        rules: robotsResults.rules,
        sitemaps: robotsResults.sitemaps,
        issues: robotsResults.issues,
        recommendations: robotsResults.recommendations,
        testResult: robotsResults.testResult,
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

      console.log('Robots.txt analysis completed successfully!');

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
      console.error('Robots.txt analysis failed:', error);
      
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
        error: 'Robots.txt analysis failed',
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
    tool: 'Robots.txt Tester',
    description: 'Analyze robots.txt files and test URL accessibility for search engines',
    methods: ['POST'],
    rateLimit: '10 requests per minute',
    parameters: {
      url: 'string (required) - Website URL to analyze',
      testUrl: 'string (optional) - Specific URL to test against robots.txt rules'
    },
    example: {
      url: 'https://example.com',
      testUrl: 'https://example.com/admin'
    }
  });
}

// Helper function to analyze robots.txt
async function analyzeRobotsTxt(baseUrl: string, testUrl?: string) {
  const results = {
    robotsTxtUrl: '',
    exists: false,
    content: '',
    rules: [] as Array<{
      userAgent: string;
      directives: Array<{
        directive: string;
        value: string;
        line: number;
      }>;
    }>,
    sitemaps: [] as string[],
    issues: [] as string[],
    recommendations: [] as string[],
    testResult: null as {
      url: string;
      allowed: boolean;
      userAgent: string;
      matchedRule?: string;
      reason: string;
    } | null,
  };

  try {
    const domain = new URL(baseUrl);
    const robotsTxtUrl = `${domain.protocol}//${domain.hostname}/robots.txt`;
    results.robotsTxtUrl = robotsTxtUrl;

    console.log('Fetching robots.txt from:', robotsTxtUrl);
    
    // Fetch robots.txt
    const robotsResult = await fetchUrl(robotsTxtUrl, { 
      timeout: 10000, 
      maxSize: 100 * 1024 // 100KB should be more than enough
    });

    if (robotsResult.success && robotsResult.data) {
      results.exists = true;
      results.content = robotsResult.data;
      
      // Parse robots.txt content
      const parseResults = parseRobotsTxt(robotsResult.data);
      results.rules = parseResults.rules;
      results.sitemaps = parseResults.sitemaps;
      results.issues = parseResults.issues;
      results.recommendations = parseResults.recommendations;

      // Test specific URL if provided
      if (testUrl) {
        results.testResult = testUrlAgainstRobots(testUrl, results.rules, 'Googlebot');
      }

    } else {
      results.exists = false;
      results.issues.push('robots.txt file not found');
      results.recommendations.push('Consider creating a robots.txt file to guide search engine crawlers');
      
      if (testUrl) {
        results.testResult = {
          url: testUrl,
          allowed: true,
          userAgent: 'Googlebot',
          reason: 'No robots.txt file found - all URLs are allowed by default'
        };
      }
    }

    // General recommendations
    if (results.exists) {
      if (results.sitemaps.length === 0) {
        results.recommendations.push('Add sitemap references to help search engines discover your content');
      }
      
      if (results.rules.length === 0) {
        results.recommendations.push('robots.txt exists but contains no rules');
      }
      
      // Check for common issues
      const hasWildcardUserAgent = results.rules.some(rule => rule.userAgent === '*');
      if (!hasWildcardUserAgent && results.rules.length > 0) {
        results.recommendations.push('Consider adding rules for User-agent: * to cover all crawlers');
      }
    }

  } catch (error) {
    console.error('Error in robots.txt analysis:', error);
    results.issues.push('Error occurred during robots.txt analysis');
  }

  return results;
}

// Helper function to parse robots.txt content
function parseRobotsTxt(content: string) {
  const lines = content.split('\n');
  const rules: Array<{
    userAgent: string;
    directives: Array<{
      directive: string;
      value: string;
      line: number;
    }>;
  }> = [];
  const sitemaps: string[] = [];
  const issues: string[] = [];
  const recommendations: string[] = [];

  let currentUserAgent = '';
  let currentRuleIndex = -1;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const lineNumber = index + 1;

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    // Parse directive
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) {
      issues.push(`Line ${lineNumber}: Invalid syntax - missing colon`);
      return;
    }

    const directive = trimmedLine.substring(0, colonIndex).trim().toLowerCase();
    const value = trimmedLine.substring(colonIndex + 1).trim();

    if (directive === 'user-agent') {
      // Start new user-agent block
      currentUserAgent = value;
      currentRuleIndex = rules.findIndex(rule => rule.userAgent === value);
      
      if (currentRuleIndex === -1) {
        rules.push({
          userAgent: value,
          directives: []
        });
        currentRuleIndex = rules.length - 1;
      }
    } else if (directive === 'sitemap') {
      // Add sitemap
      if (value) {
        sitemaps.push(value);
      }
    } else if (['allow', 'disallow', 'crawl-delay'].includes(directive)) {
      // Add directive to current user-agent
      if (currentRuleIndex >= 0) {
        rules[currentRuleIndex].directives.push({
          directive,
          value,
          line: lineNumber
        });
      } else {
        issues.push(`Line ${lineNumber}: ${directive} directive without User-agent`);
      }
    } else {
      // Unknown directive
      issues.push(`Line ${lineNumber}: Unknown directive '${directive}'`);
    }
  });

  return { rules, sitemaps, issues, recommendations };
}

// Helper function to test URL against robots.txt rules
function testUrlAgainstRobots(
  testUrl: string, 
  rules: Array<{
    userAgent: string;
    directives: Array<{
      directive: string;
      value: string;
      line: number;
    }>;
  }>, 
  userAgent: string = 'Googlebot'
) {
  try {
    const url = new URL(testUrl);
    const path = url.pathname + url.search;

    // Find applicable rules for the user agent
    const applicableRules = rules.filter(rule => 
      rule.userAgent === '*' || 
      rule.userAgent.toLowerCase() === userAgent.toLowerCase()
    );

    // Sort by specificity (specific user-agent first, then *)
    applicableRules.sort((a, b) => {
      if (a.userAgent === '*' && b.userAgent !== '*') return 1;
      if (a.userAgent !== '*' && b.userAgent === '*') return -1;
      return 0;
    });

    let allowed = true;
    let matchedRule = '';
    let reason = 'No matching rules found - allowed by default';

    // Check each rule
    for (const rule of applicableRules) {
      for (const directive of rule.directives) {
        if (directive.directive === 'disallow' || directive.directive === 'allow') {
          const pattern = directive.value;
          
          // Convert robots.txt pattern to regex
          if (pathMatches(path, pattern)) {
            allowed = directive.directive === 'allow';
            matchedRule = `${directive.directive.toUpperCase()}: ${pattern}`;
            reason = `Matched rule: ${matchedRule} (User-agent: ${rule.userAgent})`;
            
            // More specific rules (longer patterns) take precedence
            break;
          }
        }
      }
    }

    return {
      url: testUrl,
      allowed,
      userAgent,
      matchedRule: matchedRule || undefined,
      reason
    };

  } catch (error) {
    return {
      url: testUrl,
      allowed: false,
      userAgent,
      reason: 'Invalid URL format'
    };
  }
}

// Helper function to check if path matches robots.txt pattern
function pathMatches(path: string, pattern: string): boolean {
  if (!pattern) return false;
  
  // Empty pattern matches nothing
  if (pattern === '') return path === '';
  
  // Convert robots.txt wildcards to regex
  const regexPattern = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
    .replace(/\\\*/g, '.*') // Convert * to .*
    .replace(/\\\$/g, '$'); // Convert $ to end anchor
  
  // Add start anchor if pattern doesn't start with *
  const finalPattern = pattern.startsWith('*') ? regexPattern : '^' + regexPattern;
  
  try {
    const regex = new RegExp(finalPattern);
    return regex.test(path);
  } catch {
    // If regex is invalid, fall back to simple string matching
    return path.startsWith(pattern);
  }
}