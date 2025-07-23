/**
 * Website Crawler Library
 * Crawls websites to analyze SEO, technical issues, and content
 */

import { fetchUrl, UserAgentType } from './http-client';

export interface CrawlPage {
  url: string;
  title?: string;
  metaDescription?: string;
  h1?: string;
  h2s: string[];
  h3s: string[];
  statusCode: number;
  responseTime: number;
  contentLength: number;
  contentType?: string;
  canonicalUrl?: string;
  metaRobots?: string;
  internalLinks: string[];
  externalLinks: string[];
  images: Array<{
    src: string;
    alt?: string;
    title?: string;
    size?: number;
  }>;
  issues: string[];
  depth: number;
  crawledAt: string;
}

export interface CrawlIssue {
  type: 'error' | 'warning' | 'info';
  category: 'seo' | 'technical' | 'content' | 'performance' | 'accessibility';
  page: string;
  issue: string;
  description: string;
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface CrawlSummary {
  totalPages: number;
  totalIssues: number;
  issuesByType: Record<string, number>;
  issuesByCategory: Record<string, number>;
  averageResponseTime: number;
  largestPages: Array<{ url: string; size: number }>;
  slowestPages: Array<{ url: string; time: number }>;
  duplicateTitles: Array<{ title: string; pages: string[] }>;
  duplicateDescriptions: Array<{ description: string; pages: string[] }>;
  missingTitles: string[];
  missingDescriptions: string[];
  brokenLinks: Array<{ page: string; link: string; status: number }>;
}

export interface CrawlResult {
  startUrl: string;
  pages: CrawlPage[];
  issues: CrawlIssue[];
  summary: CrawlSummary;
  crawlSettings: {
    maxPages: number;
    maxDepth: number;
    respectRobots: boolean;
    followExternalLinks: boolean;
  };
  crawlStats: {
    startTime: string;
    endTime: string;
    duration: number;
    pagesPerSecond: number;
  };
}

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  respectRobots?: boolean;
  followExternalLinks?: boolean;
  delay?: number;
  userAgent?: UserAgentType;
  onProgress?: (progress: { current: number; total: number; currentUrl: string }) => void;
}

/**
 * Crawl a website and analyze SEO/technical issues
 */
export async function crawlWebsite(
  startUrl: string,
  options: CrawlOptions = {}
): Promise<CrawlResult> {
  const {
    maxPages = 100,
    maxDepth = 3,
    respectRobots = true,
    followExternalLinks = false,
    delay = 1000,
    userAgent = 'default',
    onProgress
  } = options;

  const startTime = Date.now();
  const crawledPages: CrawlPage[] = [];
  const crawledUrls = new Set<string>();
  const urlQueue: Array<{ url: string; depth: number }> = [];
  const issues: CrawlIssue[] = [];

  // Normalize start URL
  const normalizedStartUrl = normalizeUrl(startUrl);
  const baseDomain = new URL(normalizedStartUrl).hostname;

  // Add start URL to queue
  urlQueue.push({ url: normalizedStartUrl, depth: 0 });

  console.log(`Starting crawl of ${normalizedStartUrl}`);
  console.log(`Settings: maxPages=${maxPages}, maxDepth=${maxDepth}, respectRobots=${respectRobots}`);

  // Check robots.txt if required
  let robotsRules: string[] = [];
  if (respectRobots) {
    robotsRules = await fetchRobotsRules(normalizedStartUrl, userAgent);
  }

  // Crawl pages
  while (urlQueue.length > 0 && crawledPages.length < maxPages) {
    const { url, depth } = urlQueue.shift()!;

    // Skip if already crawled
    if (crawledUrls.has(url)) continue;

    // Skip if depth exceeded
    if (depth > maxDepth) continue;

    // Skip if blocked by robots.txt
    if (respectRobots && isBlockedByRobots(url, robotsRules)) {
      console.log(`Skipping ${url} - blocked by robots.txt`);
      continue;
    }

    // Report progress
    if (onProgress) {
      onProgress({
        current: crawledPages.length + 1,
        total: Math.min(urlQueue.length + crawledPages.length + 1, maxPages),
        currentUrl: url
      });
    }

    try {
      console.log(`Crawling [${depth}] ${url}`);

      // Fetch page
      const fetchResult = await fetchUrl(url, {
        userAgent,
        timeout: 15000,
        maxSize: 5 * 1024 * 1024, // 5MB
      });

      if (!fetchResult.success) {
        issues.push({
          type: 'error',
          category: 'technical',
          page: url,
          issue: 'Page fetch failed',
          description: `Failed to fetch page: ${fetchResult.error}`,
          recommendation: 'Check if the URL is accessible and the server is responding correctly.',
          severity: 'high'
        });
        continue;
      }

      // Analyze page
      const pageAnalysis = await analyzePage(
        url,
        fetchResult.data!,
        fetchResult.headers || {},
        fetchResult.statusCode || 200,
        depth
      );

      crawledPages.push(pageAnalysis);
      crawledUrls.add(url);

      // Extract and queue internal links
      if (depth < maxDepth) {
        for (const link of pageAnalysis.internalLinks) {
          const absoluteUrl = resolveUrl(link, url);
          if (absoluteUrl && !crawledUrls.has(absoluteUrl)) {
            // Only crawl same domain unless followExternalLinks is true
            const linkDomain = new URL(absoluteUrl).hostname;
            if (followExternalLinks || linkDomain === baseDomain) {
              urlQueue.push({ url: absoluteUrl, depth: depth + 1 });
            }
          }
        }
      }

      // Add delay between requests
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
      issues.push({
        type: 'error',
        category: 'technical',
        page: url,
        issue: 'Crawl error',
        description: `Error occurred while crawling: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendation: 'Check the URL and try again.',
        severity: 'medium'
      });
    }
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log(`Crawl completed: ${crawledPages.length} pages in ${duration}ms`);

  // Analyze crawled data for issues
  const additionalIssues = analyzeForIssues(crawledPages);
  issues.push(...additionalIssues);

  // Generate summary
  const summary = generateCrawlSummary(crawledPages, issues);

  return {
    startUrl: normalizedStartUrl,
    pages: crawledPages,
    issues,
    summary,
    crawlSettings: {
      maxPages,
      maxDepth,
      respectRobots,
      followExternalLinks
    },
    crawlStats: {
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration,
      pagesPerSecond: crawledPages.length / (duration / 1000)
    }
  };
}

/**
 * Analyze a single page
 */
async function analyzePage(
  url: string,
  html: string,
  headers: Record<string, string>,
  statusCode: number,
  depth: number
): Promise<CrawlPage> {
  const startTime = Date.now();
  const issues: string[] = [];

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : undefined;

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const metaDescription = descMatch ? descMatch[1] : undefined;

  // Extract H1
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  const h1 = h1Match ? stripHtml(h1Match[1]) : undefined;

  // Extract H2s and H3s
  const h2Matches = html.matchAll(/<h2[^>]*>([^<]*)<\/h2>/gi);
  const h2s = Array.from(h2Matches).map(match => stripHtml(match[1]));

  const h3Matches = html.matchAll(/<h3[^>]*>([^<]*)<\/h3>/gi);
  const h3s = Array.from(h3Matches).map(match => stripHtml(match[1]));

  // Extract canonical URL
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : undefined;

  // Extract meta robots
  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  const metaRobots = robotsMatch ? robotsMatch[1] : undefined;

  // Extract links
  const linkMatches = html.matchAll(/<a[^>]*href=["']([^"']*)["']/gi);
  const allLinks = Array.from(linkMatches).map(match => match[1]);

  const internalLinks: string[] = [];
  const externalLinks: string[] = [];

  const baseDomain = new URL(url).hostname;

  for (const link of allLinks) {
    try {
      const absoluteUrl = resolveUrl(link, url);
      if (absoluteUrl) {
        const linkDomain = new URL(absoluteUrl).hostname;
        if (linkDomain === baseDomain) {
          internalLinks.push(absoluteUrl);
        } else {
          externalLinks.push(absoluteUrl);
        }
      }
    } catch {
      // Skip invalid URLs
    }
  }

  // Extract images
  const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi);
  const images = Array.from(imgMatches).map(match => {
    const imgTag = match[0];
    const src = match[1];
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    const titleMatch = imgTag.match(/title=["']([^"']*)["']/i);

    return {
      src: resolveUrl(src, url) || src,
      alt: altMatch ? altMatch[1] : undefined,
      title: titleMatch ? titleMatch[1] : undefined
    };
  });

  // Check for common issues
  if (!title) issues.push('Missing title tag');
  if (title && title.length > 60) issues.push('Title tag too long (>60 characters)');
  if (!metaDescription) issues.push('Missing meta description');
  if (metaDescription && metaDescription.length > 160) issues.push('Meta description too long (>160 characters)');
  if (!h1) issues.push('Missing H1 tag');
  if (h2s.length === 0) issues.push('No H2 tags found');
  if (statusCode !== 200) issues.push(`Non-200 status code: ${statusCode}`);

  // Check images without alt text
  const imagesWithoutAlt = images.filter(img => !img.alt).length;
  if (imagesWithoutAlt > 0) {
    issues.push(`${imagesWithoutAlt} images missing alt text`);
  }

  return {
    url,
    title,
    metaDescription,
    h1,
    h2s,
    h3s,
    statusCode,
    responseTime: Date.now() - startTime,
    contentLength: html.length,
    contentType: headers['content-type'],
    canonicalUrl,
    metaRobots,
    internalLinks: [...new Set(internalLinks)], // Remove duplicates
    externalLinks: [...new Set(externalLinks)], // Remove duplicates
    images,
    issues,
    depth,
    crawledAt: new Date().toISOString()
  };
}

/**
 * Analyze crawled pages for additional issues
 */
function analyzeForIssues(pages: CrawlPage[]): CrawlIssue[] {
  const issues: CrawlIssue[] = [];

  // Find duplicate titles
  const titleGroups = groupBy(pages.filter(p => p.title), 'title');
  for (const [title, pageGroup] of Object.entries(titleGroups)) {
    if (pageGroup.length > 1) {
      issues.push({
        type: 'warning',
        category: 'seo',
        page: pageGroup.map(p => p.url).join(', '),
        issue: 'Duplicate title tags',
        description: `${pageGroup.length} pages share the same title: "${title}"`,
        recommendation: 'Each page should have a unique, descriptive title tag.',
        severity: 'medium'
      });
    }
  }

  // Find duplicate meta descriptions
  const descGroups = groupBy(pages.filter(p => p.metaDescription), 'metaDescription');
  for (const [desc, pageGroup] of Object.entries(descGroups)) {
    if (pageGroup.length > 1) {
      issues.push({
        type: 'warning',
        category: 'seo',
        page: pageGroup.map(p => p.url).join(', '),
        issue: 'Duplicate meta descriptions',
        description: `${pageGroup.length} pages share the same meta description`,
        recommendation: 'Each page should have a unique, compelling meta description.',
        severity: 'medium'
      });
    }
  }

  // Find pages with issues
  for (const page of pages) {
    for (const issue of page.issues) {
      issues.push({
        type: 'warning',
        category: 'seo',
        page: page.url,
        issue,
        description: issue,
        recommendation: getRecommendationForIssue(issue),
        severity: getSeverityForIssue(issue)
      });
    }
  }

  return issues;
}

/**
 * Generate crawl summary
 */
function generateCrawlSummary(pages: CrawlPage[], issues: CrawlIssue[]): CrawlSummary {
  const issuesByType = groupBy(issues, 'type');
  const issuesByCategory = groupBy(issues, 'category');

  const averageResponseTime = pages.length > 0
    ? pages.reduce((sum, page) => sum + page.responseTime, 0) / pages.length
    : 0;

  const largestPages = pages
    .sort((a, b) => b.contentLength - a.contentLength)
    .slice(0, 10)
    .map(page => ({ url: page.url, size: page.contentLength }));

  const slowestPages = pages
    .sort((a, b) => b.responseTime - a.responseTime)
    .slice(0, 10)
    .map(page => ({ url: page.url, time: page.responseTime }));

  const duplicateTitles: Array<{ title: string; pages: string[] }> = [];
  const titleGroups = groupBy(pages.filter(p => p.title), 'title');
  for (const [title, pageGroup] of Object.entries(titleGroups)) {
    if (pageGroup.length > 1) {
      duplicateTitles.push({
        title,
        pages: pageGroup.map(p => p.url)
      });
    }
  }

  const duplicateDescriptions: Array<{ description: string; pages: string[] }> = [];
  const descGroups = groupBy(pages.filter(p => p.metaDescription), 'metaDescription');
  for (const [desc, pageGroup] of Object.entries(descGroups)) {
    if (pageGroup.length > 1) {
      duplicateDescriptions.push({
        description: desc,
        pages: pageGroup.map(p => p.url)
      });
    }
  }

  const missingTitles = pages.filter(p => !p.title).map(p => p.url);
  const missingDescriptions = pages.filter(p => !p.metaDescription).map(p => p.url);

  // Find broken internal links (simplified)
  const brokenLinks: Array<{ page: string; link: string; status: number }> = [];
  // This would require additional checking of internal links

  return {
    totalPages: pages.length,
    totalIssues: issues.length,
    issuesByType: Object.fromEntries(
      Object.entries(issuesByType).map(([type, items]) => [type, items.length])
    ),
    issuesByCategory: Object.fromEntries(
      Object.entries(issuesByCategory).map(([category, items]) => [category, items.length])
    ),
    averageResponseTime,
    largestPages,
    slowestPages,
    duplicateTitles,
    duplicateDescriptions,
    missingTitles,
    missingDescriptions,
    brokenLinks
  };
}

/**
 * Helper functions
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    return url;
  }
}

function resolveUrl(url: string, base: string): string | null {
  try {
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return new URL(base).protocol + url;
    if (url.startsWith('/')) return new URL(base).origin + url;
    if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) return null;
    return new URL(url, base).href;
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const value = String(item[key]);
    if (!groups[value]) groups[value] = [];
    groups[value].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

async function fetchRobotsRules(url: string, userAgent: string): Promise<string[]> {
  try {
    const robotsUrl = new URL('/robots.txt', url).href;
    const result = await fetchUrl(robotsUrl, { timeout: 5000, maxSize: 100 * 1024 });

    if (result.success && result.data) {
      // Parse robots.txt for the given user agent
      const lines = result.data.split('\n');
      const rules: string[] = [];
      let currentUserAgent = '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('User-agent:')) {
          currentUserAgent = trimmed.substring(11).trim();
        } else if (trimmed.startsWith('Disallow:') &&
          (currentUserAgent === '*' || currentUserAgent.toLowerCase() === userAgent.toLowerCase())) {
          const path = trimmed.substring(9).trim();
          if (path) rules.push(path);
        }
      }

      return rules;
    }
  } catch (error) {
    console.log('Could not fetch robots.txt:', error);
  }

  return [];
}

function isBlockedByRobots(url: string, rules: string[]): boolean {
  try {
    const path = new URL(url).pathname;
    return rules.some(rule => {
      if (rule === '/') return true;
      if (rule.endsWith('*')) {
        return path.startsWith(rule.slice(0, -1));
      }
      return path.startsWith(rule);
    });
  } catch {
    return false;
  }
}

function getRecommendationForIssue(issue: string): string {
  const recommendations: Record<string, string> = {
    'Missing title tag': 'Add a unique, descriptive title tag (50-60 characters) to help search engines understand the page content.',
    'Title tag too long (>60 characters)': 'Shorten the title tag to 50-60 characters to prevent truncation in search results.',
    'Missing meta description': 'Add a compelling meta description (150-160 characters) to improve click-through rates from search results.',
    'Meta description too long (>160 characters)': 'Shorten the meta description to 150-160 characters to prevent truncation.',
    'Missing H1 tag': 'Add an H1 tag that clearly describes the main topic of the page.',
    'No H2 tags found': 'Use H2 tags to structure your content and improve readability.',
  };

  return recommendations[issue] || 'Review and fix this issue to improve SEO performance.';
}

function getSeverityForIssue(issue: string): 'high' | 'medium' | 'low' {
  const highSeverity = ['Missing title tag', 'Missing H1 tag'];
  const mediumSeverity = ['Missing meta description', 'Title tag too long', 'Meta description too long'];

  if (highSeverity.some(high => issue.includes(high))) return 'high';
  if (mediumSeverity.some(medium => issue.includes(medium))) return 'medium';
  return 'low';
}
