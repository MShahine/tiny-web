/**
 * Social Media Preview Generator Library
 * Generates previews for how content appears across different social platforms
 * Built with ❤️ by the TinyWeb team and Rovo (Atlassian AI Assistant)
 */

export interface SocialMetadata {
  // Basic metadata
  title?: string;
  description?: string;
  url: string;
  siteName?: string;
  
  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogType?: string;
  ogUrl?: string;
  ogSiteName?: string;
  ogLocale?: string;
  
  // Twitter Card
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  
  // LinkedIn specific
  linkedinTitle?: string;
  linkedinDescription?: string;
  linkedinImage?: string;
  
  // Additional metadata
  favicon?: string;
  themeColor?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  
  // Image analysis
  imageAnalysis?: {
    hasImage: boolean;
    imageUrl?: string;
    imageSize?: string;
    imageType?: string;
    isOptimized: boolean;
    recommendations: string[];
  };
}

export interface PlatformPreview {
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
  score: number; // 0-100
}

export interface SocialPreviewAnalysis {
  url: string;
  metadata: SocialMetadata;
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
  timestamp: string;
}

/**
 * Generate social media previews for all platforms
 */
export async function generateSocialPreviews(
  url: string,
  html: string
): Promise<SocialPreviewAnalysis> {
  
  // Extract all social metadata from HTML
  const metadata = extractSocialMetadata(html, url);
  
  // Generate platform-specific previews
  const platforms = {
    facebook: generateFacebookPreview(metadata),
    twitter: generateTwitterPreview(metadata),
    linkedin: generateLinkedInPreview(metadata),
    whatsapp: generateWhatsAppPreview(metadata),
    discord: generateDiscordPreview(metadata),
    telegram: generateTelegramPreview(metadata),
    slack: generateSlackPreview(metadata)
  };
  
  // Analyze overall performance
  const summary = generateSummary(platforms, metadata);
  
  // Generate recommendations
  const recommendations = generateRecommendations(platforms, metadata);
  
  return {
    url,
    metadata,
    platforms,
    summary,
    recommendations,
    timestamp: new Date().toISOString()
  };
}

/**
 * Extract social metadata from HTML
 */
function extractSocialMetadata(html: string, url: string): SocialMetadata {
  const metadata: SocialMetadata = { url };
  
  // Basic metadata
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) metadata.title = titleMatch[1].trim();
  
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (descMatch) metadata.description = descMatch[1];
  
  // Open Graph metadata
  const ogMatches = html.matchAll(/<meta[^>]*property=["']og:([^"']*)["'][^>]*content=["']([^"']*)["']/gi);
  for (const match of ogMatches) {
    const property = match[1];
    const content = match[2];
    
    switch (property) {
      case 'title': metadata.ogTitle = content; break;
      case 'description': metadata.ogDescription = content; break;
      case 'image': metadata.ogImage = resolveUrl(content, url); break;
      case 'image:width': metadata.ogImageWidth = parseInt(content); break;
      case 'image:height': metadata.ogImageHeight = parseInt(content); break;
      case 'type': metadata.ogType = content; break;
      case 'url': metadata.ogUrl = content; break;
      case 'site_name': metadata.ogSiteName = content; break;
      case 'locale': metadata.ogLocale = content; break;
    }
  }
  
  // Twitter Card metadata
  const twitterMatches = html.matchAll(/<meta[^>]*name=["']twitter:([^"']*)["'][^>]*content=["']([^"']*)["']/gi);
  for (const match of twitterMatches) {
    const property = match[1];
    const content = match[2];
    
    switch (property) {
      case 'card': metadata.twitterCard = content; break;
      case 'title': metadata.twitterTitle = content; break;
      case 'description': metadata.twitterDescription = content; break;
      case 'image': metadata.twitterImage = resolveUrl(content, url); break;
      case 'site': metadata.twitterSite = content; break;
      case 'creator': metadata.twitterCreator = content; break;
    }
  }
  
  // Favicon
  const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*)["']/i);
  if (faviconMatch) metadata.favicon = resolveUrl(faviconMatch[1], url);
  
  // Theme color
  const themeMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']*)["']/i);
  if (themeMatch) metadata.themeColor = themeMatch[1];
  
  // Author
  const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']*)["']/i);
  if (authorMatch) metadata.author = authorMatch[1];
  
  // Analyze image
  metadata.imageAnalysis = analyzeImage(metadata);
  
  return metadata;
}

/**
 * Generate Facebook preview
 */
function generateFacebookPreview(metadata: SocialMetadata): PlatformPreview {
  const title = metadata.ogTitle || metadata.title || 'Untitled';
  const description = metadata.ogDescription || metadata.description || '';
  const image = metadata.ogImage;
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Facebook validation
  if (!metadata.ogTitle) {
    issues.push('Missing og:title');
    recommendations.push('Add og:title meta tag for better Facebook sharing');
  }
  
  if (!metadata.ogDescription) {
    issues.push('Missing og:description');
    recommendations.push('Add og:description meta tag');
  }
  
  if (!metadata.ogImage) {
    issues.push('Missing og:image');
    recommendations.push('Add og:image for visual appeal on Facebook');
  } else {
    // Check image dimensions for Facebook
    if (metadata.ogImageWidth && metadata.ogImageHeight) {
      const ratio = metadata.ogImageWidth / metadata.ogImageHeight;
      if (ratio < 1.91 || ratio > 1.91) {
        recommendations.push('Optimal Facebook image ratio is 1.91:1 (1200x630px)');
      }
    }
  }
  
  if (title.length > 60) {
    issues.push('Title too long for Facebook');
    recommendations.push('Keep title under 60 characters for Facebook');
  }
  
  if (description.length > 160) {
    issues.push('Description too long for Facebook');
    recommendations.push('Keep description under 160 characters for Facebook');
  }
  
  const score = calculateScore(issues, recommendations);
  
  return {
    platform: 'Facebook',
    title: title.substring(0, 60),
    description: description.substring(0, 160),
    image,
    url: metadata.url,
    displayUrl: extractDomain(metadata.url),
    favicon: metadata.favicon,
    cardType: 'Large Image',
    dimensions: { width: 500, height: 261 },
    issues,
    recommendations,
    score
  };
}

/**
 * Generate Twitter preview
 */
function generateTwitterPreview(metadata: SocialMetadata): PlatformPreview {
  const title = metadata.twitterTitle || metadata.ogTitle || metadata.title || 'Untitled';
  const description = metadata.twitterDescription || metadata.ogDescription || metadata.description || '';
  const image = metadata.twitterImage || metadata.ogImage;
  const cardType = metadata.twitterCard || 'summary';
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Twitter validation
  if (!metadata.twitterCard) {
    issues.push('Missing twitter:card');
    recommendations.push('Add twitter:card meta tag (summary_large_image recommended)');
  }
  
  if (!image && cardType !== 'summary') {
    issues.push('Missing image for Twitter card');
    recommendations.push('Add twitter:image for visual Twitter cards');
  }
  
  if (title.length > 70) {
    issues.push('Title too long for Twitter');
    recommendations.push('Keep title under 70 characters for Twitter');
  }
  
  if (description.length > 200) {
    issues.push('Description too long for Twitter');
    recommendations.push('Keep description under 200 characters for Twitter');
  }
  
  const score = calculateScore(issues, recommendations);
  
  return {
    platform: 'Twitter',
    title: title.substring(0, 70),
    description: description.substring(0, 200),
    image,
    url: metadata.url,
    displayUrl: extractDomain(metadata.url),
    author: metadata.twitterCreator,
    cardType: cardType === 'summary_large_image' ? 'Large Image' : 'Summary',
    dimensions: cardType === 'summary_large_image' ? { width: 506, height: 253 } : { width: 506, height: 125 },
    issues,
    recommendations,
    score
  };
}

/**
 * Generate LinkedIn preview
 */
function generateLinkedInPreview(metadata: SocialMetadata): PlatformPreview {
  const title = metadata.ogTitle || metadata.title || 'Untitled';
  const description = metadata.ogDescription || metadata.description || '';
  const image = metadata.ogImage;
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // LinkedIn validation
  if (!metadata.ogTitle) {
    issues.push('Missing og:title for LinkedIn');
    recommendations.push('Add og:title meta tag for LinkedIn sharing');
  }
  
  if (!metadata.ogDescription) {
    issues.push('Missing og:description for LinkedIn');
    recommendations.push('Add og:description meta tag for LinkedIn');
  }
  
  if (!image) {
    issues.push('Missing image for LinkedIn');
    recommendations.push('Add og:image for professional LinkedIn appearance');
  }
  
  if (title.length > 70) {
    recommendations.push('Consider shorter title for LinkedIn (under 70 characters)');
  }
  
  if (description.length > 160) {
    recommendations.push('Consider shorter description for LinkedIn (under 160 characters)');
  }
  
  const score = calculateScore(issues, recommendations);
  
  return {
    platform: 'LinkedIn',
    title: title.substring(0, 70),
    description: description.substring(0, 160),
    image,
    url: metadata.url,
    displayUrl: extractDomain(metadata.url),
    cardType: 'Article',
    dimensions: { width: 520, height: 272 },
    issues,
    recommendations,
    score
  };
}

/**
 * Generate WhatsApp preview
 */
function generateWhatsAppPreview(metadata: SocialMetadata): PlatformPreview {
  const title = metadata.ogTitle || metadata.title || 'Untitled';
  const description = metadata.ogDescription || metadata.description || '';
  const image = metadata.ogImage;
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (!image) {
    recommendations.push('Add og:image for WhatsApp link previews');
  }
  
  const score = calculateScore(issues, recommendations);
  
  return {
    platform: 'WhatsApp',
    title: title.substring(0, 65),
    description: description.substring(0, 120),
    image,
    url: metadata.url,
    displayUrl: extractDomain(metadata.url),
    favicon: metadata.favicon,
    cardType: 'Link Preview',
    dimensions: { width: 360, height: 200 },
    issues,
    recommendations,
    score
  };
}

/**
 * Generate Discord preview
 */
function generateDiscordPreview(metadata: SocialMetadata): PlatformPreview {
  const title = metadata.ogTitle || metadata.title || 'Untitled';
  const description = metadata.ogDescription || metadata.description || '';
  const image = metadata.ogImage;
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (!image) {
    recommendations.push('Add og:image for Discord embeds');
  }
  
  if (!metadata.themeColor) {
    recommendations.push('Add theme-color meta tag for Discord embed accent color');
  }
  
  const score = calculateScore(issues, recommendations);
  
  return {
    platform: 'Discord',
    title: title.substring(0, 256),
    description: description.substring(0, 2048),
    image,
    url: metadata.url,
    displayUrl: extractDomain(metadata.url),
    cardType: 'Rich Embed',
    dimensions: { width: 400, height: 300 },
    issues,
    recommendations,
    score
  };
}

/**
 * Generate Telegram preview
 */
function generateTelegramPreview(metadata: SocialMetadata): PlatformPreview {
  const title = metadata.ogTitle || metadata.title || 'Untitled';
  const description = metadata.ogDescription || metadata.description || '';
  const image = metadata.ogImage;
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  const score = calculateScore(issues, recommendations);
  
  return {
    platform: 'Telegram',
    title: title.substring(0, 100),
    description: description.substring(0, 150),
    image,
    url: metadata.url,
    displayUrl: extractDomain(metadata.url),
    cardType: 'Link Preview',
    dimensions: { width: 380, height: 200 },
    issues,
    recommendations,
    score
  };
}

/**
 * Generate Slack preview
 */
function generateSlackPreview(metadata: SocialMetadata): PlatformPreview {
  const title = metadata.ogTitle || metadata.title || 'Untitled';
  const description = metadata.ogDescription || metadata.description || '';
  const image = metadata.ogImage;
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  const score = calculateScore(issues, recommendations);
  
  return {
    platform: 'Slack',
    title: title.substring(0, 80),
    description: description.substring(0, 160),
    image,
    url: metadata.url,
    displayUrl: extractDomain(metadata.url),
    favicon: metadata.favicon,
    cardType: 'Unfurl',
    dimensions: { width: 360, height: 200 },
    issues,
    recommendations,
    score
  };
}

/**
 * Generate summary analysis
 */
function generateSummary(
  platforms: Record<string, PlatformPreview>,
  metadata: SocialMetadata
): SocialPreviewAnalysis['summary'] {
  
  const platformArray = Object.values(platforms);
  const totalIssues = platformArray.reduce((sum, platform) => sum + platform.issues.length, 0);
  const overallScore = Math.round(platformArray.reduce((sum, platform) => sum + platform.score, 0) / platformArray.length);
  const platformsOptimized = platformArray.filter(platform => platform.score >= 80).length;
  
  const missingMetadata: string[] = [];
  if (!metadata.ogTitle && !metadata.title) missingMetadata.push('Title');
  if (!metadata.ogDescription && !metadata.description) missingMetadata.push('Description');
  if (!metadata.ogImage) missingMetadata.push('Image');
  if (!metadata.twitterCard) missingMetadata.push('Twitter Card');
  if (!metadata.ogType) missingMetadata.push('Content Type');
  
  const hasOptimalImage = !!(metadata.ogImage && metadata.ogImageWidth && metadata.ogImageHeight);
  
  return {
    overallScore,
    totalIssues,
    platformsOptimized,
    hasOptimalImage,
    missingMetadata
  };
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  platforms: Record<string, PlatformPreview>,
  metadata: SocialMetadata
): SocialPreviewAnalysis['recommendations'] {
  
  const recommendations: SocialPreviewAnalysis['recommendations'] = [];
  
  // High priority recommendations
  if (!metadata.ogTitle && !metadata.title) {
    recommendations.push({
      priority: 'high',
      issue: 'Missing Title',
      description: 'No title found for social media sharing',
      solution: 'Add <title> tag and og:title meta tag',
      affectedPlatforms: ['Facebook', 'Twitter', 'LinkedIn', 'WhatsApp', 'Discord']
    });
  }
  
  if (!metadata.ogDescription && !metadata.description) {
    recommendations.push({
      priority: 'high',
      issue: 'Missing Description',
      description: 'No description found for social media sharing',
      solution: 'Add meta description and og:description meta tag',
      affectedPlatforms: ['Facebook', 'Twitter', 'LinkedIn', 'WhatsApp', 'Discord']
    });
  }
  
  if (!metadata.ogImage) {
    recommendations.push({
      priority: 'high',
      issue: 'Missing Social Image',
      description: 'No image specified for social media sharing',
      solution: 'Add og:image meta tag with 1200x630px image',
      affectedPlatforms: ['Facebook', 'Twitter', 'LinkedIn', 'WhatsApp', 'Discord']
    });
  }
  
  // Medium priority recommendations
  if (!metadata.twitterCard) {
    recommendations.push({
      priority: 'medium',
      issue: 'Missing Twitter Card',
      description: 'No Twitter card type specified',
      solution: 'Add <meta name="twitter:card" content="summary_large_image">',
      affectedPlatforms: ['Twitter']
    });
  }
  
  if (!metadata.ogType) {
    recommendations.push({
      priority: 'medium',
      issue: 'Missing Content Type',
      description: 'No Open Graph type specified',
      solution: 'Add <meta property="og:type" content="website">',
      affectedPlatforms: ['Facebook', 'LinkedIn']
    });
  }
  
  // Low priority recommendations
  if (!metadata.themeColor) {
    recommendations.push({
      priority: 'low',
      issue: 'Missing Theme Color',
      description: 'No theme color specified for Discord embeds',
      solution: 'Add <meta name="theme-color" content="#your-brand-color">',
      affectedPlatforms: ['Discord']
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Helper functions
 */
function analyzeImage(metadata: SocialMetadata) {
  const hasImage = !!(metadata.ogImage || metadata.twitterImage);
  const imageUrl = metadata.ogImage || metadata.twitterImage;
  const recommendations: string[] = [];
  
  if (!hasImage) {
    recommendations.push('Add social media image (og:image) for better engagement');
  } else {
    if (!metadata.ogImageWidth || !metadata.ogImageHeight) {
      recommendations.push('Add image dimensions (og:image:width, og:image:height)');
    } else {
      const ratio = metadata.ogImageWidth / metadata.ogImageHeight;
      if (Math.abs(ratio - 1.91) > 0.1) {
        recommendations.push('Optimize image ratio to 1.91:1 (1200x630px) for best results');
      }
    }
  }
  
  return {
    hasImage,
    imageUrl,
    imageSize: metadata.ogImageWidth && metadata.ogImageHeight 
      ? `${metadata.ogImageWidth}x${metadata.ogImageHeight}` 
      : undefined,
    imageType: imageUrl ? imageUrl.split('.').pop()?.toUpperCase() : undefined,
    isOptimized: hasImage && metadata.ogImageWidth === 1200 && metadata.ogImageHeight === 630,
    recommendations
  };
}

function calculateScore(issues: string[], recommendations: string[]): number {
  const issueWeight = 15;
  const recommendationWeight = 5;
  const maxScore = 100;
  
  const deduction = (issues.length * issueWeight) + (recommendations.length * recommendationWeight);
  return Math.max(0, maxScore - deduction);
}

function resolveUrl(url: string, baseUrl: string): string {
  try {
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return new URL(baseUrl).protocol + url;
    if (url.startsWith('/')) return new URL(baseUrl).origin + url;
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}