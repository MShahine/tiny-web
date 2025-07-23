'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ExportButton from '@/components/ui/ExportButton';

interface HttpHeadersResult {
  success: boolean;
  data?: {
    url: string;
    finalUrl?: string;
    statusCode?: number;
    statusInfo: {
      category: string;
      description: string;
      seoImpact: 'positive' | 'neutral' | 'negative';
      recommendations: string[];
    };
    responseTime?: number;
    securityScore: number;
    securityGrade: string;
    performanceScore: number;
    totalHeaders: number;
    headers: {
      rawHeaders: Record<string, string>;
      security: {
        hsts?: string;
        csp?: string;
        xFrameOptions?: string;
        xContentTypeOptions?: string;
        xXssProtection?: string;
        referrerPolicy?: string;
        permissionsPolicy?: string;
      };
      performance: {
        cacheControl?: string;
        expires?: string;
        etag?: string;
        lastModified?: string;
        contentEncoding?: string;
        vary?: string;
        age?: string;
      };
      content: {
        type?: string;
        length?: number;
        encoding?: string;
        language?: string;
      };
      server: {
        server?: string;
        poweredBy?: string;
        technology?: string[];
        cloudProvider?: string;
      };
      securityAnalysis: {
        score: number;
        grade: string;
        issues: string[];
        recommendations: string[];
        passed: string[];
      };
      performanceAnalysis: {
        score: number;
        caching: {
          enabled: boolean;
          maxAge?: number;
          etag?: boolean;
          lastModified?: boolean;
        };
        compression: {
          enabled: boolean;
          type?: string;
        };
        cdn: {
          detected: boolean;
          provider?: string;
        };
      };
      redirects?: {
        location?: string;
        permanent: boolean;
      };
    };
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

function HttpHeadersCheckerContent() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HttpHeadersResult | null>(null);
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
      const response = await fetch('/api/tools/http-headers', {
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

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B':
        return 'text-blue-600 bg-blue-100';
      case 'C':
        return 'text-yellow-600 bg-yellow-100';
      case 'D':
        return 'text-orange-600 bg-orange-100';
      case 'F':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (seoImpact: string) => {
    switch (seoImpact) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'neutral':
        return 'text-blue-600 bg-blue-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
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
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">
              HH
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            HTTP Headers Checker & Security Analyzer
          </h1>
          <p className="text-muted-foreground">
            Analyze HTTP response headers for security vulnerabilities and performance optimization
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Analyze Headers'
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
                {/* Status and Overview */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Response Overview</h2>
                    <div className="flex items-center space-x-4">
                      <ExportButton 
                        data={result.data} 
                        filename="http-headers-analysis" 
                        toolName="HTTP Headers Checker"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Status Code */}
                    <div className="text-center">
                      <div className={`inline-flex px-4 py-2 rounded-full text-lg font-bold ${getStatusColor(result.data!.statusInfo.seoImpact)}`}>
                        {result.data?.statusCode}
                      </div>
                      <h3 className="text-lg font-semibold mt-2">{result.data?.statusInfo.category}</h3>
                      <p className="text-sm text-gray-600">{result.data?.statusInfo.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Response: {result.data?.responseTime}ms
                      </p>
                    </div>

                    {/* Security Grade */}
                    <div className="text-center">
                      <div className={`inline-flex px-4 py-2 rounded-full text-lg font-bold ${getGradeColor(result.data!.securityGrade)}`}>
                        {result.data?.securityGrade}
                      </div>
                      <h3 className="text-lg font-semibold mt-2">Security Grade</h3>
                      <p className="text-sm text-gray-600">Score: {result.data?.securityScore}/100</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {result.data?.headers.securityAnalysis.passed.length} checks passed
                      </p>
                    </div>

                    {/* Performance Score */}
                    <div className="text-center">
                      <div className="relative w-16 h-16 mx-auto">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 60 60">
                          <circle
                            cx="30"
                            cy="30"
                            r="25"
                            stroke="#e5e7eb"
                            strokeWidth="4"
                            fill="none"
                          />
                          <circle
                            cx="30"
                            cy="30"
                            r="25"
                            stroke={result.data!.performanceScore >= 70 ? '#10b981' : result.data!.performanceScore >= 40 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${(result.data!.performanceScore / 100) * 157} 157`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-900">
                            {result.data?.performanceScore}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mt-2">Performance</h3>
                      <p className="text-sm text-gray-600">
                        {result.data?.headers.performanceAnalysis.caching.enabled ? 'Caching enabled' : 'No caching'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {result.data?.headers.performanceAnalysis.compression.enabled ? 'Compressed' : 'Not compressed'}
                      </p>
                    </div>
                  </div>

                  {/* Redirect Info */}
                  {result.data?.headers.redirects && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Redirect Information</h4>
                      <p className="text-blue-800 text-sm">
                        <strong>Type:</strong> {result.data.headers.redirects.permanent ? 'Permanent (301/308)' : 'Temporary (302/307)'}
                      </p>
                      {result.data.headers.redirects.location && (
                        <p className="text-blue-800 text-sm break-all">
                          <strong>Location:</strong> {result.data.headers.redirects.location}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Security Analysis */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Analysis</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Security Issues */}
                    {result.data?.headers.securityAnalysis.issues.length! > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-red-600 mb-3 flex items-center">
                          <span className="w-5 h-5 bg-red-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">!</span>
                          Security Issues ({result.data?.headers.securityAnalysis.issues.length})
                        </h4>
                        <ul className="space-y-2">
                          {result.data?.headers.securityAnalysis.issues.map((issue, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Security Recommendations */}
                    {result.data?.headers.securityAnalysis.recommendations.length! > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-blue-600 mb-3 flex items-center">
                          <span className="w-5 h-5 bg-blue-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">💡</span>
                          Recommendations ({result.data?.headers.securityAnalysis.recommendations.length})
                        </h4>
                        <ul className="space-y-2">
                          {result.data?.headers.securityAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Passed Security Checks */}
                  {result.data?.headers.securityAnalysis.passed.length! > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-green-600 mb-3 flex items-center">
                        <span className="w-5 h-5 bg-green-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">✓</span>
                        Passed Security Checks ({result.data?.headers.securityAnalysis.passed.length})
                      </h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {result.data?.headers.securityAnalysis.passed.map((check, index) => (
                          <div key={index} className="text-sm text-green-700 flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                            {check}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Server & Technology Info */}
                {(result.data?.headers.server.server || result.data?.headers.server.technology?.length! > 0) && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Server & Technology</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        {result.data?.headers.server.server && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Server</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">
                              {result.data.headers.server.server}
                            </p>
                          </div>
                        )}
                        
                        {result.data?.headers.server.poweredBy && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Powered By</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">
                              {result.data.headers.server.poweredBy}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        {result.data?.headers.server.cloudProvider && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Cloud Provider</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                              {result.data.headers.server.cloudProvider}
                            </p>
                          </div>
                        )}

                        {result.data?.headers.server.technology && result.data.headers.server.technology.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Technologies Detected</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {result.data.headers.server.technology.map((tech, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* All Headers */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    All HTTP Headers ({result.data?.totalHeaders})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Header Name</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(result.data?.headers.rawHeaders || {}).map(([name, value], index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3 font-mono text-blue-600 font-medium">
                              {name}
                            </td>
                            <td className="py-2 px-3 text-gray-900 max-w-md break-all">
                              {value}
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
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-medium text-orange-900 mb-2">How it works</h3>
          <ul className="text-orange-800 text-sm space-y-1">
            <li>• Analyzes HTTP response headers for security vulnerabilities and best practices</li>
            <li>• Checks for security headers like HSTS, CSP, X-Frame-Options, and more</li>
            <li>• Evaluates caching, compression, and performance optimization headers</li>
            <li>• Detects server technology and cloud providers from header fingerprints</li>
            <li>• Provides actionable recommendations to improve security and performance</li>
            <li>• Rate limited to 20 requests per minute</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function HttpHeadersChecker() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <HttpHeadersCheckerContent />
    </Suspense>
  );
}