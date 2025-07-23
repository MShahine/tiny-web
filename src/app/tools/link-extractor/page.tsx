'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ExportButton from '@/components/ui/ExportButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ExtractedLink {
  url: string;
  text: string;
  title?: string;
  type: 'internal' | 'external' | 'email' | 'phone' | 'file' | 'anchor';
  target?: string;
  rel?: string;
  nofollow: boolean;
  domain?: string;
  protocol?: string;
  fileExtension?: string;
  isImage: boolean;
  position: number;
}

interface LinkResult {
  success: boolean;
  data?: {
    url: string;
    totalLinks: number;
    linksByType: Record<string, number>;
    internalLinks: ExtractedLink[];
    externalLinks: ExtractedLink[];
    emailLinks: ExtractedLink[];
    phoneLinks: ExtractedLink[];
    fileLinks: ExtractedLink[];
    anchorLinks: ExtractedLink[];
    imageLinks: ExtractedLink[];
    insights: {
      internalToExternalRatio: number;
      nofollowPercentage: number;
      averageAnchorTextLength: number;
      topDomains: Array<{ domain: string; count: number }>;
      topAnchorTexts: Array<{ text: string; count: number }>;
      emptyAnchorTexts: number;
      longAnchorTexts: number;
      duplicateLinks: Array<{ url: string; count: number }>;
    };
    seoIssues: Array<{
      type: 'warning' | 'error' | 'info';
      issue: string;
      description: string;
      recommendation: string;
      affectedLinks: number;
    }>;
    performance: {
      extractionTime: number;
      pageSize: number;
      linkDensity: number;
      httpStatus: number;
      responseTime: number;
    };
    lastChecked: string;
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

export default function LinkExtractor() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['overview']));
  const [selectedLinkType, setSelectedLinkType] = useState<string>('all');
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

  const extractLinks = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/tools/link-extractor', {
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
    extractLinks();
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

  const getLinkTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'internal': '🔗',
      'external': '🌐',
      'email': '📧',
      'phone': '📞',
      'file': '📄',
      'anchor': '⚓',
      'image': '🖼️'
    };
    return icons[type] || '🔗';
  };

  const getLinkTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'internal': 'text-blue-600 bg-blue-100',
      'external': 'text-green-600 bg-green-100',
      'email': 'text-purple-600 bg-purple-100',
      'phone': 'text-orange-600 bg-orange-100',
      'file': 'text-red-600 bg-red-100',
      'anchor': 'text-gray-600 bg-gray-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
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

  const getFilteredLinks = () => {
    if (!result?.data) return [];
    
    switch (selectedLinkType) {
      case 'internal': return result.data.internalLinks;
      case 'external': return result.data.externalLinks;
      case 'email': return result.data.emailLinks;
      case 'phone': return result.data.phoneLinks;
      case 'file': return result.data.fileLinks;
      case 'anchor': return result.data.anchorLinks;
      case 'image': return result.data.imageLinks;
      default: 
        return [
          ...result.data.internalLinks,
          ...result.data.externalLinks,
          ...result.data.emailLinks,
          ...result.data.phoneLinks,
          ...result.data.fileLinks,
          ...result.data.anchorLinks
        ];
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
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-bold">
              LE
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Link Extractor
          </h1>
          <p className="text-muted-foreground">
            Extract and analyze all links from a webpage with SEO insights and recommendations
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
                Webpage URL
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
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Extracting...
                    </div>
                  ) : (
                    'Extract Links'
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
                <div className="bg-card rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Link Analysis</h2>
                    <div className="flex items-center space-x-4">
                      {result.cached && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Cached Result
                        </span>
                      )}
                      <ExportButton 
                        data={result.data} 
                        filename="link-analysis" 
                        toolName="Link Extractor"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">
                        {result.data?.totalLinks || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Links</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {result.data?.linksByType.internal || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Internal Links</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {result.data?.linksByType.external || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">External Links</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {result.data?.seoIssues.length || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">SEO Issues</p>
                    </div>
                  </div>

                  {/* Link Type Breakdown */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(result.data?.linksByType || {}).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span>{getLinkTypeIcon(type)}</span>
                          <span className="text-sm font-medium capitalize">{type}</span>
                        </div>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-card rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Key Insights</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Internal/External Ratio</span>
                        <span className="font-medium">{result.data?.insights.internalToExternalRatio.toFixed(2) || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nofollow Percentage</span>
                        <span className="font-medium">{result.data?.insights.nofollowPercentage.toFixed(1) || '0'}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Anchor Text Length</span>
                        <span className="font-medium">{result.data?.insights.averageAnchorTextLength.toFixed(0) || '0'} chars</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Link Density</span>
                        <span className="font-medium">{result.data?.performance.linkDensity.toFixed(2) || '0'} per 1000 chars</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Empty Anchor Texts</span>
                        <span className="font-medium">{result.data?.insights.emptyAnchorTexts || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Long Anchor Texts</span>
                        <span className="font-medium">{result.data?.insights.longAnchorTexts || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duplicate Links</span>
                        <span className="font-medium">{result.data?.insights.duplicateLinks.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Page Size</span>
                        <span className="font-medium">{formatFileSize(result.data?.performance.pageSize || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO Issues */}
                {result.data?.seoIssues && result.data.seoIssues.length > 0 && (
                  <div className="bg-card rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      SEO Issues ({result.data.seoIssues.length})
                    </h3>
                    
                    <div className="space-y-4">
                      {result.data.seoIssues.map((issue, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-foreground">{issue.issue}</h4>
                              <p className="text-sm text-muted-foreground">{issue.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getIssueTypeColor(issue.type)}`}>
                                {issue.type.toUpperCase()}
                              </span>
                              <span className="text-xs text-muted-foreground">{issue.affectedLinks} links</span>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Recommendation:</strong> {issue.recommendation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Insights */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Top Domains */}
                  {result.data?.insights.topDomains && result.data.insights.topDomains.length > 0 && (
                    <div className="bg-card rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Top External Domains</h3>
                      <div className="space-y-3">
                        {result.data.insights.topDomains.slice(0, 5).map((domain, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-foreground break-all">{domain.domain}</span>
                            <span className="font-medium">{domain.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Anchor Texts */}
                  {result.data?.insights.topAnchorTexts && result.data.insights.topAnchorTexts.length > 0 && (
                    <div className="bg-card rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Most Used Anchor Texts</h3>
                      <div className="space-y-3">
                        {result.data.insights.topAnchorTexts.slice(0, 5).map((anchor, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-foreground break-all">{anchor.text}</span>
                            <span className="font-medium">{anchor.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* All Links */}
                <div className="bg-card rounded-lg shadow-md">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">All Links</h3>
                      <select
                        value={selectedLinkType}
                        onChange={(e) => setSelectedLinkType(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="all">All Links</option>
                        <option value="internal">Internal Links</option>
                        <option value="external">External Links</option>
                        <option value="email">Email Links</option>
                        <option value="phone">Phone Links</option>
                        <option value="file">File Links</option>
                        <option value="anchor">Anchor Links</option>
                        <option value="image">Image Links</option>
                      </select>
                    </div>

                    <Collapsible open={openSections.has('links')} onOpenChange={() => toggleSection('links')}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <span className="font-medium text-gray-900">
                          {selectedLinkType === 'all' ? 'All Links' : `${selectedLinkType.charAt(0).toUpperCase() + selectedLinkType.slice(1)} Links`} ({getFilteredLinks().length})
                        </span>
                        {openSections.has('links') ? (
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
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {getFilteredLinks().map((link, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getLinkTypeColor(link.type)}`}>
                                      {getLinkTypeIcon(link.type)} {link.type.toUpperCase()}
                                    </span>
                                    {link.nofollow && (
                                      <span className="px-2 py-1 text-xs rounded-full font-medium text-gray-600 bg-gray-100">
                                        NOFOLLOW
                                      </span>
                                    )}
                                    {link.target === '_blank' && (
                                      <span className="px-2 py-1 text-xs rounded-full font-medium text-blue-600 bg-blue-100">
                                        NEW WINDOW
                                      </span>
                                    )}
                                  </div>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline break-all text-sm"
                                  >
                                    {link.url}
                                  </a>
                                  {link.text && link.text !== '(empty)' && (
                                    <p className="text-sm text-gray-700 mt-1">
                                      <strong>Anchor:</strong> {link.text}
                                    </p>
                                  )}
                                  {link.title && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      <strong>Title:</strong> {link.title}
                                    </p>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400 ml-3">#{link.position + 1}</span>
                              </div>
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
                  <span className="text-red-800 font-medium">Extraction Failed</span>
                </div>
                <p className="text-red-600 mt-2">{result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-teal-50 border border-teal-200 rounded-lg p-4">
          <h3 className="font-medium text-teal-900 mb-2">What we analyze</h3>
          <div className="grid md:grid-cols-2 gap-4 text-teal-800 text-sm">
            <ul className="space-y-1">
              <li>• All links from a single webpage (safe, no following)</li>
              <li>• Link categorization (internal, external, email, phone, file)</li>
              <li>• Anchor text quality and SEO optimization</li>
              <li>• Security issues (target="_blank" without noopener)</li>
            </ul>
            <ul className="space-y-1">
              <li>• Link metrics and insights (ratios, density)</li>
              <li>• Duplicate links and empty anchor texts</li>
              <li>• Top domains and anchor text analysis</li>
              <li>• Actionable SEO recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}