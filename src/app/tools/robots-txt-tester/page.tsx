'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ExportButton from '@/components/ui/ExportButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface RobotsResult {
  success: boolean;
  data?: {
    url: string;
    robotsTxtUrl: string;
    exists: boolean;
    content: string;
    rules: Array<{
      userAgent: string;
      directives: Array<{
        directive: string;
        value: string;
        line: number;
      }>;
    }>;
    sitemaps: string[];
    issues: string[];
    recommendations: string[];
    testResult?: {
      url: string;
      allowed: boolean;
      userAgent: string;
      matchedRule?: string;
      reason: string;
    };
    lastChecked: string;
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

export default function RobotsTxtTester() {
  const [url, setUrl] = useState('');
  const [testUrl, setTestUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RobotsResult | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['rules']));
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
      const response = await fetch('/api/tools/robots-txt-tester', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: url.trim(),
          testUrl: testUrl.trim() || undefined
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
    analyzeUrl();
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

  const formatDirective = (directive: string) => {
    return directive.charAt(0).toUpperCase() + directive.slice(1);
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
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold">
              RT
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Robots.txt Tester
          </h1>
          <p className="text-muted-foreground">
            Analyze robots.txt files and test URL accessibility for search engine crawlers
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="testUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Test URL (Optional)
              </label>
              <input
                type="url"
                id="testUrl"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com/admin (test if this URL is allowed)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a specific URL to test if it's allowed or blocked by robots.txt
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                'Analyze Robots.txt'
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {result.success ? (
              <>
                {/* Status Overview */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Robots.txt Analysis</h2>
                    <div className="flex items-center space-x-4">
                      <ExportButton 
                        data={result.data} 
                        filename="robots-txt-analysis" 
                        toolName="Robots.txt Tester"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${result.data?.exists ? 'text-green-600' : 'text-red-600'}`}>
                        {result.data?.exists ? '✓' : '✗'}
                      </div>
                      <p className="text-sm text-gray-600">
                        {result.data?.exists ? 'robots.txt Found' : 'robots.txt Missing'}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {result.data?.rules.length || 0}
                      </div>
                      <p className="text-sm text-gray-600">User-Agent Rules</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {result.data?.sitemaps.length || 0}
                      </div>
                      <p className="text-sm text-gray-600">Sitemap References</p>
                    </div>
                  </div>

                  {/* robots.txt URL */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">robots.txt Location:</h4>
                    <a
                      href={result.data?.robotsTxtUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {result.data?.robotsTxtUrl}
                    </a>
                  </div>

                  {/* Test Result */}
                  {result.data?.testResult && (
                    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">URL Test Result</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Test URL:</span>
                          <span className="text-sm font-medium break-all">{result.data.testResult.url}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">User-Agent:</span>
                          <span className="text-sm font-medium">{result.data.testResult.userAgent}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`text-sm font-bold ${
                            result.data.testResult.allowed ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {result.data.testResult.allowed ? 'ALLOWED' : 'BLOCKED'}
                          </span>
                        </div>
                        <div className="mt-3">
                          <span className="text-sm text-gray-600">Reason:</span>
                          <p className="text-sm text-gray-800 mt-1">{result.data.testResult.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Issues and Recommendations */}
                  {(result.data?.issues.length! > 0 || result.data?.recommendations.length! > 0) && (
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
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

                {/* Rules Details */}
                {result.data?.rules && result.data.rules.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Robots.txt Rules ({result.data.rules.length})
                    </h3>
                    
                    <div className="space-y-4">
                      {result.data.rules.map((rule, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                User-agent: <span className="text-blue-600">{rule.userAgent}</span>
                              </h4>
                              <span className="text-sm text-gray-500">
                                {rule.directives.length} directive{rule.directives.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            {rule.directives.length > 0 && (
                              <div className="space-y-2">
                                {rule.directives.map((directive, dirIndex) => (
                                  <div key={dirIndex} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                                    <div className="flex items-center space-x-3">
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        directive.directive === 'allow' ? 'bg-green-100 text-green-800' :
                                        directive.directive === 'disallow' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                        {formatDirective(directive.directive)}
                                      </span>
                                      <span className="text-sm font-mono text-gray-700">
                                        {directive.value || '(empty)'}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">Line {directive.line}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sitemaps */}
                {result.data?.sitemaps && result.data.sitemaps.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Sitemap References ({result.data.sitemaps.length})
                    </h3>
                    
                    <div className="space-y-3">
                      {result.data.sitemaps.map((sitemap, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <a
                            href={sitemap}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline break-all flex-1"
                          >
                            {sitemap}
                          </a>
                          <span className="text-xs text-gray-500 ml-3">External Link</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Content */}
                {result.data?.content && (
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6">
                      <Collapsible open={openSections.has('content')} onOpenChange={() => toggleSection('content')}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                          <span className="text-lg font-semibold text-gray-900">
                            Raw robots.txt Content
                          </span>
                          {openSections.has('content') ? (
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
                          <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                            <pre className="text-sm whitespace-pre-wrap font-mono">
                              {result.data.content}
                            </pre>
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
                  <span className="text-red-800 font-medium">Analysis Failed</span>
                </div>
                <p className="text-red-600 mt-2">{result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">How it works</h3>
          <ul className="text-red-800 text-sm space-y-1">
            <li>• Fetches and parses your website's robots.txt file</li>
            <li>• Analyzes rules for different user-agents (Googlebot, Bingbot, etc.)</li>
            <li>• Tests specific URLs against the robots.txt rules</li>
            <li>• Extracts sitemap references for SEO optimization</li>
            <li>• Identifies syntax errors and provides recommendations</li>
            <li>• Rate limited to 10 requests per minute</li>
          </ul>
        </div>
      </div>
    </div>
  );
}