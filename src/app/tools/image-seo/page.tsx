'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ExportButton from '@/components/ui/ExportButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ImageAnalysis {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  format: string;
  loading?: string;
  issues: string[];
  recommendations: string[];
  seoScore: number;
}

interface ImageSeoResult {
  success: boolean;
  data?: {
    url: string;
    totalImages: number;
    imagesWithAlt: number;
    imagesWithoutAlt: number;
    averageFileSize: number;
    largestImage: number;
    formatDistribution: Record<string, number>;
    lazyLoadingUsage: number;
    images: ImageAnalysis[];
    summary: {
      altTextScore: number;
      performanceScore: number;
      formatScore: number;
      lazyLoadingScore: number;
      overallScore: number;
    };
    recommendations: string[];
    lastChecked: string;
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

function ImageSeoAnalyzerContent() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageSeoResult | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['overview']));
  const [filterType, setFilterType] = useState<'all' | 'issues' | 'good'>('all');
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

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/tools/image-seo', {
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
        error: 'Failed to analyze images. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredImages = result?.data?.images.filter(image => {
    if (filterType === 'issues') return image.issues.length > 0;
    if (filterType === 'good') return image.issues.length === 0;
    return true;
  }) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Image SEO Analyzer</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Optimize your images for better SEO performance and faster loading
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-2">
                Website URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com (e.g., https://unsplash.com, https://amazon.com/dp/B08N5WRWNW)"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Analyze images on any webpage for SEO optimization opportunities
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing Images...' : 'Analyze Image SEO'}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {result.success && result.data ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-card rounded-lg border p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.data.totalImages}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Images</div>
                  </div>
                  <div className="bg-card rounded-lg border p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {result.data.imagesWithAlt}
                    </div>
                    <div className="text-sm text-muted-foreground">With Alt Text</div>
                  </div>
                  <div className="bg-card rounded-lg border p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {result.data.imagesWithoutAlt}
                    </div>
                    <div className="text-sm text-muted-foreground">Missing Alt Text</div>
                  </div>
                  <div className="bg-card rounded-lg border p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatFileSize(result.data.averageFileSize)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg File Size</div>
                  </div>
                </div>

                {/* SEO Scores */}
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Image SEO Scores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { label: 'Alt Text', score: result.data.summary.altTextScore },
                      { label: 'Performance', score: result.data.summary.performanceScore },
                      { label: 'Format', score: result.data.summary.formatScore },
                      { label: 'Lazy Loading', score: result.data.summary.lazyLoadingScore },
                      { label: 'Overall', score: result.data.summary.overallScore },
                    ].map(({ label, score }) => (
                      <div key={label} className="text-center">
                        <div className="text-sm font-medium mb-2">{label}</div>
                        <div className="relative w-16 h-16 mx-auto">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}
                              strokeWidth="3"
                              strokeDasharray={`${score}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                              {score}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Format Distribution */}
                {Object.keys(result.data.formatDistribution).length > 0 && (
                  <div className="bg-card rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4">Image Format Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(result.data.formatDistribution).map(([format, count]) => (
                        <div key={format} className="text-center">
                          <div className="text-2xl font-bold">{count}</div>
                          <div className="text-sm text-muted-foreground uppercase">{format}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Filter */}
                {result.data.images.length > 0 && (
                  <div className="bg-card rounded-lg border p-4">
                    <label htmlFor="image-filter" className="block text-sm font-medium mb-2">
                      Filter Images
                    </label>
                    <select
                      id="image-filter"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">All Images ({result.data.images.length})</option>
                      <option value="issues">Images with Issues ({result.data.images.filter(img => img.issues.length > 0).length})</option>
                      <option value="good">Optimized Images ({result.data.images.filter(img => img.issues.length === 0).length})</option>
                    </select>
                  </div>
                )}

                {/* Image Details */}
                {filteredImages.length > 0 && (
                  <Collapsible
                    open={openSections.has('images')}
                    onOpenChange={() => toggleSection('images')}
                  >
                    <CollapsibleTrigger className="w-full bg-card rounded-lg border p-4 text-left hover:bg-accent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          Image Analysis Details ({filteredImages.length})
                        </h3>
                        <span className="text-2xl">
                          {openSections.has('images') ? '−' : '+'}
                        </span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-4">
                      {filteredImages.map((image, index) => (
                        <div key={index} className="bg-card rounded-lg border p-6">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <img
                                src={image.src}
                                alt={image.alt || 'Image preview'}
                                className="w-20 h-20 object-cover rounded border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkw0MCA0OEw1NiAzMkw2NCA0MEw2NCA1NkgxNlY0MEwyNCAzMloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium truncate">{image.src}</h4>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  image.seoScore >= 80 ? 'bg-green-100 text-green-800' :
                                  image.seoScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  Score: {image.seoScore}/100
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground mb-3">
                                <div>Format: {image.format.toUpperCase()}</div>
                                {image.width && image.height && (
                                  <div>Size: {image.width}×{image.height}</div>
                                )}
                                {image.fileSize && (
                                  <div>File: {formatFileSize(image.fileSize)}</div>
                                )}
                                {image.loading && (
                                  <div>Loading: {image.loading}</div>
                                )}
                              </div>

                              <div className="mb-3">
                                <div className="text-xs font-medium mb-1">Alt Text:</div>
                                <div className="text-sm bg-gray-50 rounded p-2">
                                  {image.alt || <span className="text-red-500 italic">Missing alt text</span>}
                                </div>
                              </div>

                              {image.issues.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs font-medium text-red-600 mb-1">Issues:</div>
                                  <ul className="list-disc list-inside space-y-1">
                                    {image.issues.map((issue, i) => (
                                      <li key={i} className="text-red-600 text-xs">{issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {image.recommendations.length > 0 && (
                                <div>
                                  <div className="text-xs font-medium text-blue-600 mb-1">Recommendations:</div>
                                  <ul className="list-disc list-inside space-y-1">
                                    {image.recommendations.map((rec, i) => (
                                      <li key={i} className="text-blue-600 text-xs">{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Recommendations */}
                {result.data.recommendations.length > 0 && (
                  <Collapsible
                    open={openSections.has('recommendations')}
                    onOpenChange={() => toggleSection('recommendations')}
                  >
                    <CollapsibleTrigger className="w-full bg-card rounded-lg border p-4 text-left hover:bg-accent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          SEO Recommendations ({result.data.recommendations.length})
                        </h3>
                        <span className="text-2xl">
                          {openSections.has('recommendations') ? '−' : '+'}
                        </span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="bg-card rounded-lg border p-6">
                        <ul className="space-y-3">
                          {result.data.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Export Button */}
                <div className="flex justify-center">
                  <ExportButton
                    data={result.data}
                    filename={`image-seo-analysis-${new URL(result.data.url).hostname}`}
                    // @ts-ignore
                    title="Image SEO Analysis Report"
                  />
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

        {/* Tool Information */}
        <div className="mt-12 bg-muted rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">About Image SEO Analyzer</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What it analyzes:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Alt text presence and quality</li>
                <li>• Image file sizes and compression</li>
                <li>• Modern format usage (WebP, AVIF)</li>
                <li>• Lazy loading implementation</li>
                <li>• Image dimensions and optimization</li>
                <li>• Title attributes and accessibility</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Why it matters:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Improves accessibility for screen readers</li>
                <li>• Enhances page loading speed</li>
                <li>• Boosts image search rankings</li>
                <li>• Reduces bandwidth usage</li>
                <li>• Improves Core Web Vitals scores</li>
                <li>• Better user experience on slow connections</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImageSeoAnalyzer() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ImageSeoAnalyzerContent />
    </Suspense>
  );
}
