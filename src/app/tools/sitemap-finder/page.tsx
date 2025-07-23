'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ExportButton from '@/components/ui/ExportButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SitemapResult {
  success: boolean;
  data?: {
    url: string;
    sitemaps: Array<{
      url: string;
      type: 'index' | 'urlset';
      urlCount: number;
      lastModified: string | null;
      size: number;
      issues: string[];
      status: string;
      urls: Array<{
        loc: string;
        lastmod?: string;
        changefreq?: string;
        priority?: string;
      }>;
    }>;
    summary: {
      found: number;
      accessible: number;
      totalUrls: number;
      lastModified: string | null;
    };
    issues: string[];
    recommendations: string[];
    totalUrls: number;
    lastChecked: string;
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

function SitemapFinderContent() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SitemapResult | null>(null);
  const [openSitemaps, setOpenSitemaps] = useState<Set<number>>(new Set());
  const searchParams = useSearchParams();

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

    try {
      const response = await fetch('/api/tools/sitemap-finder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const toggleSitemap = (index: number) => {
    const newOpenSitemaps = new Set(openSitemaps);
    if (newOpenSitemaps.has(index)) {
      newOpenSitemaps.delete(index);
    } else {
      newOpenSitemaps.add(index);
    }
    setOpenSitemaps(newOpenSitemaps);
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
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold">
              SM
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sitemap Finder & Checker
          </h1>
          <p className="text-gray-600">
            Discover and analyze XML sitemaps to optimize your website's search engine visibility
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Find Sitemaps'
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
                {/* Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Sitemap Analysis</h2>
                    <div className="flex items-center space-x-4">
                      <ExportButton
                        data={result.data}
                        filename="sitemap-analysis"
                        toolName="Sitemap Finder"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {result.data?.summary.found || 0}
                      </div>
                      <p className="text-sm text-gray-600">Sitemaps Found</p>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {result.data?.summary.accessible || 0}
                      </div>
                      <p className="text-sm text-gray-600">Accessible</p>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {result.data?.totalUrls || 0}
                      </div>
                      <p className="text-sm text-gray-600">Total URLs</p>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(result.data?.summary.lastModified || '')}
                      </div>
                      <p className="text-sm text-gray-600">Last Modified</p>
                    </div>
                  </div>

                  {/* Issues and Recommendations */}
                  {(result.data?.issues.length! > 0 || result.data?.recommendations.length! > 0) && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Issues */}
                      {result.data?.issues.length! > 0 && (
                        <div>
                          <h4 className="text-md font-semibold text-red-600 mb-3 flex items-center">
                            <span className="w-5 h-5 bg-red-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">!</span>
                            Issues ({result.data?.issues.length})
                          </h4>
                          <ul className="space-y-2">
                            {result.data?.issues.map((issue, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {result.data?.recommendations.length! > 0 && (
                        <div>
                          <h4 className="text-md font-semibold text-blue-600 mb-3 flex items-center">
                            <span className="w-5 h-5 bg-blue-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">💡</span>
                            Recommendations ({result.data?.recommendations.length})
                          </h4>
                          <ul className="space-y-2">
                            {result.data?.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sitemap Details */}
                {result.data?.sitemaps && result.data.sitemaps.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Found Sitemaps ({result.data.sitemaps.length})
                    </h3>

                    <div className="space-y-4">
                      {result.data.sitemaps.map((sitemap, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg">
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 break-all">
                                  {sitemap.url}
                                </h4>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                  <span className={`px-2 py-1 rounded-full text-xs ${sitemap.type === 'index' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {sitemap.type === 'index' ? 'Sitemap Index' : 'URL Set'}
                                  </span>
                                  <span>{sitemap.urlCount} URLs</span>
                                  <span>{formatFileSize(sitemap.size)}</span>
                                  <span>Modified: {formatDate(sitemap.lastModified)}</span>
                                </div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${sitemap.status === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {sitemap.status}
                              </div>
                            </div>

                            {sitemap.issues.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-sm font-medium text-red-600 mb-2">Issues:</h5>
                                <ul className="space-y-1">
                                  {sitemap.issues.map((issue, issueIndex) => (
                                    <li key={issueIndex} className="text-sm text-red-600 flex items-start">
                                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                                      {issue}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* URLs List */}
                            {sitemap.urls && sitemap.urls.length > 0 && (
                              <div className="mt-4">
                                <Collapsible open={openSitemaps.has(index)} onOpenChange={() => toggleSitemap(index)}>
                                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                    <span className="text-sm font-medium text-gray-700">
                                      View URLs ({sitemap.urls.length})
                                    </span>
                                    {openSitemaps.has(index) ? (
                                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    ) : (
                                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    )}
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-3">
                                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                                      <div className="divide-y divide-gray-100">
                                        {sitemap.urls.map((urlItem, urlIndex) => (
                                          <div key={urlIndex} className="p-3 hover:bg-gray-50">
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1 min-w-0">
                                                <a
                                                  href={urlItem.loc}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                                                >
                                                  {urlItem.loc}
                                                </a>
                                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                                  {urlItem.lastmod && (
                                                    <span>Modified: {formatDate(urlItem.lastmod)}</span>
                                                  )}
                                                  {urlItem.changefreq && (
                                                    <span>Frequency: {urlItem.changefreq}</span>
                                                  )}
                                                  {urlItem.priority && (
                                                    <span>Priority: {urlItem.priority}</span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">How it works</h3>
          <ul className="text-green-800 text-sm space-y-1">
            <li>• Checks common sitemap locations (sitemap.xml, sitemap_index.xml, etc.)</li>
            <li>• Analyzes robots.txt file for sitemap references</li>
            <li>• Validates XML structure and counts URLs</li>
            <li>• Identifies potential issues and provides optimization recommendations</li>
            <li>• Supports both regular sitemaps and sitemap index files</li>
            <li>• Rate limited to 5 requests per minute</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function SitemapFinder() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <SitemapFinderContent />
    </Suspense>
  );
}
