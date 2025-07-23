'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ExportButton from '@/components/ui/ExportButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SchemaItem {
  type: string;
  properties: Record<string, any>;
  errors: string[];
  warnings: string[];
  valid: boolean;
  richSnippetEligible: boolean;
}

interface SchemaResult {
  success: boolean;
  data?: {
    url: string;
    schemas: SchemaItem[];
    summary: {
      totalSchemas: number;
      validSchemas: number;
      errorCount: number;
      warningCount: number;
      richSnippetEligible: number;
    };
    recommendations: string[];
    seoScore: number;
    lastChecked: string;
  };
  error?: string;
  cached?: boolean;
  analyzedAt?: string;
}

function SchemaMarkupValidatorContent() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SchemaResult | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['overview']));
  const [selectedSchema, setSelectedSchema] = useState<string>('all');
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
      const response = await fetch('/api/tools/schema-markup', {
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
        error: 'Failed to analyze schema markup. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSchemaIcon = (type: string) => {
    const icons: Record<string, string> = {
      'Organization': '🏢',
      'Person': '👤',
      'Product': '📦',
      'Article': '📄',
      'Recipe': '🍳',
      'Event': '📅',
      'LocalBusiness': '🏪',
      'Review': '⭐',
      'FAQ': '❓',
      'BreadcrumbList': '🍞',
      'WebSite': '🌐',
      'WebPage': '📃',
    };
    return icons[type] || '📋';
  };

  const getValidationColor = (schema: SchemaItem) => {
    if (schema.errors.length > 0) return 'text-red-600';
    if (schema.warnings.length > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredSchemas = result?.data?.schemas.filter(schema =>
    selectedSchema === 'all' || schema.type === selectedSchema
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Schema Markup Validator</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Validate structured data and check for rich snippet eligibility
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
                placeholder="https://www.movetomotive.com/products/muscle-milk-genuine-protein-powder-vanilla-creme-32g-protein-494-pound-32-servings-2"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing Schema Markup...' : 'Validate Schema Markup'}
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
                      {result.data.summary.totalSchemas}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Schemas</div>
                  </div>
                  <div className="bg-card rounded-lg border p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {result.data.summary.validSchemas}
                    </div>
                    <div className="text-sm text-muted-foreground">Valid Schemas</div>
                  </div>
                  <div className="bg-card rounded-lg border p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {result.data.summary.errorCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                  <div className="bg-card rounded-lg border p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.data.summary.richSnippetEligible}
                    </div>
                    <div className="text-sm text-muted-foreground">Rich Snippet Eligible</div>
                  </div>
                </div>

                {/* SEO Score */}
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Schema SEO Score</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          result.data.seoScore >= 80 ? 'bg-green-500' :
                          result.data.seoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.data.seoScore}%` }}
                      ></div>
                    </div>
                    <span className="text-2xl font-bold">{result.data.seoScore}/100</span>
                  </div>
                </div>

                {/* Schema Filter */}
                {result.data.schemas.length > 0 && (
                  <div className="bg-card rounded-lg border p-4">
                    <label htmlFor="schema-filter" className="block text-sm font-medium mb-2">
                      Filter by Schema Type
                    </label>
                    <select
                      id="schema-filter"
                      value={selectedSchema}
                      onChange={(e) => setSelectedSchema(e.target.value)}
                      className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">All Schemas ({result.data.schemas.length})</option>
                      {Array.from(new Set(result.data.schemas.map(s => s.type))).map(type => (
                        <option key={type} value={type}>
                          {getSchemaIcon(type)} {type} ({result?.data?.schemas.filter(s => s.type === type).length})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Schema Details */}
                {filteredSchemas.length > 0 && (
                  <Collapsible
                    open={openSections.has('schemas')}
                    onOpenChange={() => toggleSection('schemas')}
                  >
                    <CollapsibleTrigger className="w-full bg-card rounded-lg border p-4 text-left hover:bg-accent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          Schema Markup Details ({filteredSchemas.length})
                        </h3>
                        <span className="text-2xl">
                          {openSections.has('schemas') ? '−' : '+'}
                        </span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-4">
                      {filteredSchemas.map((schema, index) => (
                        <div key={index} className="bg-card rounded-lg border p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{getSchemaIcon(schema.type)}</span>
                              <h4 className="text-lg font-semibold">{schema.type}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                schema.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {schema.valid ? 'Valid' : 'Invalid'}
                              </span>
                              {schema.richSnippetEligible && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  Rich Snippet Eligible
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Properties */}
                          <div className="mb-4">
                            <h5 className="font-medium mb-2">Properties:</h5>
                            <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                              <pre className="text-sm">
                                {JSON.stringify(schema.properties, null, 2)}
                              </pre>
                            </div>
                          </div>

                          {/* Errors */}
                          {schema.errors.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-red-600 mb-2">Errors:</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {schema.errors.map((error, i) => (
                                  <li key={i} className="text-red-600 text-sm">{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Warnings */}
                          {schema.warnings.length > 0 && (
                            <div>
                              <h5 className="font-medium text-yellow-600 mb-2">Warnings:</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {schema.warnings.map((warning, i) => (
                                  <li key={i} className="text-yellow-600 text-sm">{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
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
                          Recommendations ({result.data.recommendations.length})
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
                    filename={`schema-markup-analysis-${new URL(result.data.url).hostname}`}
                    // @ts-ignore
                    title="Schema Markup Analysis Report"
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
          <h2 className="text-2xl font-bold mb-4">About Schema Markup Validator</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What it does:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Detects and validates structured data markup</li>
                <li>• Supports JSON-LD, Microdata, and RDFa formats</li>
                <li>• Checks rich snippet eligibility</li>
                <li>• Provides detailed error and warning reports</li>
                <li>• Calculates schema SEO score</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Why it matters:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Improves search engine understanding</li>
                <li>• Enables rich snippets in search results</li>
                <li>• Increases click-through rates</li>
                <li>• Enhances local SEO performance</li>
                <li>• Supports voice search optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SchemaMarkupValidator() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <SchemaMarkupValidatorContent />
    </Suspense>
  );
}
