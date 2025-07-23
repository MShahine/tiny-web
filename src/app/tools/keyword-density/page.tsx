'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAnalytics } from '@/hooks/useAnalytics';
import ExportButton from '@/components/ui/ExportButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface KeywordData {
  keyword: string;
  frequency: number;
  density: number;
  tfIdfScore: number;
  keywordType: 'single' | 'phrase' | 'long_tail';
  positions: string[];
  isStopWord: boolean;
  stemmedForm: string;
}

interface KeywordSuggestion {
  originalKeyword: string;
  suggestedKeyword: string;
  suggestionType: 'related' | 'semantic' | 'long_tail' | 'lsi';
  relevanceScore: number;
  searchVolume?: number;
  competition?: 'low' | 'medium' | 'high';
}

interface KeywordResult {
  success: boolean;
  data?: {
    url: string;
    totalWords: number;
    uniqueWords: number;
    readingTime: number;
    keywords: KeywordData[];
    suggestions: KeywordSuggestion[];
    seoAnalysis: {
      score: number;
      issues: Array<{
        type: 'error' | 'warning' | 'info';
        issue: string;
        description: string;
        recommendation: string;
      }>;
      recommendations: string[];
    };
    contentStructure: {
      title?: string;
      metaDescription?: string;
      h1Tags: string[];
      h2Tags: string[];
      h3Tags: string[];
      paragraphs: number;
      images: number;
      links: number;
    };
    targetKeyword?: string;
    processingTime: number;
    lastChecked: string;
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

function KeywordDensityAnalyzerContent() {
  const [url, setUrl] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [result, setResult] = useState<KeywordResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'single' | 'phrase' | 'long_tail'>('all');
  const [sortBy, setSortBy] = useState<'density' | 'frequency' | 'tfIdf'>('density');
  const [showStopWords, setShowStopWords] = useState(false);

  const searchParams = useSearchParams();
  const { trackToolStart, trackToolComplete, trackToolError } = useAnalytics();

  useEffect(() => {
    const urlParam = searchParams.get('url');
    const keywordParam = searchParams.get('keyword');
    if (urlParam) {
      setUrl(urlParam);
      if (keywordParam) {
        setTargetKeyword(keywordParam);
      }
    }
  }, [searchParams]);

  const analyzeKeywords = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    trackToolStart('keyword-density', url);

    try {
      const response = await fetch('/api/tools/keyword-density', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          targetKeyword: targetKeyword.trim() || undefined,
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        trackToolComplete('keyword-density', url, {
          totalWords: data.data.totalWords,
          uniqueWords: data.data.uniqueWords,
          seoScore: data.data.seoAnalysis.score,
          keywordCount: data.data.keywords.length,
          cached: data.cached
        });
      } else {
        trackToolError('keyword-density', url, data.error || 'Analysis failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setResult({
        success: false,
        error: errorMessage
      });
      trackToolError('keyword-density', url, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeKeywords();
  };

  const getFilteredKeywords = () => {
    if (!result?.data?.keywords) return [];
    
    let filtered = result.data.keywords;
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(k => k.keywordType === filterType);
    }
    
    // Filter stop words
    if (!showStopWords) {
      filtered = filtered.filter(k => !k.isStopWord);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.frequency - a.frequency;
        case 'tfIdf':
          return b.tfIdfScore - a.tfIdfScore;
        default:
          return b.density - a.density;
      }
    });
    
    return filtered;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDensityColor = (density: number) => {
    if (density > 3) return 'text-red-600';
    if (density >= 1) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Keyword Density Analyzer</h1>
        <p className="text-lg text-gray-600 mb-6">
          Analyze keyword frequency, density, and get SEO recommendations for better content optimization.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="targetKeyword" className="block text-sm font-medium text-gray-700 mb-2">
                Target Keyword (Optional)
              </label>
              <input
                type="text"
                id="targetKeyword"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="SEO optimization"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing Keywords...' : 'Analyze Keywords'}
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-6">
          {result.success && result.data ? (
            <>
              {/* Header with Export */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Analysis Results</h2>
                <ExportButton
                  data={result.data}
                  filename={`keyword-density-${new URL(result.data.url).hostname}`}
                  onExport={(format) => {
                    trackExport('keyword-density', format);
                  }}
                />
              </div>

              {result.cached && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    📋 Showing cached results from {new Date(result.analyzedAt!).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-semibold mb-2">SEO Score</h3>
                  <p className={`text-3xl font-bold ${getScoreColor(result.data.seoAnalysis.score)}`}>
                    {result.data.seoAnalysis.score}/100
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-semibold mb-2">Total Words</h3>
                  <p className="text-3xl font-bold text-blue-600">{result.data.totalWords.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{result.data.readingTime} min read</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-semibold mb-2">Unique Words</h3>
                  <p className="text-3xl font-bold text-green-600">{result.data.uniqueWords.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    {Math.round((result.data.uniqueWords / result.data.totalWords) * 100)}% diversity
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-semibold mb-2">Keywords Found</h3>
                  <p className="text-3xl font-bold text-purple-600">{result.data.keywords.length}</p>
                  <p className="text-sm text-gray-600">
                    {result.data.keywords.filter(k => !k.isStopWord).length} meaningful
                  </p>
                </div>
              </div>

              {/* Content Structure */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-xl font-semibold mb-4">Content Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium">Title</p>
                    <p className="text-sm text-gray-600 truncate">
                      {result.data.contentStructure.title || 'No title found'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">H1 Tags: {result.data.contentStructure.h1Tags.length}</p>
                    <p className="text-sm text-gray-600">
                      {result.data.contentStructure.h1Tags.slice(0, 2).join(', ')}
                      {result.data.contentStructure.h1Tags.length > 2 && '...'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">H2 Tags: {result.data.contentStructure.h2Tags.length}</p>
                  </div>
                  <div>
                    <p className="font-medium">Paragraphs: {result.data.contentStructure.paragraphs}</p>
                  </div>
                  <div>
                    <p className="font-medium">Images: {result.data.contentStructure.images}</p>
                  </div>
                  <div>
                    <p className="font-medium">Links: {result.data.contentStructure.links}</p>
                  </div>
                </div>
              </div>

              {/* SEO Issues */}
              {result.data.seoAnalysis.issues.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-xl font-semibold mb-4">SEO Issues</h3>
                  <div className="space-y-3">
                    {result.data.seoAnalysis.issues.map((issue, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        issue.type === 'error' ? 'bg-red-50 border-red-400' :
                        issue.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-blue-50 border-blue-400'
                      }`}>
                        <h4 className="font-semibold">{issue.issue}</h4>
                        <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                        <p className="text-sm font-medium">💡 {issue.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyword Analysis */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h3 className="text-xl font-semibold mb-4 md:mb-0">Keyword Analysis</h3>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="single">Single Words</option>
                      <option value="phrase">Phrases</option>
                      <option value="long_tail">Long-tail</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="density">Sort by Density</option>
                      <option value="frequency">Sort by Frequency</option>
                      <option value="tfIdf">Sort by TF-IDF</option>
                    </select>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={showStopWords}
                        onChange={(e) => setShowStopWords(e.target.checked)}
                        className="mr-2"
                      />
                      Show stop words
                    </label>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Keyword</th>
                        <th className="text-left py-2">Type</th>
                        <th className="text-right py-2">Frequency</th>
                        <th className="text-right py-2">Density</th>
                        <th className="text-right py-2">TF-IDF</th>
                        <th className="text-left py-2">Positions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredKeywords().slice(0, 50).map((keyword, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-2 font-medium">
                            {keyword.keyword}
                            {keyword.isStopWord && (
                              <span className="ml-2 text-xs bg-gray-200 px-1 rounded">stop</span>
                            )}
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              keyword.keywordType === 'single' ? 'bg-blue-100 text-blue-800' :
                              keyword.keywordType === 'phrase' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {keyword.keywordType}
                            </span>
                          </td>
                          <td className="py-2 text-right">{keyword.frequency}</td>
                          <td className={`py-2 text-right font-medium ${getDensityColor(keyword.density)}`}>
                            {keyword.density.toFixed(2)}%
                          </td>
                          <td className="py-2 text-right">{keyword.tfIdfScore.toFixed(3)}</td>
                          <td className="py-2">
                            <div className="flex flex-wrap gap-1">
                              {keyword.positions.map((pos, i) => (
                                <span key={i} className="text-xs bg-gray-100 px-1 rounded">
                                  {pos}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Keyword Suggestions */}
              {result.data.suggestions.length > 0 && (
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="bg-white p-6 rounded-lg shadow border hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Keyword Suggestions ({result.data.suggestions.length})</h3>
                        <span className="text-gray-400">▼</span>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="bg-white p-6 rounded-lg shadow border mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.data.suggestions.slice(0, 20).map((suggestion, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{suggestion.suggestedKeyword}</h4>
                              <span className="text-sm text-gray-600">{suggestion.relevanceScore}%</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Based on: {suggestion.originalKeyword}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              suggestion.suggestionType === 'long_tail' ? 'bg-purple-100 text-purple-800' :
                              suggestion.suggestionType === 'related' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {suggestion.suggestionType}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Recommendations */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-xl font-semibold mb-4">SEO Recommendations</h3>
                <ul className="space-y-2">
                  {result.data.seoAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Analysis Info */}
              <div className="text-sm text-gray-600 text-center">
                Analysis completed in {result.data.processingTime}ms • 
                Last checked: {new Date(result.data.lastChecked).toLocaleString()}
              </div>
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h3>
              <p className="text-red-700">{result.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Tool Description */}
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">About Keyword Density Analyzer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">What it analyzes:</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• Keyword frequency and density</li>
              <li>• Single words, phrases, and long-tail keywords</li>
              <li>• TF-IDF scores for relevance</li>
              <li>• Keyword positions in content</li>
              <li>• Content structure analysis</li>
              <li>• SEO optimization recommendations</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Best practices:</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• Keep keyword density between 1-3%</li>
              <li>• Use keywords naturally in content</li>
              <li>• Include keywords in titles and headings</li>
              <li>• Focus on long-tail keywords</li>
              <li>• Avoid keyword stuffing</li>
              <li>• Create comprehensive, valuable content</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Related SEO Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/tools/meta-tags" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <h4 className="font-semibold">Meta Tags Analyzer</h4>
            <p className="text-sm text-gray-600">Analyze meta tags and SEO elements</p>
          </Link>
          <Link href="/tools/serp-checker" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <h4 className="font-semibold">SERP Checker</h4>
            <p className="text-sm text-gray-600">Check search rankings for keywords</p>
          </Link>
          <Link href="/tools/website-crawl-test" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <h4 className="font-semibold">Website Crawler</h4>
            <p className="text-sm text-gray-600">Comprehensive site analysis</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function KeywordDensityAnalyzer() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <KeywordDensityAnalyzerContent />
    </Suspense>
  );
}