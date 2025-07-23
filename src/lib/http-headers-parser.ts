/**
 * HTTP Headers Parser and Security Analyzer
 */

export interface SecurityAnalysis {
  score: number; // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  issues: string[];
  recommendations: string[];
  passed: string[];
}

export interface PerformanceAnalysis {
  score: number; // 0-100
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
}

export interface ServerInfo {
  server?: string;
  technology?: string[];
  poweredBy?: string;
  framework?: string;
  language?: string;
  cloudProvider?: string;
}

export interface HeaderData {
  // Raw headers
  rawHeaders: Record<string, string>;
  
  // Status information
  statusCode: number;
  statusText?: string;
  
  // Security headers
  security: {
    hsts?: string;
    csp?: string;
    xFrameOptions?: string;
    xContentTypeOptions?: string;
    xXssProtection?: string;
    referrerPolicy?: string;
    permissionsPolicy?: string;
    crossOriginEmbedderPolicy?: string;
    crossOriginOpenerPolicy?: string;
    crossOriginResourcePolicy?: string;
  };
  
  // Performance headers
  performance: {
    cacheControl?: string;
    expires?: string;
    etag?: string;
    lastModified?: string;
    contentEncoding?: string;
    transferEncoding?: string;
    vary?: string;
    age?: string;
  };
  
  // Content headers
  content: {
    type?: string;
    length?: number;
    encoding?: string;
    language?: string;
    disposition?: string;
  };
  
  // Server information
  server: ServerInfo;
  
  // Analysis results
  securityAnalysis: SecurityAnalysis;
  performanceAnalysis: PerformanceAnalysis;
  
  // Redirect information
  redirects?: {
    location?: string;
    permanent: boolean;
  };
  
  // Timing information
  responseTime?: number;
  
  // Header count
  totalHeaders: number;
}

/**
 * Parse HTTP headers and analyze security/performance
 */
export function parseHttpHeaders(
  headers: Record<string, string>, 
  statusCode: number, 
  responseTime?: number
): HeaderData {
  const result: HeaderData = {
    rawHeaders: headers,
    statusCode,
    security: {},
    performance: {},
    content: {},
    server: {},
    securityAnalysis: {
      score: 0,
      grade: 'F',
      issues: [],
      recommendations: [],
      passed: [],
    },
    performanceAnalysis: {
      score: 0,
      caching: { enabled: false },
      compression: { enabled: false },
      cdn: { detected: false },
    },
    totalHeaders: Object.keys(headers).length,
    responseTime,
  };

  // Normalize header names to lowercase for consistent access
  const normalizedHeaders: Record<string, string> = {};
  Object.entries(headers).forEach(([key, value]) => {
    normalizedHeaders[key.toLowerCase()] = value;
  });

  // Parse security headers
  parseSecurityHeaders(normalizedHeaders, result);
  
  // Parse performance headers
  parsePerformanceHeaders(normalizedHeaders, result);
  
  // Parse content headers
  parseContentHeaders(normalizedHeaders, result);
  
  // Parse server information
  parseServerInfo(normalizedHeaders, result);
  
  // Handle redirects
  if (statusCode >= 300 && statusCode < 400) {
    result.redirects = {
      location: normalizedHeaders['location'],
      permanent: statusCode === 301 || statusCode === 308,
    };
  }

  // Analyze security
  result.securityAnalysis = analyzeSecurityHeaders(result);
  
  // Analyze performance
  result.performanceAnalysis = analyzePerformanceHeaders(result);

  return result;
}

/**
 * Parse security-related headers
 */
function parseSecurityHeaders(headers: Record<string, string>, result: HeaderData) {
  result.security = {
    hsts: headers['strict-transport-security'],
    csp: headers['content-security-policy'],
    xFrameOptions: headers['x-frame-options'],
    xContentTypeOptions: headers['x-content-type-options'],
    xXssProtection: headers['x-xss-protection'],
    referrerPolicy: headers['referrer-policy'],
    permissionsPolicy: headers['permissions-policy'],
    crossOriginEmbedderPolicy: headers['cross-origin-embedder-policy'],
    crossOriginOpenerPolicy: headers['cross-origin-opener-policy'],
    crossOriginResourcePolicy: headers['cross-origin-resource-policy'],
  };
}

/**
 * Parse performance-related headers
 */
function parsePerformanceHeaders(headers: Record<string, string>, result: HeaderData) {
  result.performance = {
    cacheControl: headers['cache-control'],
    expires: headers['expires'],
    etag: headers['etag'],
    lastModified: headers['last-modified'],
    contentEncoding: headers['content-encoding'],
    transferEncoding: headers['transfer-encoding'],
    vary: headers['vary'],
    age: headers['age'],
  };
}

/**
 * Parse content-related headers
 */
function parseContentHeaders(headers: Record<string, string>, result: HeaderData) {
  const contentType = headers['content-type'];
  const contentLength = headers['content-length'];
  
  result.content = {
    type: contentType,
    length: contentLength ? parseInt(contentLength) : undefined,
    encoding: headers['content-encoding'],
    language: headers['content-language'],
    disposition: headers['content-disposition'],
  };
}

/**
 * Parse server and technology information
 */
function parseServerInfo(headers: Record<string, string>, result: HeaderData) {
  const server = headers['server'];
  const poweredBy = headers['x-powered-by'];
  const generator = headers['x-generator'];
  
  result.server = {
    server,
    poweredBy,
    technology: [],
  };

  // Detect technologies from headers
  const technologies: string[] = [];
  
  if (server) {
    if (server.includes('nginx')) technologies.push('Nginx');
    if (server.includes('Apache')) technologies.push('Apache');
    if (server.includes('IIS')) technologies.push('IIS');
    if (server.includes('cloudflare')) technologies.push('Cloudflare');
  }
  
  if (poweredBy) {
    if (poweredBy.includes('Express')) technologies.push('Express.js');
    if (poweredBy.includes('PHP')) technologies.push('PHP');
    if (poweredBy.includes('ASP.NET')) technologies.push('ASP.NET');
    if (poweredBy.includes('Next.js')) technologies.push('Next.js');
  }

  // Detect cloud providers
  if (headers['x-vercel-id']) {
    result.server.cloudProvider = 'Vercel';
    technologies.push('Vercel');
  }
  if (headers['x-amz-cf-id']) {
    result.server.cloudProvider = 'AWS CloudFront';
    technologies.push('AWS');
  }
  if (headers['cf-ray']) {
    result.server.cloudProvider = 'Cloudflare';
    technologies.push('Cloudflare');
  }
  if (headers['x-azure-ref']) {
    result.server.cloudProvider = 'Azure';
    technologies.push('Azure');
  }

  result.server.technology = technologies;
}

/**
 * Analyze security headers and provide score/recommendations
 */
function analyzeSecurityHeaders(data: HeaderData): SecurityAnalysis {
  const analysis: SecurityAnalysis = {
    score: 0,
    grade: 'F',
    issues: [],
    recommendations: [],
    passed: [],
  };

  let score = 0;
  const maxScore = 100;

  // HSTS (15 points)
  if (data.security.hsts) {
    score += 15;
    analysis.passed.push('HSTS (HTTP Strict Transport Security) is enabled');
    
    if (data.security.hsts.includes('includeSubDomains')) {
      score += 5;
      analysis.passed.push('HSTS includes subdomains');
    }
    if (data.security.hsts.includes('preload')) {
      score += 5;
      analysis.passed.push('HSTS preload is enabled');
    }
  } else {
    analysis.issues.push('Missing HSTS header');
    analysis.recommendations.push('Add Strict-Transport-Security header to enforce HTTPS');
  }

  // Content Security Policy (20 points)
  if (data.security.csp) {
    score += 20;
    analysis.passed.push('Content Security Policy is configured');
  } else {
    analysis.issues.push('Missing Content Security Policy');
    analysis.recommendations.push('Add Content-Security-Policy header to prevent XSS attacks');
  }

  // X-Frame-Options (10 points)
  if (data.security.xFrameOptions) {
    score += 10;
    analysis.passed.push('X-Frame-Options is set (clickjacking protection)');
  } else {
    analysis.issues.push('Missing X-Frame-Options header');
    analysis.recommendations.push('Add X-Frame-Options header to prevent clickjacking');
  }

  // X-Content-Type-Options (10 points)
  if (data.security.xContentTypeOptions === 'nosniff') {
    score += 10;
    analysis.passed.push('X-Content-Type-Options is set to nosniff');
  } else {
    analysis.issues.push('Missing or incorrect X-Content-Type-Options header');
    analysis.recommendations.push('Add X-Content-Type-Options: nosniff header');
  }

  // Referrer Policy (10 points)
  if (data.security.referrerPolicy) {
    score += 10;
    analysis.passed.push('Referrer Policy is configured');
  } else {
    analysis.issues.push('Missing Referrer Policy');
    analysis.recommendations.push('Add Referrer-Policy header to control referrer information');
  }

  // Permissions Policy (10 points)
  if (data.security.permissionsPolicy) {
    score += 10;
    analysis.passed.push('Permissions Policy is configured');
  } else {
    analysis.recommendations.push('Consider adding Permissions-Policy header for enhanced security');
  }

  // Cross-Origin headers (10 points total)
  let crossOriginScore = 0;
  if (data.security.crossOriginEmbedderPolicy) crossOriginScore += 3;
  if (data.security.crossOriginOpenerPolicy) crossOriginScore += 3;
  if (data.security.crossOriginResourcePolicy) crossOriginScore += 4;
  
  score += crossOriginScore;
  if (crossOriginScore > 0) {
    analysis.passed.push('Cross-Origin security headers are configured');
  }

  // X-XSS-Protection (deprecated but still checked) (5 points)
  if (data.security.xXssProtection) {
    score += 5;
    analysis.passed.push('X-XSS-Protection header is present');
  }

  // Server information disclosure (-5 points)
  if (data.server.server && !data.server.server.includes('cloudflare')) {
    score -= 5;
    analysis.issues.push('Server header reveals server information');
    analysis.recommendations.push('Consider hiding or minimizing server header information');
  }

  if (data.server.poweredBy) {
    score -= 5;
    analysis.issues.push('X-Powered-By header reveals technology stack');
    analysis.recommendations.push('Remove X-Powered-By header to reduce information disclosure');
  }

  // Calculate final score and grade
  analysis.score = Math.max(0, Math.min(100, score));
  
  if (analysis.score >= 90) analysis.grade = 'A+';
  else if (analysis.score >= 80) analysis.grade = 'A';
  else if (analysis.score >= 70) analysis.grade = 'B';
  else if (analysis.score >= 60) analysis.grade = 'C';
  else if (analysis.score >= 50) analysis.grade = 'D';
  else analysis.grade = 'F';

  return analysis;
}

/**
 * Analyze performance headers
 */
function analyzePerformanceHeaders(data: HeaderData): PerformanceAnalysis {
  const analysis: PerformanceAnalysis = {
    score: 0,
    caching: { enabled: false },
    compression: { enabled: false },
    cdn: { detected: false },
  };

  let score = 0;

  // Caching analysis (40 points)
  if (data.performance.cacheControl) {
    analysis.caching.enabled = true;
    score += 20;
    
    const cacheControl = data.performance.cacheControl.toLowerCase();
    if (cacheControl.includes('max-age=')) {
      const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        analysis.caching.maxAge = parseInt(maxAgeMatch[1]);
        if (analysis.caching.maxAge > 0) {
          score += 10;
        }
      }
    }
    
    if (!cacheControl.includes('no-cache') && !cacheControl.includes('no-store')) {
      score += 10;
    }
  }

  if (data.performance.etag) {
    analysis.caching.etag = true;
    score += 5;
  }

  if (data.performance.lastModified) {
    analysis.caching.lastModified = true;
    score += 5;
  }

  // Compression analysis (30 points)
  if (data.performance.contentEncoding) {
    analysis.compression.enabled = true;
    analysis.compression.type = data.performance.contentEncoding;
    
    if (data.performance.contentEncoding.includes('gzip')) {
      score += 25;
    } else if (data.performance.contentEncoding.includes('br')) {
      score += 30; // Brotli is better
    } else {
      score += 15;
    }
  }

  // CDN detection (30 points)
  if (data.server.cloudProvider) {
    analysis.cdn.detected = true;
    analysis.cdn.provider = data.server.cloudProvider;
    score += 30;
  }

  analysis.score = Math.min(100, score);
  return analysis;
}

/**
 * Get status code description and recommendations
 */
export function getStatusCodeInfo(statusCode: number): {
  category: string;
  description: string;
  seoImpact: 'positive' | 'neutral' | 'negative';
  recommendations: string[];
} {
  if (statusCode >= 200 && statusCode < 300) {
    return {
      category: 'Success',
      description: 'Request was successful',
      seoImpact: 'positive',
      recommendations: [],
    };
  }
  
  if (statusCode >= 300 && statusCode < 400) {
    return {
      category: 'Redirection',
      description: 'Request was redirected',
      seoImpact: statusCode === 301 || statusCode === 302 ? 'neutral' : 'negative',
      recommendations: [
        statusCode === 302 ? 'Consider using 301 redirect for permanent moves' : '',
        'Minimize redirect chains for better performance',
        'Update internal links to point directly to final destination',
      ].filter(Boolean),
    };
  }
  
  if (statusCode >= 400 && statusCode < 500) {
    return {
      category: 'Client Error',
      description: 'Request contains bad syntax or cannot be fulfilled',
      seoImpact: 'negative',
      recommendations: [
        'Fix broken links and update sitemap',
        'Implement proper 404 error pages',
        'Monitor and fix client errors regularly',
      ],
    };
  }
  
  if (statusCode >= 500) {
    return {
      category: 'Server Error',
      description: 'Server failed to fulfill a valid request',
      seoImpact: 'negative',
      recommendations: [
        'Fix server configuration issues immediately',
        'Monitor server health and uptime',
        'Implement proper error handling',
      ],
    };
  }
  
  return {
    category: 'Unknown',
    description: 'Unknown status code',
    seoImpact: 'negative',
    recommendations: ['Investigate unusual status code'],
  };
}