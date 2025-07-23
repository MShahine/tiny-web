'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ExportButton from '@/components/ui/ExportButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb: number;
  domContentLoaded: number;
  loadComplete: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  totalSize: number;
  totalRequests: number;
  htmlSize: number;
  cssSize: number;
  jsSize: number;
  imageSize: number;
  fontSize: number;
  performanceScore: number;
  accessibilityScore: number;
  seoScore: number;
  bestPracticesScore: number;
}

interface OptimizationOpportunity {
  category: 'images' | 'css' | 'javascript' | 'caching' | 'server' | 'mobile';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings: {
    bytes?: number;
    ms?: number;
  };
  recommendation: string;
}

interface PerformanceResult {
  success: boolean;
  data?: {
    url: string;
    device: 'desktop' | 'mobile';
    metrics: PerformanceMetrics;
    opportunities: OptimizationOpportunity[];
    diagnostics: {
      mobileOptimized: boolean;
      httpsEnabled: boolean;
      compressionEnabled: boolean;
      cachingOptimized: boolean;
      imagesOptimized: boolean;
      minificationApplied: boolean;
    };
    summary: {
      overallScore: number;
      grade: 'A' | 'B' | 'C' | 'D' | 'F';
      status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
      primaryIssues: string[];
    };
    fetchInfo: {
      httpStatus: number;
      responseTime: number;
      responseSize: number;
    };
    lastChecked: string;
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

export default function PageSpeedInsights() {
  const [url, setUrl] = useState('');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PerformanceResult | null>(null);
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

  const analyzeUrl = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/tools/page-speed-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: url.trim(),
          device 
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'images': '🖼️',
      'css': '🎨',
      'javascript': '⚡',
      'caching': '💾',
      'server': '🖥️',
      'mobile': '📱'
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

  const getCoreWebVitalStatus = (metric: string, value: number) => {
    switch (metric) {
      case 'lcp':
        if (value <= 2500) return 'good';
        if (value <= 4000) return 'needs-improvement';
        return 'poor';
      case 'fid':
        if (value <= 100) return 'good';
        if (value <= 300) return 'needs-improvement';
        return 'poor';
      case 'cls':
        if (value <= 0.1) return 'good';
        if (value <= 0.25) return 'needs-improvement';
        return 'poor';
      default:
        return 'unknown';
    }
  };

  const getCoreWebVitalColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold">
              PS
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Page Speed Insights
          </h1>
          <p className="text-gray-600">
            Analyze website performance, Core Web Vitals, and get optimization recommendations
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="device" className="block text-sm font-medium text-gray-700 mb-2">
                  Device Type
                </label>
                <select
                  id="device"
                  value={device}
                  onChange={(e) => setDevice(e.target.value as 'desktop' | 'mobile')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing Performance...
                </div>
              ) : (
                'Analyze Page Speed'
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
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Performance Analysis</h2>
                    <div className="flex items-center space-x-4">
                      {result.cached && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Cached Result
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full capitalize">
                        {result.data?.device}
                      </span>
                      <ExportButton 
                        data={result.data} 
                        filename="page-speed-analysis" 
                        toolName="Page Speed Insights"
                      />
                    </div>
                  </div>
                  
                  {/* Overall Score */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreColor(result.data?.summary.overallScore || 0)}`}>
                      {result.data?.summary.overallScore || 0}
                    </div>
                    <div className="mt-2">
                      <span className={`px-3 py-1 rounded-full text-lg font-bold ${getGradeColor(result.data?.summary.grade || 'F')}`}>
                        Grade {result.data?.summary.grade}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2 capitalize">{result.data?.summary.status}</p>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(result.data?.metrics.performanceScore || 0)}`}>
                        {result.data?.metrics.performanceScore || 0}
                      </div>
                      <p className="text-sm text-gray-600">Performance</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(result.data?.metrics.accessibilityScore || 0)}`}>
                        {result.data?.metrics.accessibilityScore || 0}
                      </div>
                      <p className="text-sm text-gray-600">Accessibility</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(result.data?.metrics.seoScore || 0)}`}>
                        {result.data?.metrics.seoScore || 0}
                      </div>
                      <p className="text-sm text-gray-600">SEO</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(result.data?.metrics.bestPracticesScore || 0)}`}>
                        {result.data?.metrics.bestPracticesScore || 0}
                      </div>
                      <p className="text-sm text-gray-600">Best Practices</p>
                    </div>
                  </div>

                  {/* Primary Issues */}
                  {result.data?.summary.primaryIssues && result.data.summary.primaryIssues.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="text-md font-semibold text-red-800 mb-2">Primary Issues to Address</h4>
                      <ul className="space-y-1">
                        {result.data.summary.primaryIssues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-700 flex items-start">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Core Web Vitals */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* LCP */}
                    <div className="text-center">
                      <div className="mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCoreWebVitalColor(getCoreWebVitalStatus('lcp', result.data?.metrics.lcp || 0))}`}>
                          {formatTime(result.data?.metrics.lcp || 0)}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900">LCP</h4>
                      <p className="text-sm text-gray-600">Largest Contentful Paint</p>
                      <p className="text-xs text-gray-500 mt-1">Good: ≤2.5s</p>
                    </div>

                    {/* FID */}
                    <div className="text-center">
                      <div className="mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCoreWebVitalColor(getCoreWebVitalStatus('fid', result.data?.metrics.fid || 0))}`}>
                          {formatTime(result.data?.metrics.fid || 0)}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900">FID</h4>
                      <p className="text-sm text-gray-600">First Input Delay</p>
                      <p className="text-xs text-gray-500 mt-1">Good: ≤100ms</p>
                    </div>

                    {/* CLS */}
                    <div className="text-center">
                      <div className="mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCoreWebVitalColor(getCoreWebVitalStatus('cls', result.data?.metrics.cls || 0))}`}>
                          {(result.data?.metrics.cls || 0).toFixed(3)}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900">CLS</h4>
                      <p className="text-sm text-gray-600">Cumulative Layout Shift</p>
                      <p className="text-xs text-gray-500 mt-1">Good: ≤0.1</p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time to First Byte (TTFB)</span>
                        <span className="font-medium">{formatTime(result.data?.metrics.ttfb || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">First Contentful Paint</span>
                        <span className="font-medium">{formatTime(result.data?.metrics.firstContentfulPaint || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">DOM Content Loaded</span>
                        <span className="font-medium">{formatTime(result.data?.metrics.domContentLoaded || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Load Complete</span>
                        <span className="font-medium">{formatTime(result.data?.metrics.loadComplete || 0)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Page Size</span>
                        <span className="font-medium">{formatFileSize(result.data?.metrics.totalSize || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Requests</span>
                        <span className="font-medium">{result.data?.metrics.totalRequests || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Images Size</span>
                        <span className="font-medium">{formatFileSize(result.data?.metrics.imageSize || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">JavaScript Size</span>
                        <span className="font-medium">{formatFileSize(result.data?.metrics.jsSize || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optimization Opportunities */}
                {result.data?.opportunities && result.data.opportunities.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Optimization Opportunities ({result.data.opportunities.length})
                    </h3>
                    
                    <div className="space-y-4">
                      {result.data.opportunities.map((opportunity, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{getCategoryIcon(opportunity.category)}</span>
                              <div>
                                <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                                <p className="text-sm text-gray-600">{opportunity.description}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getImpactColor(opportunity.impact)}`}>
                              {opportunity.impact.toUpperCase()}
                            </span>
                          </div>
                          
                          {(opportunity.savings.bytes || opportunity.savings.ms) && (
                            <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                              {opportunity.savings.bytes && (
                                <span>💾 Save {formatFileSize(opportunity.savings.bytes)}</span>
                              )}
                              {opportunity.savings.ms && (
                                <span>⚡ Save {formatTime(opportunity.savings.ms)}</span>
                              )}
                            </div>
                          )}
                          
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Recommendation:</strong> {opportunity.recommendation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diagnostics */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6">
                    <Collapsible open={openSections.has('diagnostics')} onOpenChange={() => toggleSection('diagnostics')}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <span className="text-lg font-semibold text-gray-900">
                          Diagnostics & Best Practices
                        </span>
                        {openSections.has('diagnostics') ? (
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
                        <div className="grid md:grid-cols-2 gap-4">
                          {Object.entries(result.data?.diagnostics || {}).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                value ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                              }`}>
                                {value ? '✓ PASS' : '✗ FAIL'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
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
        <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <h3 className="font-medium text-emerald-900 mb-2">What we analyze</h3>
          <div className="grid md:grid-cols-2 gap-4 text-emerald-800 text-sm">
            <ul className="space-y-1">
              <li>• Core Web Vitals (LCP, FID, CLS)</li>
              <li>• Performance metrics (TTFB, Load Time)</li>
              <li>• Resource analysis (Images, CSS, JS)</li>
              <li>• Mobile optimization</li>
            </ul>
            <ul className="space-y-1">
              <li>• SEO and accessibility scores</li>
              <li>• Best practices compliance</li>
              <li>• Optimization opportunities</li>
              <li>• Actionable recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}