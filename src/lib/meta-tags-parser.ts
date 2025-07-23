/**
 * Meta Tags Parser and SEO Analyzer
 */

export interface MetaTag {
  name?: string;
  property?: string;
  content?: string;
  httpEquiv?: string;
  charset?: string;
  itemprop?: string;
}

export interface SEOAnalysis {
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
  passed: string[];
}

export interface MetaTagsData {
  // Basic SEO tags
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  robots?: string;
  canonical?: string;
  
  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  ogSiteName?: string;
  
  // Twitter Card
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  
  // Technical SEO
  viewport?: string;
  charset?: string;
  language?: string;
  generator?: string;
  
  // Schema.org
  schemaOrg?: MetaTag[];
  
  // All meta tags
  allTags: MetaTag[];
  
  // SEO Analysis
  seoAnalysis: SEOAnalysis;
  
  // Counts
  totalTags: number;
  duplicateTags: string[];
}

/**
 * Parse HTML and extract all meta tags with SEO analysis
 */
export function parseMetaTags(html: string, url?: string): MetaTagsData {
  const result: MetaTagsData = {
    allTags: [],
    seoAnalysis: {
      score: 0,
      issues: [],
      recommendations: [],
      passed: [],
    },
    totalTags: 0,
    duplicateTags: [],
    schemaOrg: [],
  };

  // Extract title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) {
    result.title = decodeHtmlEntities(titleMatch[1].trim());
  }

  // Extract meta tags
  const metaTagRegex = /<meta\s+([^>]*?)>/gi;
  const linkRegex = /<link\s+([^>]*?)>/gi;
  
  let match;
  const seenTags = new Set<string>();

  // Parse meta tags
  while ((match = metaTagRegex.exec(html)) !== null) {
    const attributes = parseAttributes(match[1]);
    const tag: MetaTag = {};

    // Extract all possible attributes
    if (attributes.name) tag.name = attributes.name.toLowerCase();
    if (attributes.property) tag.property = attributes.property.toLowerCase();
    if (attributes.content) tag.content = decodeHtmlEntities(attributes.content);
    if (attributes['http-equiv']) tag.httpEquiv = attributes['http-equiv'].toLowerCase();
    if (attributes.charset) tag.charset = attributes.charset;
    if (attributes.itemprop) tag.itemprop = attributes.itemprop;

    result.allTags.push(tag);

    // Check for duplicates
    const tagKey = tag.name || tag.property || tag.httpEquiv || 'unknown';
    if (seenTags.has(tagKey)) {
      if (!result.duplicateTags.includes(tagKey)) {
        result.duplicateTags.push(tagKey);
      }
    } else {
      seenTags.add(tagKey);
    }

    // Extract specific meta tags
    if (tag.name) {
      switch (tag.name) {
        case 'description':
          result.description = tag.content;
          break;
        case 'keywords':
          result.keywords = tag.content;
          break;
        case 'author':
          result.author = tag.content;
          break;
        case 'robots':
          result.robots = tag.content;
          break;
        case 'viewport':
          result.viewport = tag.content;
          break;
        case 'generator':
          result.generator = tag.content;
          break;
        case 'twitter:card':
          result.twitterCard = tag.content;
          break;
        case 'twitter:title':
          result.twitterTitle = tag.content;
          break;
        case 'twitter:description':
          result.twitterDescription = tag.content;
          break;
        case 'twitter:image':
          result.twitterImage = tag.content;
          break;
        case 'twitter:site':
          result.twitterSite = tag.content;
          break;
        case 'twitter:creator':
          result.twitterCreator = tag.content;
          break;
      }
    }

    // Open Graph tags
    if (tag.property?.startsWith('og:')) {
      switch (tag.property) {
        case 'og:title':
          result.ogTitle = tag.content;
          break;
        case 'og:description':
          result.ogDescription = tag.content;
          break;
        case 'og:image':
          result.ogImage = tag.content;
          break;
        case 'og:url':
          result.ogUrl = tag.content;
          break;
        case 'og:type':
          result.ogType = tag.content;
          break;
        case 'og:site_name':
          result.ogSiteName = tag.content;
          break;
      }
    }

    // Schema.org microdata
    if (tag.itemprop) {
      result.schemaOrg?.push(tag);
    }

    // Charset and language
    if (tag.charset) {
      result.charset = tag.charset;
    }
    if (tag.httpEquiv === 'content-language') {
      result.language = tag.content;
    }
  }

  // Extract canonical link
  while ((match = linkRegex.exec(html)) !== null) {
    const attributes = parseAttributes(match[1]);
    if (attributes.rel?.toLowerCase() === 'canonical' && attributes.href) {
      result.canonical = attributes.href;
    }
  }

  // Extract language from html tag
  if (!result.language) {
    const htmlLangMatch = html.match(/<html[^>]*lang=["']([^"']*?)["']/i);
    if (htmlLangMatch) {
      result.language = htmlLangMatch[1];
    }
  }

  result.totalTags = result.allTags.length;
  result.seoAnalysis = analyzeSEO(result, url);

  return result;
}

/**
 * Analyze SEO quality of meta tags
 */
function analyzeSEO(data: MetaTagsData, url?: string): SEOAnalysis {
  const analysis: SEOAnalysis = {
    score: 0,
    issues: [],
    recommendations: [],
    passed: [],
  };

  let score = 0;
  const maxScore = 100;

  // Title analysis (20 points)
  if (data.title) {
    if (data.title.length >= 30 && data.title.length <= 60) {
      score += 20;
      analysis.passed.push('Title length is optimal (30-60 characters)');
    } else if (data.title.length < 30) {
      score += 10;
      analysis.issues.push('Title is too short (less than 30 characters)');
      analysis.recommendations.push('Consider making your title longer and more descriptive');
    } else {
      score += 10;
      analysis.issues.push('Title is too long (more than 60 characters)');
      analysis.recommendations.push('Consider shortening your title to under 60 characters');
    }
  } else {
    analysis.issues.push('Missing title tag');
    analysis.recommendations.push('Add a descriptive title tag to your page');
  }

  // Description analysis (20 points)
  if (data.description) {
    if (data.description.length >= 120 && data.description.length <= 160) {
      score += 20;
      analysis.passed.push('Meta description length is optimal (120-160 characters)');
    } else if (data.description.length < 120) {
      score += 10;
      analysis.issues.push('Meta description is too short (less than 120 characters)');
      analysis.recommendations.push('Consider making your meta description longer and more descriptive');
    } else {
      score += 10;
      analysis.issues.push('Meta description is too long (more than 160 characters)');
      analysis.recommendations.push('Consider shortening your meta description to under 160 characters');
    }
  } else {
    analysis.issues.push('Missing meta description');
    analysis.recommendations.push('Add a compelling meta description to improve click-through rates');
  }

  // Viewport (10 points)
  if (data.viewport) {
    score += 10;
    analysis.passed.push('Viewport meta tag is present');
  } else {
    analysis.issues.push('Missing viewport meta tag');
    analysis.recommendations.push('Add viewport meta tag for mobile responsiveness');
  }

  // Charset (5 points)
  if (data.charset) {
    score += 5;
    analysis.passed.push('Character encoding is specified');
  } else {
    analysis.issues.push('Missing charset declaration');
    analysis.recommendations.push('Add charset meta tag (preferably UTF-8)');
  }

  // Canonical URL (10 points)
  if (data.canonical) {
    score += 10;
    analysis.passed.push('Canonical URL is specified');
  } else {
    analysis.issues.push('Missing canonical URL');
    analysis.recommendations.push('Add canonical link to prevent duplicate content issues');
  }

  // Open Graph (15 points)
  let ogScore = 0;
  if (data.ogTitle) ogScore += 5;
  if (data.ogDescription) ogScore += 5;
  if (data.ogImage) ogScore += 5;
  
  score += ogScore;
  if (ogScore === 15) {
    analysis.passed.push('Open Graph tags are complete');
  } else {
    analysis.issues.push('Incomplete Open Graph tags');
    analysis.recommendations.push('Add missing Open Graph tags for better social media sharing');
  }

  // Twitter Card (10 points)
  if (data.twitterCard) {
    score += 10;
    analysis.passed.push('Twitter Card is configured');
  } else {
    analysis.issues.push('Missing Twitter Card configuration');
    analysis.recommendations.push('Add Twitter Card meta tags for better Twitter sharing');
  }

  // Language (5 points)
  if (data.language) {
    score += 5;
    analysis.passed.push('Page language is specified');
  } else {
    analysis.issues.push('Missing language declaration');
    analysis.recommendations.push('Add lang attribute to html tag or http-equiv meta tag');
  }

  // Robots (5 points)
  if (data.robots) {
    score += 5;
    analysis.passed.push('Robots directive is specified');
  } else {
    analysis.recommendations.push('Consider adding robots meta tag if you need specific crawling instructions');
  }

  // Duplicate tags penalty
  if (data.duplicateTags.length > 0) {
    score = Math.max(0, score - (data.duplicateTags.length * 2));
    analysis.issues.push(`Found ${data.duplicateTags.length} duplicate meta tag(s): ${data.duplicateTags.join(', ')}`);
    analysis.recommendations.push('Remove duplicate meta tags');
  }

  analysis.score = Math.round(score);
  return analysis;
}

/**
 * Parse HTML attributes from a string
 */
function parseAttributes(attributeString: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const regex = /(\w+(?:-\w+)*)=["']([^"']*)["']/g;
  let match;

  while ((match = regex.exec(attributeString)) !== null) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };

  return text.replace(/&[#\w]+;/g, (entity) => {
    return entities[entity] || entity;
  });
}