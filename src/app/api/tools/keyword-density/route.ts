import { NextRequest, NextResponse } from 'next/server';
import { analyzeKeywordDensity } from '@/lib/keyword-density-analyzer';
import { db } from '@/db';
import { analysisResultsTable, keywordDensityTable, keywordSuggestionsTable } from '@/db/schema';
import { createHash } from 'crypto';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { url, targetKeyword } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Create URL hash for caching
    const urlHash = createHash('sha256').update(url).digest('hex');

    // Check cache first (24 hour expiration)
    const cacheExpiry = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cachedResult = await db
      .select()
      .from(analysisResultsTable)
      .where(
        and(
          eq(analysisResultsTable.toolType, 'keyword-density'),
          eq(analysisResultsTable.urlHash, urlHash),
          eq(analysisResultsTable.status, 'completed')
        )
      )
      .limit(1);

    if (cachedResult.length > 0 && cachedResult[0].createdAt > cacheExpiry) {
      return NextResponse.json({
        success: true,
        data: cachedResult[0].results,
        cached: true,
        analyzedAt: cachedResult[0].createdAt
      });
    }

    const startTime = Date.now();

    // Fetch the webpage
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'TinyWeb SEO Analyzer Bot/1.0 (+https://tinyweb.dev)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 30000,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const processingTime = Date.now() - startTime;

    // Analyze keyword density
    const analysisResult = await analyzeKeywordDensity(url, html);

    // Add target keyword analysis if provided
    if (targetKeyword) {
      const targetKeywordLower = targetKeyword.toLowerCase();
      const targetKeywordData = analysisResult.keywords.find(
        k => k.keyword.toLowerCase() === targetKeywordLower
      );

      if (targetKeywordData) {
        analysisResult.seoAnalysis.recommendations.unshift(
          `Target keyword "${targetKeyword}" has ${targetKeywordData.density}% density`
        );
      } else {
        analysisResult.seoAnalysis.issues.push({
          type: 'warning',
          issue: 'Target Keyword Not Found',
          description: `Target keyword "${targetKeyword}" was not found in the content`,
          recommendation: 'Add your target keyword naturally to the content'
        });
      }
    }

    // Store results in database
    const [insertResult] = await db
      .insert(analysisResultsTable)
      .values({
        toolType: 'keyword-density',
        targetUrl: url,
        urlHash,
        status: 'completed',
        results: analysisResult,
        processingTimeMs: processingTime,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

    const analysisId = insertResult.insertId;

    // Store detailed keyword data
    if (analysisResult.keywords.length > 0) {
      const keywordData = analysisResult.keywords.map(keyword => ({
        analysisId: Number(analysisId),
        keyword: keyword.keyword,
        frequency: keyword.frequency,
        density: Math.round(keyword.density * 100), // Store as integer (percentage * 100)
        tfIdfScore: Math.round(keyword.tfIdfScore * 1000), // Store as integer (score * 1000)
        keywordType: keyword.keywordType,
        position: keyword.positions.join(','),
        isStopWord: keyword.isStopWord,
        stemmedForm: keyword.stemmedForm,
      }));

      await db.insert(keywordDensityTable).values(keywordData);
    }

    // Store keyword suggestions
    if (analysisResult.suggestions.length > 0) {
      const suggestionData = analysisResult.suggestions.map(suggestion => ({
        analysisId: Number(analysisId),
        originalKeyword: suggestion.originalKeyword,
        suggestedKeyword: suggestion.suggestedKeyword,
        suggestionType: suggestion.suggestionType,
        relevanceScore: suggestion.relevanceScore,
        searchVolume: suggestion.searchVolume || null,
        competition: suggestion.competition || null,
      }));

      await db.insert(keywordSuggestionsTable).values(suggestionData);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...analysisResult,
        targetKeyword,
        processingTime,
        lastChecked: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Keyword density analysis error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      },
      { status: 500 }
    );
  }
}