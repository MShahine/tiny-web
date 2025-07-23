'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface OpenGraphResult {
  success: boolean;
  data?: {
    url: string;
    finalUrl?: string;
    statusCode?: number;
    responseTime?: number;
    openGraph: {
      title?: string;
      description?: string;
      image?: string;
      siteName?: string;
      type?: string;
      locale?: string;
      twitterCard?: string;
      twitterSite?: string;
      twitterCreator?: string;
    };
    platforms: {
      facebook: any;
      twitter: any;
      linkedin: any;
      general: any;
    };
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

function OpenGraphToolContent() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OpenGraphResult | null>(null);
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
      const response = await fetch('/api/tools/opengraph', {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            OpenGraph Preview Tool
          </h1>
          <p className="text-muted-foreground">
            Preview how your website appears when shared on social media platforms
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze URL'}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {result.success ? (
              <>
                {/* Status Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-800 font-medium">Analysis Complete</span>
                    </div>
                    <div className="text-sm text-green-600">
                      {result.cached ? 'Cached result' : 'Fresh analysis'} • 
                      Response time: {result.data?.responseTime}ms
                    </div>
                  </div>
                </div>

                {/* Platform Previews */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Facebook Preview */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-blue-600 text-white px-4 py-2 font-medium">
                      Facebook Preview
                    </div>
                    <div className="p-4">
                      {result.data?.openGraph?.image && (
                        <img
                          src={result.data.openGraph.image}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded mb-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {result.data?.platforms?.facebook?.title || 'No title'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {result.data?.platforms?.facebook?.description || 'No description'}
                      </p>
                      <div className="text-xs text-gray-500">
                        {result.data?.platforms?.facebook?.siteName} • {result.data?.url}
                      </div>
                    </div>
                  </div>

                  {/* Twitter Preview */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-blue-400 text-white px-4 py-2 font-medium">
                      Twitter Preview
                    </div>
                    <div className="p-4">
                      {result.data?.openGraph?.image && (
                        <img
                          src={result.data.openGraph.image}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded mb-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {result.data?.platforms?.twitter?.title || 'No title'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {result.data?.platforms?.twitter?.description || 'No description'}
                      </p>
                      <div className="text-xs text-gray-500">
                        Card: {result.data?.platforms?.twitter?.card || 'summary'} • 
                        {result.data?.platforms?.twitter?.site || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Raw Data */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900">Raw OpenGraph Data</h3>
                  </div>
                  <div className="p-4">
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                      {JSON.stringify(result.data?.openGraph, null, 2)}
                    </pre>
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
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How it works</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Fetches your webpage using Facebook's user agent for accurate results</li>
            <li>• Extracts OpenGraph, Twitter Card, and standard meta tags</li>
            <li>• Shows previews for different social media platforms</li>
            <li>• Results are cached for 24 hours for faster subsequent requests</li>
            <li>• Rate limited to 10 requests per minute</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function OpenGraphTool() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <OpenGraphToolContent />
    </Suspense>
  );
}