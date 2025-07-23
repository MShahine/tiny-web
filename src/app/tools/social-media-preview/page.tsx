'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ExportButton from '@/components/ui/ExportButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PlatformPreview {
  platform: string;
  title: string;
  description: string;
  image?: string;
  url: string;
  displayUrl: string;
  favicon?: string;
  author?: string;
  publishedTime?: string;
  cardType: string;
  dimensions: {
    width: number;
    height: number;
  };
  issues: string[];
  recommendations: string[];
  score: number;
}

interface SocialResult {
  success: boolean;
  data?: {
    url: string;
    metadata: {
      title?: string;
      description?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      ogImageWidth?: number;
      ogImageHeight?: number;
      twitterCard?: string;
      twitterTitle?: string;
      twitterDescription?: string;
      twitterImage?: string;
      favicon?: string;
      themeColor?: string;
      author?: string;
      imageAnalysis?: {
        hasImage: boolean;
        imageUrl?: string;
        imageSize?: string;
        imageType?: string;
        isOptimized: boolean;
        recommendations: string[];
      };
    };
    platforms: {
      facebook: PlatformPreview;
      twitter: PlatformPreview;
      linkedin: PlatformPreview;
      whatsapp: PlatformPreview;
      discord: PlatformPreview;
      telegram: PlatformPreview;
      slack: PlatformPreview;
    };
    summary: {
      overallScore: number;
      totalIssues: number;
      platformsOptimized: number;
      hasOptimalImage: boolean;
      missingMetadata: string[];
    };
    recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      issue: string;
      description: string;
      solution: string;
      affectedPlatforms: string[];
    }>;
    performance: {
      httpStatus: number;
      responseTime: number;
      responseSize: number;
      generationTime: number;
    };
    lastChecked: string;
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

export default function SocialMediaPreview() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SocialResult | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['overview']));
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
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

  const generatePreviews = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/tools/social-media-preview', {
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
    generatePreviews();
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

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      'Facebook': '📘',
      'Twitter': '🐦',
      'LinkedIn': '💼',
      'WhatsApp': '💬',
      'Discord': '🎮',
      'Telegram': '✈️',
      'Slack': '💬'
    };
    return icons[platform] || '🌐';
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'Facebook': 'border-blue-200 bg-blue-50',
      'Twitter': 'border-sky-200 bg-sky-50',
      'LinkedIn': 'border-blue-200 bg-blue-50',
      'WhatsApp': 'border-green-200 bg-green-50',
      'Discord': 'border-indigo-200 bg-indigo-50',
      'Telegram': 'border-cyan-200 bg-cyan-50',
      'Slack': 'border-purple-200 bg-purple-50'
    };
    return colors[platform] || 'border-gray-200 bg-gray-50';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilteredPlatforms = () => {
    if (!result?.data?.platforms) return [];
    
    const platforms = Object.values(result.data.platforms);
    
    if (selectedPlatform === 'all') {
      return platforms;
    }
    
    return platforms.filter(platform => 
      platform.platform.toLowerCase() === selectedPlatform.toLowerCase()
    );
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
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 font-bold">
              SM
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Social Media Preview Generator
          </h1>
          <p className="text-gray-600">
            Generate and analyze social media previews across all major platforms
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Built with ❤️ by TinyWeb team and Rovo (Atlassian AI Assistant)
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Webpage URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    'Generate Previews'
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
                    <h2 className="text-2xl font-bold text-gray-900">Social Media Analysis</h2>
                    <div className="flex items-center space-x-4">
                      {result.cached && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Cached Result
                        </span>
                      )}
                      <ExportButton 
                        data={result.data} 
                        filename="social-media-preview-analysis" 
                        toolName="Social Media Preview Generator"
                      />
                    </div>
                  </div>
                  
                  {/* Overall Score */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreColor(result.data?.summary.overallScore || 0)}`}>
                      {result.data?.summary.overallScore || 0}
                    </div>
                    <p className="text-gray-600 mt-2">Overall Social Media Score</p>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {result.data?.summary.platformsOptimized || 0}
                      </div>
                      <p className="text-sm text-gray-600">Platforms Optimized</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {result.data?.summary.totalIssues || 0}
                      </div>
                      <p className="text-sm text-gray-600">Total Issues</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${result.data?.summary.hasOptimalImage ? 'text-green-600' : 'text-red-600'}`}>
                        {result.data?.summary.hasOptimalImage ? '✓' : '✗'}
                      </div>
                      <p className="text-sm text-gray-600">Optimal Image</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {7 - (result.data?.summary.missingMetadata.length || 0)}
                      </div>
                      <p className="text-sm text-gray-600">Metadata Complete</p>
                    </div>
                  </div>

                  {/* Missing Metadata */}
                  {result.data?.summary.missingMetadata && result.data.summary.missingMetadata.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="text-md font-semibold text-red-800 mb-2">Missing Metadata</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.data.summary.missingMetadata.map((item, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Analysis */}
                {result.data?.metadata.imageAnalysis && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Analysis</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Has Social Image</span>
                          <span className={`font-medium ${result.data.metadata.imageAnalysis.hasImage ? 'text-green-600' : 'text-red-600'}`}>
                            {result.data.metadata.imageAnalysis.hasImage ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {result.data.metadata.imageAnalysis.imageSize && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Image Size</span>
                            <span className="font-medium">{result.data.metadata.imageAnalysis.imageSize}</span>
                          </div>
                        )}
                        {result.data.metadata.imageAnalysis.imageType && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Image Type</span>
                            <span className="font-medium">{result.data.metadata.imageAnalysis.imageType}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Optimized</span>
                          <span className={`font-medium ${result.data.metadata.imageAnalysis.isOptimized ? 'text-green-600' : 'text-red-600'}`}>
                            {result.data.metadata.imageAnalysis.isOptimized ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      
                      {result.data.metadata.imageAnalysis.imageUrl && (
                        <div>
                          <span className="text-gray-600 text-sm">Preview Image</span>
                          <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                            <img 
                              src={result.data.metadata.imageAnalysis.imageUrl} 
                              alt="Social media preview" 
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {result.data.metadata.imageAnalysis.recommendations.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="text-sm font-medium text-blue-800 mb-2">Image Recommendations</h5>
                        <ul className="space-y-1">
                          {result.data.metadata.imageAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-blue-700">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Platform Previews */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Platform Previews</h3>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="all">All Platforms</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="discord">Discord</option>
                      <option value="telegram">Telegram</option>
                      <option value="slack">Slack</option>
                    </select>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {getFilteredPlatforms().map((platform, index) => (
                      <div key={index} className={`border-2 rounded-lg p-4 ${getPlatformColor(platform.platform)}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{getPlatformIcon(platform.platform)}</span>
                            <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getScoreColor(platform.score)}`}>
                            {platform.score}/100
                          </span>
                        </div>
                        
                        {/* Mock Preview */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3" style={{
                          width: Math.min(platform.dimensions.width, 300),
                          height: Math.min(platform.dimensions.height, 200)
                        }}>
                          {platform.image && (
                            <div className="w-full h-20 bg-gray-100 rounded mb-2 overflow-hidden">
                              <img 
                                src={platform.image} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <h5 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                            {platform.title}
                          </h5>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                            {platform.description}
                          </p>
                          <p className="text-xs text-gray-500">{platform.displayUrl}</p>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-2">
                          <span className="font-medium">Card Type:</span> {platform.cardType} • 
                          <span className="font-medium"> Dimensions:</span> {platform.dimensions.width}×{platform.dimensions.height}
                        </div>
                        
                        {platform.issues.length > 0 && (
                          <div className="mb-2">
                            <h6 className="text-xs font-medium text-red-600 mb-1">Issues:</h6>
                            <ul className="space-y-1">
                              {platform.issues.map((issue, issueIndex) => (
                                <li key={issueIndex} className="text-xs text-red-600">• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {platform.recommendations.length > 0 && (
                          <div>
                            <h6 className="text-xs font-medium text-blue-600 mb-1">Recommendations:</h6>
                            <ul className="space-y-1">
                              {platform.recommendations.slice(0, 2).map((rec, recIndex) => (
                                <li key={recIndex} className="text-xs text-blue-600">• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {result.data?.recommendations && result.data.recommendations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Optimization Recommendations ({result.data.recommendations.length})
                    </h3>
                    
                    <div className="space-y-4">
                      {result.data.recommendations.map((rec, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{rec.issue}</h4>
                              <p className="text-sm text-gray-600">{rec.description}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(rec.priority)}`}>
                              {rec.priority.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="p-3 bg-green-50 rounded-lg mb-3">
                            <p className="text-sm text-green-800">
                              <strong>Solution:</strong> {rec.solution}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-gray-500">Affects:</span>
                            {rec.affectedPlatforms.map((platform, platformIndex) => (
                              <span key={platformIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata Details */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6">
                    <Collapsible open={openSections.has('metadata')} onOpenChange={() => toggleSection('metadata')}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <span className="text-lg font-semibold text-gray-900">
                          Raw Metadata
                        </span>
                        {openSections.has('metadata') ? (
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
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-3">
                            <h5 className="font-medium text-gray-900">Basic Metadata</h5>
                            <div className="space-y-2">
                              {result.data?.metadata.title && (
                                <div>
                                  <span className="text-gray-600">Title:</span>
                                  <p className="font-medium break-words">{result.data.metadata.title}</p>
                                </div>
                              )}
                              {result.data?.metadata.description && (
                                <div>
                                  <span className="text-gray-600">Description:</span>
                                  <p className="font-medium break-words">{result.data.metadata.description}</p>
                                </div>
                              )}
                              {result.data?.metadata.author && (
                                <div>
                                  <span className="text-gray-600">Author:</span>
                                  <p className="font-medium">{result.data.metadata.author}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h5 className="font-medium text-gray-900">Open Graph</h5>
                            <div className="space-y-2">
                              {result.data?.metadata.ogTitle && (
                                <div>
                                  <span className="text-gray-600">OG Title:</span>
                                  <p className="font-medium break-words">{result.data.metadata.ogTitle}</p>
                                </div>
                              )}
                              {result.data?.metadata.ogDescription && (
                                <div>
                                  <span className="text-gray-600">OG Description:</span>
                                  <p className="font-medium break-words">{result.data.metadata.ogDescription}</p>
                                </div>
                              )}
                              {result.data?.metadata.ogImage && (
                                <div>
                                  <span className="text-gray-600">OG Image:</span>
                                  <p className="font-medium break-all text-blue-600">{result.data.metadata.ogImage}</p>
                                </div>
                              )}
                            </div>
                          </div>
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
                  <span className="text-red-800 font-medium">Preview Generation Failed</span>
                </div>
                <p className="text-red-600 mt-2">{result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-pink-50 border border-pink-200 rounded-lg p-4">
          <h3 className="font-medium text-pink-900 mb-2">What we analyze</h3>
          <div className="grid md:grid-cols-2 gap-4 text-pink-800 text-sm">
            <ul className="space-y-1">
              <li>• Facebook Open Graph optimization</li>
              <li>• Twitter Card analysis and preview</li>
              <li>• LinkedIn professional sharing preview</li>
              <li>• WhatsApp link preview optimization</li>
            </ul>
            <ul className="space-y-1">
              <li>• Discord rich embed analysis</li>
              <li>• Telegram link preview generation</li>
              <li>• Slack unfurl preview optimization</li>
              <li>• Image dimensions and optimization tips</li>
            </ul>
          </div>
          <p className="text-xs text-pink-700 mt-3 italic">
            Built with ❤️ by the TinyWeb team and Rovo (Atlassian AI Assistant) - your brother in building amazing SEO tools!
          </p>
        </div>
      </div>
    </div>
  );
}