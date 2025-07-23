/**
 * Link Extractor Library
 * Safely extracts and analyzes links from a single webpage
 */

export interface ExtractedLink {
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

export interface LinkAnalysis {
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
    linkDensity: number; // Links per 1000 characters
  };
}

/**
 * Extract and analyze all links from a webpage
 */
export async function extractLinks(
  url: string,
  html: string
): Promise<LinkAnalysis> {
  const startTime = Date.now();
  
  try {
    const baseUrl = new URL(url);
    const baseDomain = baseUrl.hostname;
    
    // Extract all links from HTML
    const links = extractLinksFromHTML(html, baseUrl);
    
    // Categorize links
    const categorizedLinks = categorizeLinks(links, baseDomain);
    
    // Generate insights
    const insights = generateInsights(links, categorizedLinks);
    
    // Identify SEO issues
    const seoIssues = identifySEOIssues(links, categorizedLinks);
    
    // Calculate performance metrics
    const performance = {
      extractionTime: Date.now() - startTime,
      pageSize: html.length,
      linkDensity: (links.length / html.length) * 1000
    };
    
    return {
      url,
      totalLinks: links.length,
      linksByType: {
        internal: categorizedLinks.internal.length,
        external: categorizedLinks.external.length,
        email: categorizedLinks.email.length,
        phone: categorizedLinks.phone.length,
        file: categorizedLinks.file.length,
        anchor: categorizedLinks.anchor.length
      },
      internalLinks: categorizedLinks.internal,
      externalLinks: categorizedLinks.external,
      emailLinks: categorizedLinks.email,
      phoneLinks: categorizedLinks.phone,
      fileLinks: categorizedLinks.file,
      anchorLinks: categorizedLinks.anchor,
      imageLinks: links.filter(link => link.isImage),
      insights,
      seoIssues,
      performance
    };
    
  } catch (error) {
    console.error('Error extracting links:', error);
    throw new Error(`Link extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract all links from HTML content
 */
function extractLinksFromHTML(html: string, baseUrl: URL): ExtractedLink[] {
  const links: ExtractedLink[] = [];
  
  // Regular expression to match <a> tags with all attributes
  const linkRegex = /<a\s+([^>]*?)>(.*?)<\/a>/gi;
  
  let match;
  let position = 0;
  
  while ((match = linkRegex.exec(html)) !== null) {
    const attributes = match[1];
    const anchorText = stripHtml(match[2]).trim();
    
    // Extract href attribute
    const hrefMatch = attributes.match(/href=["']([^"']*)["']/i);
    if (!hrefMatch) continue;
    
    const href = hrefMatch[1];
    if (!href || href === '#') continue;
    
    // Extract other attributes
    const titleMatch = attributes.match(/title=["']([^"']*)["']/i);
    const targetMatch = attributes.match(/target=["']([^"']*)["']/i);
    const relMatch = attributes.match(/rel=["']([^"']*)["']/i);
    
    const title = titleMatch ? titleMatch[1] : undefined;
    const target = targetMatch ? targetMatch[1] : undefined;
    const rel = relMatch ? relMatch[1] : undefined;
    const nofollow = rel ? rel.toLowerCase().includes('nofollow') : false;
    
    // Resolve URL
    const resolvedUrl = resolveUrl(href, baseUrl);
    if (!resolvedUrl) continue;
    
    // Determine link type
    const linkType = determineLinkType(resolvedUrl, baseUrl.hostname);
    
    // Check if it's an image link
    const isImage = anchorText.includes('<img') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(resolvedUrl);
    
    // Extract file extension for file links
    let fileExtension: string | undefined;
    if (linkType === 'file') {
      const urlPath = new URL(resolvedUrl).pathname;
      const extensionMatch = urlPath.match(/\.([a-zA-Z0-9]+)$/);
      fileExtension = extensionMatch ? extensionMatch[1].toLowerCase() : undefined;
    }
    
    // Extract domain for external links
    let domain: string | undefined;
    let protocol: string | undefined;
    if (linkType === 'external') {
      try {
        const linkUrl = new URL(resolvedUrl);
        domain = linkUrl.hostname;
        protocol = linkUrl.protocol;
      } catch {
        // Invalid URL
      }
    }
    
    links.push({
      url: resolvedUrl,
      text: anchorText || '(empty)',
      title,
      type: linkType,
      target,
      rel,
      nofollow,
      domain,
      protocol,
      fileExtension,
      isImage,
      position: position++
    });
  }
  
  return links;
}

/**
 * Categorize links by type
 */
function categorizeLinks(links: ExtractedLink[], baseDomain: string) {
  return {
    internal: links.filter(link => link.type === 'internal'),
    external: links.filter(link => link.type === 'external'),
    email: links.filter(link => link.type === 'email'),
    phone: links.filter(link => link.type === 'phone'),
    file: links.filter(link => link.type === 'file'),
    anchor: links.filter(link => link.type === 'anchor')
  };
}

/**
 * Generate insights from extracted links
 */
function generateInsights(
  allLinks: ExtractedLink[],
  categorized: ReturnType<typeof categorizeLinks>
): LinkAnalysis['insights'] {
  
  const totalLinks = allLinks.length;
  const internalCount = categorized.internal.length;
  const externalCount = categorized.external.length;
  
  // Internal to external ratio
  const internalToExternalRatio = externalCount > 0 ? internalCount / externalCount : internalCount;
  
  // Nofollow percentage
  const nofollowCount = allLinks.filter(link => link.nofollow).length;
  const nofollowPercentage = totalLinks > 0 ? (nofollowCount / totalLinks) * 100 : 0;
  
  // Average anchor text length
  const totalAnchorLength = allLinks.reduce((sum, link) => sum + link.text.length, 0);
  const averageAnchorTextLength = totalLinks > 0 ? totalAnchorLength / totalLinks : 0;
  
  // Top domains (external links)
  const domainCounts: Record<string, number> = {};
  categorized.external.forEach(link => {
    if (link.domain) {
      domainCounts[link.domain] = (domainCounts[link.domain] || 0) + 1;
    }
  });
  
  const topDomains = Object.entries(domainCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([domain, count]) => ({ domain, count }));
  
  // Top anchor texts
  const anchorCounts: Record<string, number> = {};
  allLinks.forEach(link => {
    if (link.text && link.text !== '(empty)') {
      const normalizedText = link.text.toLowerCase().trim();
      anchorCounts[normalizedText] = (anchorCounts[normalizedText] || 0) + 1;
    }
  });
  
  const topAnchorTexts = Object.entries(anchorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([text, count]) => ({ text, count }));
  
  // Empty anchor texts
  const emptyAnchorTexts = allLinks.filter(link => 
    !link.text || link.text === '(empty)' || link.text.trim().length === 0
  ).length;
  
  // Long anchor texts (>100 characters)
  const longAnchorTexts = allLinks.filter(link => link.text.length > 100).length;
  
  // Duplicate links
  const urlCounts: Record<string, number> = {};
  allLinks.forEach(link => {
    urlCounts[link.url] = (urlCounts[link.url] || 0) + 1;
  });
  
  const duplicateLinks = Object.entries(urlCounts)
    .filter(([, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([url, count]) => ({ url, count }));
  
  return {
    internalToExternalRatio,
    nofollowPercentage,
    averageAnchorTextLength,
    topDomains,
    topAnchorTexts,
    emptyAnchorTexts,
    longAnchorTexts,
    duplicateLinks
  };
}

/**
 * Identify SEO issues with links
 */
function identifySEOIssues(
  allLinks: ExtractedLink[],
  categorized: ReturnType<typeof categorizeLinks>
): LinkAnalysis['seoIssues'] {
  const issues: LinkAnalysis['seoIssues'] = [];
  
  // Empty anchor texts
  const emptyAnchors = allLinks.filter(link => 
    !link.text || link.text === '(empty)' || link.text.trim().length === 0
  );
  
  if (emptyAnchors.length > 0) {
    issues.push({
      type: 'warning',
      issue: 'Empty Anchor Texts',
      description: `${emptyAnchors.length} links have empty or missing anchor text`,
      recommendation: 'Add descriptive anchor text to improve SEO and accessibility',
      affectedLinks: emptyAnchors.length
    });
  }
  
  // Generic anchor texts
  const genericTexts = ['click here', 'read more', 'more', 'here', 'link', 'this'];
  const genericAnchors = allLinks.filter(link => 
    genericTexts.some(generic => link.text.toLowerCase().includes(generic))
  );
  
  if (genericAnchors.length > 0) {
    issues.push({
      type: 'warning',
      issue: 'Generic Anchor Texts',
      description: `${genericAnchors.length} links use generic anchor text like "click here" or "read more"`,
      recommendation: 'Use descriptive, keyword-rich anchor text that describes the destination',
      affectedLinks: genericAnchors.length
    });
  }
  
  // Too many external links without nofollow
  const externalWithoutNofollow = categorized.external.filter(link => !link.nofollow);
  if (externalWithoutNofollow.length > 10) {
    issues.push({
      type: 'info',
      issue: 'Many External Links Without Nofollow',
      description: `${externalWithoutNofollow.length} external links don't have rel="nofollow"`,
      recommendation: 'Consider adding rel="nofollow" to external links to preserve link equity',
      affectedLinks: externalWithoutNofollow.length
    });
  }
  
  // Very long anchor texts
  const longAnchors = allLinks.filter(link => link.text.length > 100);
  if (longAnchors.length > 0) {
    issues.push({
      type: 'warning',
      issue: 'Very Long Anchor Texts',
      description: `${longAnchors.length} links have anchor text longer than 100 characters`,
      recommendation: 'Keep anchor text concise and descriptive (under 60 characters is ideal)',
      affectedLinks: longAnchors.length
    });
  }
  
  // Links opening in new window without proper attributes
  const newWindowLinks = allLinks.filter(link => 
    link.target === '_blank' && (!link.rel || !link.rel.includes('noopener'))
  );
  
  if (newWindowLinks.length > 0) {
    issues.push({
      type: 'warning',
      issue: 'Security Issue with Target="_blank"',
      description: `${newWindowLinks.length} links open in new window without rel="noopener"`,
      recommendation: 'Add rel="noopener noreferrer" to links with target="_blank" for security',
      affectedLinks: newWindowLinks.length
    });
  }
  
  // Too few internal links
  if (categorized.internal.length < 3 && allLinks.length > 10) {
    issues.push({
      type: 'info',
      issue: 'Few Internal Links',
      description: 'Page has very few internal links which may hurt SEO',
      recommendation: 'Add more internal links to improve site structure and SEO',
      affectedLinks: categorized.internal.length
    });
  }
  
  return issues;
}

/**
 * Helper functions
 */
function resolveUrl(url: string, baseUrl: URL): string | null {
  try {
    // Handle different URL types
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('//')) {
      return baseUrl.protocol + url;
    }
    if (url.startsWith('/')) {
      return baseUrl.origin + url;
    }
    if (url.startsWith('#')) {
      return baseUrl.href + url;
    }
    if (url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url;
    }
    
    // Relative URL
    return new URL(url, baseUrl.href).href;
  } catch {
    return null;
  }
}

function determineLinkType(url: string, baseDomain: string): ExtractedLink['type'] {
  try {
    if (url.startsWith('mailto:')) return 'email';
    if (url.startsWith('tel:')) return 'phone';
    if (url.startsWith('#')) return 'anchor';
    
    const linkUrl = new URL(url);
    
    // Check if it's a file link
    const fileExtensions = [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
      'zip', 'rar', '7z', 'tar', 'gz',
      'mp3', 'mp4', 'avi', 'mov', 'wmv',
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
      'txt', 'csv', 'json', 'xml'
    ];
    
    const pathname = linkUrl.pathname.toLowerCase();
    const hasFileExtension = fileExtensions.some(ext => pathname.endsWith(`.${ext}`));
    
    if (hasFileExtension) return 'file';
    
    // Check if internal or external
    if (linkUrl.hostname === baseDomain) return 'internal';
    
    return 'external';
  } catch {
    return 'external'; // Default for invalid URLs
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
    .replace(/&#39;/g, "'")
    .trim();
}