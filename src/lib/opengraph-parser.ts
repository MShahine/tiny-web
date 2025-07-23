/**
 * OpenGraph and social media metadata parser
 */

export interface OpenGraphData {
  // Basic OpenGraph
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  siteName?: string;
  type?: string;
  locale?: string;
  
  // Twitter Card
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  
  // Additional meta tags
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  
  // Images array for multiple images
  images?: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  
  // Raw meta tags for debugging
  rawTags?: Array<{
    property?: string;
    name?: string;
    content?: string;
  }>;
}

/**
 * Parse HTML and extract OpenGraph and social media metadata
 */
export function parseOpenGraph(html: string, baseUrl?: string): OpenGraphData {
  const result: OpenGraphData = {
    images: [],
    rawTags: [],
  };

  // Simple HTML parser using regex (for production, consider using a proper HTML parser)
  const metaTagRegex = /<meta\s+([^>]*?)>/gi;
  const titleRegex = /<title[^>]*>(.*?)<\/title>/i;
  const linkRegex = /<link\s+([^>]*?)>/gi;

  let match;

  // Extract title tag
  const titleMatch = html.match(titleRegex);
  if (titleMatch) {
    result.metaTitle = decodeHtmlEntities(titleMatch[1].trim());
  }

  // Extract meta tags
  while ((match = metaTagRegex.exec(html)) !== null) {
    const attributes = parseAttributes(match[1]);
    const property = attributes.property?.toLowerCase();
    const name = attributes.name?.toLowerCase();
    const content = attributes.content;

    if (!content) continue;

    // Store raw tag for debugging
    result.rawTags?.push({
      property: attributes.property,
      name: attributes.name,
      content,
    });

    // OpenGraph tags
    if (property?.startsWith('og:')) {
      switch (property) {
        case 'og:title':
          result.title = decodeHtmlEntities(content);
          break;
        case 'og:description':
          result.description = decodeHtmlEntities(content);
          break;
        case 'og:image':
          result.image = resolveUrl(content, baseUrl);
          result.images?.push({ url: resolveUrl(content, baseUrl) });
          break;
        case 'og:image:alt':
          result.imageAlt = decodeHtmlEntities(content);
          if (result.images && result.images.length > 0) {
            result.images[result.images.length - 1].alt = decodeHtmlEntities(content);
          }
          break;
        case 'og:image:width':
          if (result.images && result.images.length > 0) {
            result.images[result.images.length - 1].width = parseInt(content);
          }
          break;
        case 'og:image:height':
          if (result.images && result.images.length > 0) {
            result.images[result.images.length - 1].height = parseInt(content);
          }
          break;
        case 'og:url':
          result.url = resolveUrl(content, baseUrl);
          break;
        case 'og:site_name':
          result.siteName = decodeHtmlEntities(content);
          break;
        case 'og:type':
          result.type = content;
          break;
        case 'og:locale':
          result.locale = content;
          break;
      }
    }

    // Twitter Card tags
    if (name?.startsWith('twitter:')) {
      switch (name) {
        case 'twitter:card':
          result.twitterCard = content;
          break;
        case 'twitter:site':
          result.twitterSite = content;
          break;
        case 'twitter:creator':
          result.twitterCreator = content;
          break;
        case 'twitter:title':
          result.twitterTitle = decodeHtmlEntities(content);
          break;
        case 'twitter:description':
          result.twitterDescription = decodeHtmlEntities(content);
          break;
        case 'twitter:image':
          result.twitterImage = resolveUrl(content, baseUrl);
          break;
      }
    }

    // Standard meta tags
    if (name === 'description') {
      result.metaDescription = decodeHtmlEntities(content);
    }
  }

  // Extract canonical link
  while ((match = linkRegex.exec(html)) !== null) {
    const attributes = parseAttributes(match[1]);
    if (attributes.rel?.toLowerCase() === 'canonical' && attributes.href) {
      result.canonical = resolveUrl(attributes.href, baseUrl);
    }
  }

  // Fallbacks
  if (!result.title && result.metaTitle) {
    result.title = result.metaTitle;
  }
  if (!result.description && result.metaDescription) {
    result.description = result.metaDescription;
  }
  if (!result.twitterTitle && result.title) {
    result.twitterTitle = result.title;
  }
  if (!result.twitterDescription && result.description) {
    result.twitterDescription = result.description;
  }

  return result;
}

/**
 * Parse HTML attributes from a string
 */
function parseAttributes(attributeString: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const regex = /(\w+)=["']([^"']*)["']/g;
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

/**
 * Resolve relative URLs to absolute URLs
 */
function resolveUrl(url: string, baseUrl?: string): string {
  if (!url) return url;
  
  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Protocol relative
  if (url.startsWith('//')) {
    const protocol = baseUrl?.startsWith('https://') ? 'https:' : 'http:';
    return protocol + url;
  }
  
  // Relative URL
  if (baseUrl) {
    try {
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  }
  
  return url;
}

/**
 * Generate preview data for different platforms
 */
export function generatePlatformPreviews(data: OpenGraphData) {
  return {
    facebook: {
      title: data.title || 'No title',
      description: data.description || 'No description',
      image: data.image,
      siteName: data.siteName,
      url: data.url,
    },
    twitter: {
      card: data.twitterCard || 'summary',
      title: data.twitterTitle || data.title || 'No title',
      description: data.twitterDescription || data.description || 'No description',
      image: data.twitterImage || data.image,
      site: data.twitterSite,
      creator: data.twitterCreator,
    },
    linkedin: {
      title: data.title || 'No title',
      description: data.description || 'No description',
      image: data.image,
      siteName: data.siteName,
    },
    general: {
      title: data.title || data.metaTitle || 'No title',
      description: data.description || data.metaDescription || 'No description',
      image: data.image,
      canonical: data.canonical,
      type: data.type,
      locale: data.locale,
    },
  };
}