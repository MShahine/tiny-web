'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ExportButton from '@/components/ui/ExportButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CrawlPage {
  url: string;
  title?: string;
  metaDescription?: string;
  h1?: string;
  h2s: string[];
  h3s: string[];
  statusCode: number;
  responseTime: number;
  contentLength: number;
  contentType?: string;
  canonicalUrl?: string;
  metaRobots?: string;
  internalLinks: string[];
  externalLinks: string[];
  images: Array<{
    src: string;
    alt?: string;
    title?: string;
    size?: number;
  }>;
  issues: string[];
  depth: number;
  crawledAt: string;
}

interface CrawlIssue {
  type: 'error' | 'warning' | 'info';
  category: 'seo' | 'technical' | 'content' | 'performance' | 'accessibility';
  page: string;
  issue: string;
  description: string;
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
}

interface CrawlResult {
  success: boolean;
  data?: {
    startUrl: string;
    crawlSettings: {
      maxPages: number;
      maxDepth: number;
      respectRobots: boolean;
    };
    pages: CrawlPage[];
    issues: CrawlIssue[];
    summary: {
      totalPages: number;
      totalIssues: number;
      issuesByType: Record<string, number>;
      issuesByCategory: Record<string, number>;
      averageResponseTime: number;
      largestPages: Array<{ url: string; size: number }>;
      slowestPages: Array<{ url: string; time: number }>;
      duplicateTitles: Array<{ title: string; pages: string[] }>;
      duplicateDescriptions: Array<{ description: string; pages: string[] }>;
      missingTitles: string[];
      missingDescriptions: string[];
      brokenLinks: Array<{ page: string; link: string; status: number }>;
    };
    crawlStats: {
      startTime: string;
      endTime: string;
      duration: number;
      pagesPerSecond: number;
    };
    lastChecked: string;
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

export default function WebsiteCrawlTest() {
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(50);
  const [maxDepth, setMaxDepth] = useState(3);
  const [respectRobots, setRespectRobots] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['overview']));
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

  const startCrawl = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/tools/website-crawl-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          maxPages,
          maxDepth,
          respectRobots
        }),
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
    startCrawl();
  };

  const toggleSection = (section: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(section)) {
      newOpenSections.delete(section);
    } else {
      newOpenSections.add(section);
    }
    setOpenSections(newOpenSections);
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 bg-green-100';
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-600 bg-yellow-100';
    if (statusCode >= 400 && statusCode < 500) return 'text-red-600 bg-red-100';
    if (statusCode >= 500) return 'text-purple-600 bg-purple-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'seo': '🔍',
      'technical': '⚙️',
      'content': '📝',
      'performance': '⚡',
      'accessibility': '♿'
    };
    return icons[category] || '🔧';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
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
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600 font-bold">
              WC
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Website Crawl Test
          </h1>
          <p className="text-muted-foreground">
            Crawl websites to analyze SEO, technical issues, and content structure
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
                Website URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="maxPages" className="block text-sm font-medium text-foreground mb-2">
                  Max Pages
                </label>
                <select
                  id="maxPages"
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value={10}>10 pages</option>
                  <option value={25}>25 pages</option>
                  <option value={50}>50 pages</option>
                  <option value={100}>100 pages</option>
                </select>
              </div>

              <div>
                <label htmlFor="maxDepth" className="block text-sm font-medium text-foreground mb-2">
                  Max Depth
                </label>
                <select
                  id="maxDepth"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value={1}>1 level</option>
                  <option value={2}>2 levels</option>
                  <option value={3}>3 levels</option>
                  <option value={4}>4 levels</option>
                  <option value={5}>5 levels</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Robots.txt
                </label>
                <div className="flex items-center space-x-4 pt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={respectRobots}
                      onChange={(e) => setRespectRobots(e.target.checked)}
                      className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="ml-2 text-sm text-foreground">Respect robots.txt</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Crawling Website...
                </div>
              ) : (
                'Start Crawl Test'
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {result.success ? (
              <>
                {/* Overview */}
                <div className="bg-card rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Crawl Analysis</h2>
                    <div className="flex items-center space-x-4">
                      {result.cached && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Cached Result
                        </span>
                      )}
                      <ExportButton 
                        data={result.data} 
                        filename="website-crawl-analysis" 
                        toolName="Website Crawl Test"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-violet-600">
                        {result.data?.summary.totalPages || 0}
                      </div>
                      <p className="text-sm text-gray-600">Pages Crawled</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {result.data?.summary.totalIssues || 0}
                      </div>
                      <p className="text-sm text-gray-600">Issues Found</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatTime(result.data?.summary.averageResponseTime || 0)}
                      </div>
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {formatDuration(result.data?.crawlStats.duration || 0)}
                      </div>
                      <p className="text-sm text-gray-600">Crawl Duration</p>
                    </div>
                  </div>

                  {/* Crawl Settings */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Crawl Settings</h4>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Max Pages:</span>
                        <p className="font-medium">{result.data?.crawlSettings.maxPages}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Max Depth:</span>
                        <p className="font-medium">{result.data?.crawlSettings.maxDepth}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Robots.txt:</span>
                        <p className="font-medium">{result.data?.crawlSettings.respectRobots ? 'Respected' : 'Ignored'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Pages/Second:</span>
                        <p className="font-medium">{result.data?.crawlStats.pagesPerSecond.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issues Summary */}
                {result.data?.issues && result.data.issues.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Issues Summary ({result.data.issues.length})
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* By Severity */}
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">By Severity</h4>
                        <div className="space-y-2">
                          {['high', 'medium', 'low'].map(severity => {
                            const count = result.data?.issues.filter(issue => issue.severity === severity).length || 0;
                            return (
                              <div key={severity} className="flex items-center justify-between">
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(severity)}`}>
                                  {severity.toUpperCase()}
                                </span>
                                <span className="font-medium">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* By Category */}
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">By Category</h4>
                        <div className="space-y-2">
                          {Object.entries(result.data?.summary.issuesByCategory || {}).map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span>{getCategoryIcon(category)}</span>
                                <span className="text-sm capitalize">{category}</span>
                              </div>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Insights */}
                <div className="bg-card rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quick Insights</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Performance Issues */}
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-3">Performance Issues</h4>
                      <div className="space-y-3">
                        {result.data?.summary.slowestPages.slice(0, 3).map((page, index) => (
                          <div key={index} className="p-3 bg-red-50 rounded-lg">
                            <div className="text-sm font-medium text-red-800 break-all">{page.url}</div>
                            <div className="text-xs text-red-600">{formatTime(page.time)} response time</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SEO Issues */}
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-3">SEO Issues</h4>
                      <div className="space-y-3">
                        {result.data?.summary.missingTitles.length! > 0 && (
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <div className="text-sm font-medium text-yellow-800">Missing Titles</div>
                            <div className="text-xs text-yellow-600">{result.data?.summary.missingTitles.length} pages without title tags</div>
                          </div>
                        )}
                        {result.data?.summary.missingDescriptions.length! > 0 && (
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <div className="text-sm font-medium text-yellow-800">Missing Descriptions</div>
                            <div className="text-xs text-yellow-600">{result.data?.summary.missingDescriptions.length} pages without meta descriptions</div>
                          </div>
                        )}
                        {result.data?.summary.duplicateTitles.length! > 0 && (
                          <div className="p-3 bg-orange-50 rounded-lg">
                            <div className="text-sm font-medium text-orange-800">Duplicate Titles</div>
                            <div className="text-xs text-orange-600">{result.data?.summary.duplicateTitles.length} sets of duplicate titles</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Issues */}
                {result.data?.issues && result.data.issues.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6">
                      <Collapsible open={openSections.has('issues')} onOpenChange={() => toggleSection('issues')}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                          <span className="text-lg font-semibold text-gray-900">
                            All Issues ({result.data.issues.length})
                          </span>
                          {openSections.has('issues') ? (
                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4">
                          <div className="space-y-4">
                            {result.data.issues.map((issue, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-xl">{getCategoryIcon(issue.category)}</span>
                                    <div>
                                      <h4 className="font-medium text-gray-900">{issue.issue}</h4>
                                      <p className="text-sm text-gray-600 break-all">{issue.page}</p>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(issue.severity)}`}>
                                    {issue.severity.toUpperCase()}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-700 mb-3">{issue.description}</p>
                                
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <strong>Recommendation:</strong> {issue.recommendation}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                )}

                {/* Crawled Pages */}
                {result.data?.pages && result.data.pages.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6">
                      <Collapsible open={openSections.has('pages')} onOpenChange={() => toggleSection('pages')}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                          <span className="text-lg font-semibold text-gray-900">
                            Crawled Pages ({result.data.pages.length})
                          </span>
                          {openSections.has('pages') ? (
                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4">
                          <div className="space-y-4">
                            {result.data.pages.map((page, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-blue-600 hover:text-blue-800 break-all">
                                      <a href={page.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {page.title || page.url}
                                      </a>
                                    </h4>
                                    {page.metaDescription && (
                                      <p className="text-sm text-gray-600 mt-1">{page.metaDescription.substring(0, 150)}...</p>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(page.statusCode)}`}>
                                      {page.statusCode}
                                    </span>
                                    <span className="text-xs text-gray-500">Depth {page.depth}</span>
                                  </div>
                                </div>
                                
                                <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                                  <div>Response: {formatTime(page.responseTime)}</div>
                                  <div>Size: {formatFileSize(page.contentLength)}</div>
                                  <div>Internal Links: {page.internalLinks.length}</div>
                                  <div>Images: {page.images.length}</div>
                                </div>
                                
                                {page.issues.length > 0 && (
                                  <div className="mt-3 p-2 bg-red-50 rounded">
                                    <div className="text-xs text-red-600">
                                      Issues: {page.issues.join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-red-800 font-medium">Crawl Failed</span>
                </div>
                <p className="text-red-600 mt-2">{result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-violet-50 border border-violet-200 rounded-lg p-4">
          <h3 className="font-medium text-violet-900 mb-2">What we analyze</h3>
          <div className="grid md:grid-cols-2 gap-4 text-violet-800 text-sm">
            <ul className="space-y-1">
              <li>• SEO elements (titles, descriptions, headings)</li>
              <li>• Technical issues (404s, redirects, broken links)</li>
              <li>• Content analysis (duplicate content, thin content)</li>
              <li>• Internal link structure and anchor text</li>
            </ul>
            <ul className="space-y-1">
              <li>• Image optimization (alt tags, file sizes)</li>
              <li>• Performance issues (slow pages, large files)</li>
              <li>• Robots.txt compliance and crawl rules</li>
              <li>• Comprehensive issue reporting with recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}