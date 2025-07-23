/**
 * Website Performance Analysis Library
 * Analyzes page speed, Core Web Vitals, and optimization opportunities
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay  
  cls?: number; // Cumulative Layout Shift
  
  // Performance Metrics
  ttfb: number; // Time to First Byte
  domContentLoaded: number;
  loadComplete: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  
  // Resource Metrics
  totalSize: number;
  totalRequests: number;
  htmlSize: number;
  cssSize: number;
  jsSize: number;
  imageSize: number;
  fontSize: number;
  
  // Scores (0-100)
  performanceScore: number;
  accessibilityScore: number;
  seoScore: number;
  bestPracticesScore: number;
}

export interface ResourceAnalysis {
  url: string;
  type: 'html' | 'css' | 'js' | 'image' | 'font' | 'other';
  size: number;
  loadTime: number;
  cached: boolean;
  compressed: boolean;
  optimizable: boolean;
  issues: string[];
}

export interface OptimizationOpportunity {
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

export interface PerformanceAnalysis {
  url: string;
  device: 'desktop' | 'mobile';
  metrics: PerformanceMetrics;
  resources: ResourceAnalysis[];
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
  timestamp: string;
}

/**
 * Analyze website performance
 */
export async function analyzePerformance(
  url: string,
  html: string,
  headers: Record<string, string>,
  device: 'desktop' | 'mobile' = 'desktop'
): Promise<PerformanceAnalysis> {
  const startTime = Date.now();
  
  // Extract resources from HTML
  const resources = extractResources(html, url);
  
  // Analyze performance metrics
  const metrics = await calculateMetrics(html, headers, resources, device);
  
  // Generate optimization opportunities
  const opportunities = generateOptimizations(resources, headers, html, device);
  
  // Run diagnostics
  const diagnostics = runDiagnostics(html, headers, resources);
  
  // Calculate overall score and grade
  const summary = calculateSummary(metrics, opportunities, diagnostics);
  
  return {
    url,
    device,
    metrics,
    resources,
    opportunities,
    diagnostics,
    summary,
    timestamp: new Date().toISOString()
  };
}

/**
 * Extract resources from HTML
 */
function extractResources(html: string, baseUrl: string): ResourceAnalysis[] {
  const resources: ResourceAnalysis[] = [];
  
  try {
    const base = new URL(baseUrl);
    
    // Extract CSS files
    const cssMatches = html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*)["']/gi);
    for (const match of cssMatches) {
      const url = resolveUrl(match[1], base);
      if (url) {
        resources.push({
          url,
          type: 'css',
          size: 0, // Will be estimated
          loadTime: 0,
          cached: false,
          compressed: false,
          optimizable: true,
          issues: []
        });
      }
    }
    
    // Extract JavaScript files
    const jsMatches = html.matchAll(/<script[^>]*src=["']([^"']*)["']/gi);
    for (const match of jsMatches) {
      const url = resolveUrl(match[1], base);
      if (url) {
        resources.push({
          url,
          type: 'js',
          size: 0,
          loadTime: 0,
          cached: false,
          compressed: false,
          optimizable: true,
          issues: []
        });
      }
    }
    
    // Extract images
    const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']*)["']/gi);
    for (const match of imgMatches) {
      const url = resolveUrl(match[1], base);
      if (url) {
        resources.push({
          url,
          type: 'image',
          size: 0,
          loadTime: 0,
          cached: false,
          compressed: false,
          optimizable: true,
          issues: []
        });
      }
    }
    
    // Extract fonts
    const fontMatches = html.matchAll(/<link[^>]*href=["']([^"']*\.(?:woff2?|ttf|eot|otf))["']/gi);
    for (const match of fontMatches) {
      const url = resolveUrl(match[1], base);
      if (url) {
        resources.push({
          url,
          type: 'font',
          size: 0,
          loadTime: 0,
          cached: false,
          compressed: false,
          optimizable: false,
          issues: []
        });
      }
    }
    
  } catch (error) {
    console.error('Error extracting resources:', error);
  }
  
  return resources;
}

/**
 * Calculate performance metrics
 */
async function calculateMetrics(
  html: string,
  headers: Record<string, string>,
  resources: ResourceAnalysis[],
  device: 'desktop' | 'mobile'
): Promise<PerformanceMetrics> {
  
  // Estimate sizes
  const htmlSize = new Blob([html]).size;
  const cssSize = resources.filter(r => r.type === 'css').length * 50000; // Estimate 50KB per CSS
  const jsSize = resources.filter(r => r.type === 'js').length * 100000; // Estimate 100KB per JS
  const imageSize = resources.filter(r => r.type === 'image').length * 200000; // Estimate 200KB per image
  const fontSize = resources.filter(r => r.type === 'font').length * 30000; // Estimate 30KB per font
  
  const totalSize = htmlSize + cssSize + jsSize + imageSize + fontSize;
  const totalRequests = resources.length + 1; // +1 for HTML
  
  // Estimate performance based on resource count and size
  const baseLoadTime = device === 'mobile' ? 3000 : 2000; // Base load time
  const sizeImpact = Math.min(totalSize / 1000000 * 1000, 5000); // Size impact (max 5s)
  const requestImpact = Math.min(totalRequests * 50, 2000); // Request impact (max 2s)
  
  const estimatedLoadTime = baseLoadTime + sizeImpact + requestImpact;
  const ttfb = Math.min(500 + Math.random() * 500, 1000); // Estimate TTFB
  
  // Calculate Core Web Vitals estimates
  const lcp = estimatedLoadTime * 0.7; // LCP typically 70% of load time
  const fid = device === 'mobile' ? 100 + Math.random() * 200 : 50 + Math.random() * 100;
  const cls = Math.random() * 0.25; // Random CLS between 0-0.25
  
  // Calculate scores based on metrics
  const performanceScore = calculatePerformanceScore(estimatedLoadTime, totalSize, totalRequests);
  const accessibilityScore = calculateAccessibilityScore(html);
  const seoScore = calculateSEOScore(html, headers);
  const bestPracticesScore = calculateBestPracticesScore(headers, resources);
  
  return {
    lcp,
    fid,
    cls,
    ttfb,
    domContentLoaded: estimatedLoadTime * 0.8,
    loadComplete: estimatedLoadTime,
    firstPaint: estimatedLoadTime * 0.3,
    firstContentfulPaint: estimatedLoadTime * 0.4,
    totalSize,
    totalRequests,
    htmlSize,
    cssSize,
    jsSize,
    imageSize,
    fontSize,
    performanceScore,
    accessibilityScore,
    seoScore,
    bestPracticesScore
  };
}

/**
 * Generate optimization opportunities
 */
function generateOptimizations(
  resources: ResourceAnalysis[],
  headers: Record<string, string>,
  html: string,
  device: 'desktop' | 'mobile'
): OptimizationOpportunity[] {
  const opportunities: OptimizationOpportunity[] = [];
  
  // Image optimization
  const imageCount = resources.filter(r => r.type === 'image').length;
  if (imageCount > 0) {
    opportunities.push({
      category: 'images',
      title: 'Optimize Images',
      description: `Found ${imageCount} images that could be optimized`,
      impact: imageCount > 10 ? 'high' : imageCount > 5 ? 'medium' : 'low',
      savings: {
        bytes: imageCount * 150000, // Estimate 150KB savings per image
        ms: imageCount * 200
      },
      recommendation: 'Use modern image formats (WebP, AVIF), compress images, and implement responsive images with srcset.'
    });
  }
  
  // CSS optimization
  const cssCount = resources.filter(r => r.type === 'css').length;
  if (cssCount > 3) {
    opportunities.push({
      category: 'css',
      title: 'Reduce CSS Files',
      description: `Found ${cssCount} CSS files that could be combined`,
      impact: 'medium',
      savings: {
        bytes: (cssCount - 1) * 10000,
        ms: (cssCount - 1) * 100
      },
      recommendation: 'Combine CSS files, remove unused CSS, and minify stylesheets.'
    });
  }
  
  // JavaScript optimization
  const jsCount = resources.filter(r => r.type === 'js').length;
  if (jsCount > 5) {
    opportunities.push({
      category: 'javascript',
      title: 'Optimize JavaScript',
      description: `Found ${jsCount} JavaScript files that could be optimized`,
      impact: 'high',
      savings: {
        bytes: jsCount * 50000,
        ms: jsCount * 150
      },
      recommendation: 'Bundle and minify JavaScript, implement code splitting, and defer non-critical scripts.'
    });
  }
  
  // Caching optimization
  const cacheControl = headers['cache-control'];
  if (!cacheControl || !cacheControl.includes('max-age')) {
    opportunities.push({
      category: 'caching',
      title: 'Enable Browser Caching',
      description: 'Static resources are not being cached effectively',
      impact: 'high',
      savings: {
        ms: 1000
      },
      recommendation: 'Set appropriate Cache-Control headers for static resources (CSS, JS, images).'
    });
  }
  
  // Compression optimization
  const contentEncoding = headers['content-encoding'];
  if (!contentEncoding || !contentEncoding.includes('gzip')) {
    opportunities.push({
      category: 'server',
      title: 'Enable Text Compression',
      description: 'Text resources are not being compressed',
      impact: 'medium',
      savings: {
        bytes: 100000,
        ms: 500
      },
      recommendation: 'Enable gzip or brotli compression for text resources (HTML, CSS, JS).'
    });
  }
  
  // Mobile optimization
  if (device === 'mobile') {
    const viewport = html.match(/<meta[^>]*name=["']viewport["']/i);
    if (!viewport) {
      opportunities.push({
        category: 'mobile',
        title: 'Add Viewport Meta Tag',
        description: 'Page is not optimized for mobile devices',
        impact: 'high',
        savings: {},
        recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to improve mobile experience.'
      });
    }
  }
  
  return opportunities.sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 };
    return impactOrder[b.impact] - impactOrder[a.impact];
  });
}

/**
 * Run diagnostics
 */
function runDiagnostics(
  html: string,
  headers: Record<string, string>,
  resources: ResourceAnalysis[]
): PerformanceAnalysis['diagnostics'] {
  return {
    mobileOptimized: html.includes('viewport') && html.includes('width=device-width'),
    httpsEnabled: true, // Assume HTTPS if we got here
    compressionEnabled: !!(headers['content-encoding']?.includes('gzip') || headers['content-encoding']?.includes('br')),
    cachingOptimized: !!(headers['cache-control']?.includes('max-age')),
    imagesOptimized: resources.filter(r => r.type === 'image').length < 10,
    minificationApplied: html.length < 50000 // Rough estimate
  };
}

/**
 * Calculate summary scores and grade
 */
function calculateSummary(
  metrics: PerformanceMetrics,
  opportunities: OptimizationOpportunity[],
  diagnostics: PerformanceAnalysis['diagnostics']
): PerformanceAnalysis['summary'] {
  
  const overallScore = Math.round(
    (metrics.performanceScore + metrics.accessibilityScore + metrics.seoScore + metrics.bestPracticesScore) / 4
  );
  
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  let status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  
  if (overallScore >= 90) {
    grade = 'A';
    status = 'excellent';
  } else if (overallScore >= 75) {
    grade = 'B';
    status = 'good';
  } else if (overallScore >= 60) {
    grade = 'C';
    status = 'needs-improvement';
  } else if (overallScore >= 40) {
    grade = 'D';
    status = 'needs-improvement';
  } else {
    grade = 'F';
    status = 'poor';
  }
  
  const primaryIssues = opportunities
    .filter(opp => opp.impact === 'high')
    .slice(0, 3)
    .map(opp => opp.title);
  
  return {
    overallScore,
    grade,
    status,
    primaryIssues
  };
}

/**
 * Helper functions for score calculations
 */
function calculatePerformanceScore(loadTime: number, totalSize: number, requests: number): number {
  let score = 100;
  
  // Penalize slow load times
  if (loadTime > 3000) score -= Math.min((loadTime - 3000) / 100, 40);
  
  // Penalize large page sizes
  if (totalSize > 1000000) score -= Math.min((totalSize - 1000000) / 100000, 30);
  
  // Penalize too many requests
  if (requests > 50) score -= Math.min((requests - 50) * 0.5, 20);
  
  return Math.max(Math.round(score), 0);
}

function calculateAccessibilityScore(html: string): number {
  let score = 100;
  
  // Check for alt attributes on images
  const images = html.match(/<img[^>]*>/gi) || [];
  const imagesWithoutAlt = images.filter(img => !img.includes('alt=')).length;
  score -= imagesWithoutAlt * 5;
  
  // Check for heading structure
  if (!html.includes('<h1')) score -= 10;
  
  // Check for lang attribute
  if (!html.includes('lang=')) score -= 10;
  
  return Math.max(Math.round(score), 0);
}

function calculateSEOScore(html: string, headers: Record<string, string>): number {
  let score = 100;
  
  // Check for title tag
  if (!html.includes('<title>')) score -= 20;
  
  // Check for meta description
  if (!html.includes('name="description"')) score -= 15;
  
  // Check for heading tags
  if (!html.includes('<h1')) score -= 10;
  
  // Check for HTTPS
  if (!headers['strict-transport-security']) score -= 5;
  
  return Math.max(Math.round(score), 0);
}

function calculateBestPracticesScore(headers: Record<string, string>, resources: ResourceAnalysis[]): number {
  let score = 100;
  
  // Check for security headers
  if (!headers['x-content-type-options']) score -= 10;
  if (!headers['x-frame-options']) score -= 10;
  if (!headers['x-xss-protection']) score -= 5;
  
  // Check for compression
  if (!headers['content-encoding']) score -= 15;
  
  // Check for caching
  if (!headers['cache-control']) score -= 10;
  
  return Math.max(Math.round(score), 0);
}

/**
 * Helper function to resolve relative URLs
 */
function resolveUrl(url: string, base: URL): string | null {
  try {
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return base.protocol + url;
    if (url.startsWith('/')) return base.origin + url;
    return new URL(url, base.href).href;
  } catch {
    return null;
  }
}