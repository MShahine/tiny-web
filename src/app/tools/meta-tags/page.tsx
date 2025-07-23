'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAnalytics } from '@/hooks/useAnalytics';

interface MetaTagsResult {
  success: boolean;
  data?: {
    url: string;
    finalUrl?: string;
    statusCode?: number;
    responseTime?: number;
    seoScore: number;
    totalTags: number;
    metaTags: {
      title?: string;
      description?: string;
      keywords?: string;
      author?: string;
      robots?: string;
      canonical?: string;
      viewport?: string;
      charset?: string;
      language?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      twitterCard?: string;
      twitterTitle?: string;
      twitterDescription?: string;
      allTags: Array<{
        name?: string;
        property?: string;
        content?: string;
        httpEquiv?: string;
        charset?: string;
      }>;
      seoAnalysis: {
        score: number;
        issues: string[];
        recommendations: string[];
        passed: string[];
      };
      duplicateTags: string[];
    };
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

export default function MetaTagsChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MetaTagsResult | null>(null);
  const searchParams = useSearchParams();
  const analytics = useAnalytics();

  // Auto-populate URL from query parameter
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrl(urlParam);
      // Auto-analyze if URL is provided
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }, 100);
    }
  }, [searchParams]);

  const analyzeUrl = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    // Track tool start
    analytics.trackToolStart('meta-tags', url.trim());

    try {
      const response = await fetch('/api/tools/meta-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      setResult(data);

      // Track successful completion
      if (data.success) {
        analytics.trackToolComplete('meta-tags', url.trim(), {
          seoScore: data.data?.seoScore,
          totalTags: data.data?.totalTags,
          responseTime: data.data?.responseTime,
          statusCode: data.data?.statusCode
        });
      } else {
        analytics.trackToolError('meta-tags', url.trim(), data.error || 'Analysis failed');
      }
    } catch (error) {
      // Track error
      analytics.trackToolError('meta-tags', url.trim(), error instanceof Error ? error.message : 'Network error');
      
      setResult({
        success: false,
        error: 'Network error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeUrl();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700 mr-4">
              ← Back to Tools
            </Link>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold">
              MT
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Meta Tags Checker & SEO Analyzer
          </h1>
          <p className="text-muted-foreground">
            Analyze all meta tags, get SEO recommendations, and improve your search rankings
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
                Website URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Analyze Meta Tags'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {result.success ? (
              <>
                {/* SEO Score Overview */}
                <div className="bg-card rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">SEO Analysis</h2>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        {result.data?.totalTags} meta tags found
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Response: {result.data?.responseTime}ms
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Score Circle */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            stroke={result.data!.seoScore >= 80 ? '#10b981' : result.data!.seoScore >= 60 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(result.data!.seoScore / 100) * 314} 314`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-3xl font-bold text-gray-900">
                            {result.data?.seoScore}
                          </span>
                          <span className="text-sm text-muted-foreground">SEO Score</span>
                        </div>
                      </div>
                    </div>

                    {/* Score Details */}
                    <div className="space-y-4">
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.data!.seoScore)}`}>
                        {getScoreLabel(result.data!.seoScore)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-green-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          {result.data?.metaTags.seoAnalysis.passed.length} checks passed
                        </div>
                        <div className="flex items-center text-red-600">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                          {result.data?.metaTags.seoAnalysis.issues.length} issues found
                        </div>
                        <div className="flex items-center text-blue-600">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {result.data?.metaTags.seoAnalysis.recommendations.length} recommendations
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issues and Recommendations */}
                {(result.data?.metaTags.seoAnalysis.issues.length! > 0 || result.data?.metaTags.seoAnalysis.recommendations.length! > 0) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Issues */}
                    {result.data?.metaTags.seoAnalysis.issues.length! > 0 && (
                      <div className="bg-card rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                          <span className="w-5 h-5 bg-red-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">!</span>
                          Issues Found
                        </h3>
                        <ul className="space-y-2">
                          {result.data?.metaTags.seoAnalysis.issues.map((issue, index) => (
                            <li key={index} className="text-sm text-foreground flex items-start">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {result.data?.metaTags.seoAnalysis.recommendations.length! > 0 && (
                      <div className="bg-card rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
                          <span className="w-5 h-5 bg-blue-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">💡</span>
                          Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {result.data?.metaTags.seoAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-foreground flex items-start">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Key Meta Tags */}
                <div className="bg-card rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Key Meta Tags</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Title</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {result.data?.metaTags.title || 'Not found'}
                        </p>
                        {result.data?.metaTags.title && (
                          <p className="text-xs text-gray-500 mt-1">
                            {result.data.metaTags.title.length} characters
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {result.data?.metaTags.description || 'Not found'}
                        </p>
                        {result.data?.metaTags.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {result.data.metaTags.description.length} characters
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Canonical URL</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded break-all">
                          {result.data?.metaTags.canonical || 'Not found'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Viewport</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {result.data?.metaTags.viewport || 'Not found'}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Robots</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {result.data?.metaTags.robots || 'Not specified'}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Language</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {result.data?.metaTags.language || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* All Meta Tags */}
                <div className="bg-card rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    All Meta Tags ({result.data?.metaTags.allTags.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium text-foreground">Type</th>
                          <th className="text-left py-2 px-3 font-medium text-foreground">Attribute</th>
                          <th className="text-left py-2 px-3 font-medium text-foreground">Content</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.data?.metaTags.allTags.map((tag, index) => (
                          <tr key={index} className="border-b border-border hover:bg-muted/50">
                            <td className="py-2 px-3 text-muted-foreground">
                              {tag.name ? 'name' : tag.property ? 'property' : tag.httpEquiv ? 'http-equiv' : 'other'}
                            </td>
                            <td className="py-2 px-3 font-mono text-blue-600">
                              {tag.name || tag.property || tag.httpEquiv || tag.charset || 'N/A'}
                            </td>
                            <td className="py-2 px-3 text-foreground max-w-md truncate">
                              {tag.content || tag.charset || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-red-800 font-medium">Analysis Failed</span>
                </div>
                <p className="text-red-600 mt-2">{result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-medium text-purple-900 mb-2">How it works</h3>
          <ul className="text-purple-800 text-sm space-y-1">
            <li>• Analyzes all meta tags including title, description, Open Graph, and Twitter Cards</li>
            <li>• Provides SEO score based on best practices and recommendations</li>
            <li>• Detects missing, duplicate, or poorly optimized meta tags</li>
            <li>• Checks character limits and provides actionable suggestions</li>
            <li>• Rate limited to 15 requests per minute</li>
          </ul>
        </div>
      </div>
    </div>
  );
}