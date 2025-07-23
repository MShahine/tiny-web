'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ExportButton from '@/components/ui/ExportButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SerpResult {
  success: boolean;
  data?: {
    keyword: string;
    searchEngine: 'google' | 'bing';
    location: string;
    device: 'desktop' | 'mobile';
    totalResults: number;
    results: Array<{
      position: number;
      title: string;
      url: string;
      description: string;
      displayUrl: string;
      type: 'organic' | 'featured_snippet' | 'local' | 'image' | 'video' | 'news';
    }>;
    features: Array<{
      type: 'featured_snippet' | 'local_pack' | 'image_pack' | 'video_pack' | 'news' | 'ads';
      position: number;
      content?: string;
      count?: number;
    }>;
    targetUrl?: string;
    targetPosition?: number;
    targetFound: boolean;
    competitorUrls: string[];
    searchTime: number;
    lastChecked: string;
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

function SerpCheckerContent() {
  const [keyword, setKeyword] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [searchEngine, setSearchEngine] = useState('google');
  const [location, setLocation] = useState('US');
  const [device, setDevice] = useState('desktop');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SerpResult | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['overview']));
  const searchParams = useSearchParams();

  // Auto-populate URL from query parameter
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setTargetUrl(urlParam);
      // Auto-analyze if URL is provided
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }, 100);
    }
  }, [searchParams]);

  const analyzeKeyword = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/tools/serp-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          targetUrl: targetUrl.trim() || undefined,
          searchEngine,
          location,
          device,
          maxResults: 100
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
    analyzeKeyword();
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

  const getRankingColor = (position: number) => {
    if (position <= 3) return 'text-green-600 bg-green-100';
    if (position <= 10) return 'text-blue-600 bg-blue-100';
    if (position <= 20) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="text-primary hover:text-primary/80 mr-4">
              ← Back to Tools
            </Link>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
              SR
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            SERP Rank Checker
          </h1>
          <p className="text-muted-foreground">
            Check search engine rankings for keywords and analyze SERP features
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-foreground mb-2">
                  Keyword *
                </label>
                <input
                  type="text"
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="best pizza recipe"
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="targetUrl" className="block text-sm font-medium text-foreground mb-2">
                  Target URL (Optional)
                </label>
                <input
                  type="url"
                  id="targetUrl"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="searchEngine" className="block text-sm font-medium text-foreground mb-2">
                  Search Engine
                </label>
                <select
                  id="searchEngine"
                  value={searchEngine}
                  onChange={(e) => setSearchEngine(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                >
                  <option value="google">Google</option>
                  <option value="bing">Bing</option>
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                >
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="ES">Spain</option>
                  <option value="IT">Italy</option>
                  <option value="BR">Brazil</option>
                  <option value="IN">India</option>
                </select>
              </div>

              <div>
                <label htmlFor="device" className="block text-sm font-medium text-foreground mb-2">
                  Device
                </label>
                <select
                  id="device"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                >
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Checking Rankings...
                </div>
              ) : (
                'Check SERP Rankings'
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
                    <h2 className="text-2xl font-bold text-foreground">SERP Analysis</h2>
                    <div className="flex items-center space-x-4">
                      <ExportButton 
                        data={result.data} 
                        filename="serp-analysis" 
                        toolName="SERP Rank Checker"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600">
                        {formatNumber(result.data?.totalResults || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Results</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {result.data?.results.length || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Analyzed Results</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {result.data?.features.length || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">SERP Features</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {result.data?.searchTime}ms
                      </div>
                      <p className="text-sm text-muted-foreground">Search Time</p>
                    </div>
                  </div>

                  {/* Search Details */}
                  <div className="grid md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm text-muted-foreground">Keyword:</span>
                      <p className="font-medium">{result.data?.keyword}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Search Engine:</span>
                      <p className="font-medium capitalize">{result.data?.searchEngine}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Location:</span>
                      <p className="font-medium">{result.data?.location}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Device:</span>
                      <p className="font-medium capitalize">{result.data?.device}</p>
                    </div>
                  </div>

                  {/* Target URL Result */}
                  {result.data?.targetUrl && (
                    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Target URL Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Target URL:</span>
                          <span className="text-sm font-medium break-all">{result.data.targetUrl}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Found in Results:</span>
                          <span className={`text-sm font-bold ${
                            result.data.targetFound ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {result.data.targetFound ? 'YES' : 'NO'}
                          </span>
                        </div>
                        {result.data.targetPosition && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Position:</span>
                            <span className={`px-2 py-1 rounded-full text-sm font-bold ${getRankingColor(result.data.targetPosition)}`}>
                              #{result.data.targetPosition}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* SERP Features */}
                {result.data?.features && result.data.features.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      SERP Features ({result.data.features.length})
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {result.data.features.map((feature, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              feature.type === 'featured_snippet' ? 'bg-yellow-100 text-yellow-800' :
                              feature.type === 'local_pack' ? 'bg-green-100 text-green-800' :
                              feature.type === 'image_pack' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {feature.type.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">Position {feature.position}</span>
                          </div>
                          {feature.content && (
                            <p className="text-sm text-gray-700 mt-2">{feature.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {result.data?.results && result.data.results.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6">
                      <Collapsible open={openSections.has('results')} onOpenChange={() => toggleSection('results')}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                          <span className="text-lg font-semibold text-gray-900">
                            Search Results ({result.data.results.length})
                          </span>
                          {openSections.has('results') ? (
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
                            {result.data.results.map((item, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 rounded-full text-sm font-bold ${getRankingColor(item.position)}`}>
                                      #{item.position}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      item.type === 'organic' ? 'bg-green-100 text-green-800' :
                                      item.type === 'featured_snippet' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {item.type.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                
                                <h4 className="text-lg font-medium text-blue-600 hover:text-blue-800 mb-1">
                                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {item.title}
                                  </a>
                                </h4>
                                
                                <p className="text-sm text-green-600 mb-2">{item.displayUrl}</p>
                                
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                )}

                {/* Competitor URLs */}
                {result.data?.competitorUrls && result.data.competitorUrls.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Top Competing URLs ({result.data.competitorUrls.length})
                    </h3>
                    
                    <div className="space-y-2">
                      {result.data.competitorUrls.slice(0, 10).map((url, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline break-all flex-1"
                          >
                            {url}
                          </a>
                          <span className="text-xs text-gray-500 ml-3">#{index + 1}</span>
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
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-medium text-indigo-900 mb-2">How it works</h3>
          <ul className="text-indigo-800 text-sm space-y-1">
            <li>• Searches Google or Bing for your specified keyword</li>
            <li>• Analyzes up to 100 search results for rankings</li>
            <li>• Detects SERP features like featured snippets and local packs</li>
            <li>• Finds your target URL's position if provided</li>
            <li>• Identifies top competing websites</li>
            <li>• Rate limited to 3 requests per minute due to search engine restrictions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function SerpChecker() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <SerpCheckerContent />
    </Suspense>
  );
}