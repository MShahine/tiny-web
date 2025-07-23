'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ExportButton from '@/components/ui/ExportButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TechnologySignature {
  name: string;
  category: string;
  confidence: number;
  version?: string;
  description?: string;
  website?: string;
}

interface TechnologyResult {
  success: boolean;
  data?: {
    url: string;
    technologies: TechnologySignature[];
    categories: Record<string, TechnologySignature[]>;
    summary: {
      totalDetected: number;
      categoriesFound: string[];
      confidence: 'high' | 'medium' | 'low';
    };
    meta: {
      title?: string;
      description?: string;
      generator?: string;
      viewport?: string;
    };
    performance: {
      loadTime: number;
      responseSize: number;
      httpStatus: number;
    };
    lastChecked: string;
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

export default function WebsiteTechnologyChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TechnologyResult | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['overview']));
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
      const response = await fetch('/api/tools/website-technology-checker', {
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

  const toggleCategory = (category: string) => {
    const newOpenCategories = new Set(openCategories);
    if (newOpenCategories.has(category)) {
      newOpenCategories.delete(category);
    } else {
      newOpenCategories.add(category);
    }
    setOpenCategories(newOpenCategories);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-blue-600 bg-blue-100';
    if (confidence >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'CMS': '📝',
      'E-commerce': '🛒',
      'JavaScript Framework': '⚛️',
      'CSS Framework': '🎨',
      'JavaScript Library': '📚',
      'Analytics': '📊',
      'Tag Manager': '🏷️',
      'CDN': '☁️',
      'Web Server': '🖥️',
      'Font Library': '🔤',
      'Database': '🗄️',
      'Programming Language': '💻',
      'Operating System': '🖥️',
      'Security': '🔒',
      'Marketing': '📈',
      'Payment': '💳',
      'Social': '📱',
      'Widget': '🔧',
      'Hosting': '🌐'
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700 mr-4">
              ← Back to Tools
            </Link>
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600 font-bold">
              WT
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Website Technology Checker
          </h1>
          <p className="text-gray-600">
            Discover the technologies, frameworks, and tools powering any website
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Analyze Website'
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
                {/* Overview */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Technology Analysis</h2>
                    <div className="flex items-center space-x-4">
                      {result.cached && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Cached Result
                        </span>
                      )}
                      <ExportButton 
                        data={result.data} 
                        filename="website-technology-analysis" 
                        toolName="Website Technology Checker"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-600">
                        {result.data?.summary.totalDetected || 0}
                      </div>
                      <p className="text-sm text-gray-600">Technologies Found</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {result.data?.summary.categoriesFound.length || 0}
                      </div>
                      <p className="text-sm text-gray-600">Categories</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${
                        result.data?.summary.confidence === 'high' ? 'text-green-600' :
                        result.data?.summary.confidence === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {result.data?.summary.confidence?.toUpperCase() || 'LOW'}
                      </div>
                      <p className="text-sm text-gray-600">Confidence</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatFileSize(result.data?.performance.responseSize || 0)}
                      </div>
                      <p className="text-sm text-gray-600">Page Size</p>
                    </div>
                  </div>

                  {/* Website Meta Info */}
                  {result.data?.meta && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Website Information</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        {result.data.meta.title && (
                          <div>
                            <span className="text-gray-600">Title:</span>
                            <p className="font-medium">{result.data.meta.title}</p>
                          </div>
                        )}
                        {result.data.meta.description && (
                          <div>
                            <span className="text-gray-600">Description:</span>
                            <p className="font-medium">{result.data.meta.description.substring(0, 100)}...</p>
                          </div>
                        )}
                        {result.data.meta.generator && (
                          <div>
                            <span className="text-gray-600">Generator:</span>
                            <p className="font-medium">{result.data.meta.generator}</p>
                          </div>
                        )}
                        {result.data.meta.viewport && (
                          <div>
                            <span className="text-gray-600">Viewport:</span>
                            <p className="font-medium">{result.data.meta.viewport}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Technologies by Category */}
                {result.data?.categories && Object.keys(result.data.categories).length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Technologies by Category
                    </h3>
                    
                    <div className="space-y-4">
                      {Object.entries(result.data.categories).map(([category, technologies]) => (
                        <div key={category} className="border border-gray-200 rounded-lg">
                          <Collapsible open={openCategories.has(category)} onOpenChange={() => toggleCategory(category)}>
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getCategoryIcon(category)}</span>
                                <div className="text-left">
                                  <h4 className="font-medium text-gray-900">{category}</h4>
                                  <p className="text-sm text-gray-500">{technologies.length} technology{technologies.length !== 1 ? 'ies' : ''}</p>
                                </div>
                              </div>
                              {openCategories.has(category) ? (
                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-4 pb-4 space-y-3">
                                {technologies.map((tech, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3">
                                        <h5 className="font-medium text-gray-900">{tech.name}</h5>
                                        {tech.version && (
                                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            v{tech.version}
                                          </span>
                                        )}
                                        <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(tech.confidence)}`}>
                                          {tech.confidence}% confidence
                                        </span>
                                      </div>
                                      {tech.description && (
                                        <p className="text-sm text-gray-600 mt-1">{tech.description}</p>
                                      )}
                                    </div>
                                    {tech.website && (
                                      <a
                                        href={tech.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-600 hover:text-cyan-800 text-sm hover:underline ml-3"
                                      >
                                        Learn More
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Technologies List */}
                {result.data?.technologies && result.data.technologies.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6">
                      <Collapsible open={openCategories.has('all-technologies')} onOpenChange={() => toggleCategory('all-technologies')}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                          <span className="text-lg font-semibold text-gray-900">
                            All Technologies ({result.data.technologies.length})
                          </span>
                          {openCategories.has('all-technologies') ? (
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
                            {result.data.technologies.map((tech, index) => (
                              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-gray-900">{tech.name}</h5>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(tech.confidence)}`}>
                                    {tech.confidence}%
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <span>{getCategoryIcon(tech.category)}</span>
                                  <span>{tech.category}</span>
                                  {tech.version && (
                                    <>
                                      <span>•</span>
                                      <span>v{tech.version}</span>
                                    </>
                                  )}
                                </div>
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
                  <span className="text-red-800 font-medium">Analysis Failed</span>
                </div>
                <p className="text-red-600 mt-2">{result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <h3 className="font-medium text-cyan-900 mb-2">What we detect</h3>
          <div className="grid md:grid-cols-2 gap-4 text-cyan-800 text-sm">
            <ul className="space-y-1">
              <li>• Content Management Systems (WordPress, Drupal, Shopify)</li>
              <li>• JavaScript Frameworks (React, Vue.js, Angular)</li>
              <li>• CSS Frameworks (Bootstrap, Tailwind CSS)</li>
              <li>• Analytics Tools (Google Analytics, Facebook Pixel)</li>
            </ul>
            <ul className="space-y-1">
              <li>• CDN Services (Cloudflare, AWS CloudFront)</li>
              <li>• Web Servers (Apache, Nginx)</li>
              <li>• JavaScript Libraries (jQuery, Font Awesome)</li>
              <li>• And 50+ other technology categories</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}