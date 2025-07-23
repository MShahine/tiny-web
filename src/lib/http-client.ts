/**
 * HTTP client utilities for fetching external URLs with proper user-agent handling
 */

// User agents for different platforms (for better OpenGraph data)
export const USER_AGENTS = {
  facebook: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  twitter: 'Twitterbot/1.0',
  linkedin: 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
  google: 'Googlebot/2.1 (+http://www.google.com/bot.html)',
  'mobile-bot': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
  default: 'Mozilla/5.0 (compatible; TinyWeb SEO Tool; +https://tinyweb.com/bot)',
} as const;

export type UserAgentType = keyof typeof USER_AGENTS;

export interface FetchOptions {
  userAgent?: UserAgentType;
  timeout?: number;
  maxRedirects?: number;
  maxSize?: number;
  method?: 'GET' | 'HEAD';
  headers?: Record<string, string>;
}

export interface FetchResult {
  success: boolean;
  data?: string;
  headers?: Record<string, string>;
  statusCode?: number;
  error?: string;
  redirectChain?: string[];
  finalUrl?: string;
  responseTime?: number;
}

/**
 * Fetch URL with security and performance considerations
 */
export async function fetchUrl(
  url: string, 
  options: FetchOptions = {}
): Promise<FetchResult> {
  const {
    userAgent = 'default',
    timeout = 10000,
    maxRedirects = 5,
    maxSize = 5 * 1024 * 1024, // 5MB
    method = 'GET',
    headers: customHeaders = {},
  } = options;

  console.log(`fetchUrl called with: ${url}, method: ${method}, maxSize: ${maxSize}`);

  const startTime = Date.now();
  const redirectChain: string[] = [];
  let currentUrl = url;

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const defaultHeaders = {
      'User-Agent': USER_AGENTS[userAgent],
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };

    const response = await fetch(currentUrl, {
      method: method,
      headers: { ...defaultHeaders, ...customHeaders },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    // Check content length
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > maxSize) {
      console.log(`Content-Length check failed: ${contentLength} > ${maxSize}`);
      return {
        success: false,
        error: 'Response too large',
        statusCode: response.status,
      };
    }

    // Get response headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Read response with size limit (skip for HEAD requests)
    let data = '';
    
    if (method !== 'HEAD') {
      const reader = response.body?.getReader();
      if (!reader) {
        return {
          success: false,
          error: 'No response body',
          statusCode: response.status,
        };
      }

      let totalSize = 0;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        totalSize += value.length;
        if (totalSize > maxSize) {
          console.log(`Streaming size check failed: ${totalSize} > ${maxSize}`);
          reader.releaseLock();
          return {
            success: false,
            error: 'Response too large',
            statusCode: response.status,
          };
        }

        data += decoder.decode(value, { stream: true });
      }
    }

    const responseTime = Date.now() - startTime;

    return {
      success: true,
      data,
      headers,
      statusCode: response.status,
      finalUrl: response.url,
      responseTime,
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
          responseTime,
        };
      }
      
      return {
        success: false,
        error: error.message,
        responseTime,
      };
    }

    return {
      success: false,
      error: 'Unknown error occurred',
      responseTime,
    };
  }
}

/**
 * Extract content type from headers
 */
export function getContentType(headers: Record<string, string>): string {
  const contentType = headers['content-type'] || '';
  return contentType.split(';')[0].trim().toLowerCase();
}

/**
 * Check if response is HTML
 */
export function isHtmlContent(headers: Record<string, string>): boolean {
  const contentType = getContentType(headers);
  return contentType.includes('text/html') || contentType.includes('application/xhtml');
}

/**
 * Extract charset from content-type header
 */
export function getCharset(headers: Record<string, string>): string {
  const contentType = headers['content-type'] || '';
  const charsetMatch = contentType.match(/charset=([^;]+)/i);
  return charsetMatch ? charsetMatch[1].trim() : 'utf-8';
}