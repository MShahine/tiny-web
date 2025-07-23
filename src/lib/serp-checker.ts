/**
 * SERP (Search Engine Results Page) Checker Library
 * Handles Google and Bing search result parsing
 */

import { fetchUrl } from './http-client';

export interface SerpResult {
  position: number;
  title: string;
  url: string;
  description: string;
  displayUrl: string;
  type: 'organic' | 'featured_snippet' | 'local' | 'image' | 'video' | 'news';
}

export interface SerpFeature {
  type: 'featured_snippet' | 'local_pack' | 'image_pack' | 'video_pack' | 'news' | 'ads';
  position: number;
  content?: string;
  count?: number;
}

export interface SerpAnalysis {
  keyword: string;
  searchEngine: 'google' | 'bing';
  location: string;
  device: 'desktop' | 'mobile';
  totalResults: number;
  results: SerpResult[];
  features: SerpFeature[];
  targetUrl?: string;
  targetPosition?: number;
  targetFound: boolean;
  competitorUrls: string[];
  searchTime: number;
  timestamp: string;
}

export interface SerpCheckOptions {
  keyword: string;
  targetUrl?: string;
  searchEngine?: 'google' | 'bing';
  location?: string;
  device?: 'desktop' | 'mobile';
  maxResults?: number;
}

/**
 * Check SERP rankings for a keyword
 */
export async function checkSerpRanking(options: SerpCheckOptions): Promise<SerpAnalysis> {
  const {
    keyword,
    targetUrl,
    searchEngine = 'google',
    location = 'US',
    device = 'desktop',
    maxResults = 100
  } = options;

  const startTime = Date.now();

  try {
    let searchResults: SerpAnalysis;

    if (searchEngine === 'google') {
      searchResults = await searchGoogle(keyword, location, device, maxResults);
    } else {
      searchResults = await searchBing(keyword, location, device, maxResults);
    }

    // Find target URL in results if provided
    if (targetUrl) {
      const targetDomain = extractDomain(targetUrl);
      const foundResult = searchResults.results.find(result =>
        extractDomain(result.url) === targetDomain
      );

      if (foundResult) {
        searchResults.targetPosition = foundResult.position;
        searchResults.targetFound = true;
        searchResults.targetUrl = foundResult.url;
      } else {
        searchResults.targetFound = false;
      }
    }

    // Extract competitor URLs (top 10 organic results)
    searchResults.competitorUrls = searchResults.results
      .filter(result => result.type === 'organic')
      .slice(0, 10)
      .map(result => result.url);

    searchResults.searchTime = Date.now() - startTime;
    searchResults.timestamp = new Date().toISOString();

    return searchResults;

  } catch (error) {
    console.error('SERP check failed:', error);
    throw new Error(`SERP analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search Google and parse results
 */
async function searchGoogle(
  keyword: string,
  location: string,
  device: string,
  maxResults: number
): Promise<SerpAnalysis> {

  // Construct Google search URL
  const params = new URLSearchParams({
    q: keyword,
    num: Math.min(maxResults, 100).toString(),
    hl: 'en',
    gl: location.toLowerCase(),
    start: '0'
  });

  const searchUrl = `https://www.google.com/search?${params.toString()}`;

  // Use more realistic user agent and headers
  const userAgent = device === 'mobile' ? 'mobile-bot' : 'default';

  console.log('Searching Google for:', keyword);
  console.log('Search URL:', searchUrl);

  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const response = await fetchUrl(searchUrl, {
    userAgent,
    timeout: 30000,
    maxSize: 2 * 1024 * 1024, // 2MB
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    }
  });

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch Google search results');
  }

  console.log('Google response length:', response.data.length);
  console.log('First 500 chars:', response.data.substring(0, 500));

  return parseGoogleResults(response.data, keyword, location, device);
}

/**
 * Search Bing and parse results
 */
async function searchBing(
  keyword: string,
  location: string,
  device: string,
  maxResults: number
): Promise<SerpAnalysis> {

  const params = new URLSearchParams({
    q: keyword,
    count: Math.min(maxResults, 50).toString(),
    mkt: `${location.toLowerCase()}-${location.toLowerCase()}`,
    setlang: 'en'
  });

  const searchUrl = `https://www.bing.com/search?${params.toString()}`;

  const userAgent = device === 'mobile' ? 'google' : 'default';

  console.log('Searching Bing for:', keyword);

  const response = await fetchUrl(searchUrl, {
    userAgent,
    timeout: 30000,
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  if (!response.success || !response.data) {
    throw new Error('Failed to fetch Bing search results');
  }

  return parseBingResults(response.data, keyword, location, device);
}

/**
 * Parse Google search results HTML
 */
function parseGoogleResults(
  html: string,
  keyword: string,
  location: string,
  device: string
): SerpAnalysis {
  const results: SerpResult[] = [];
  const features: SerpFeature[] = [];
  let totalResults = 0;

  try {
    // Extract total results count
    const totalMatch = html.match(/About ([\d,]+) results/i) || html.match(/([\d,]+) results/i);
    if (totalMatch) {
      totalResults = parseInt(totalMatch[1].replace(/,/g, ''));
    }

    // Parse organic results using multiple patterns
    // Google's HTML structure can vary, so we try multiple approaches
    
    let position = 1;
    
    // Debug: Check what we're working with
    console.log('HTML contains /url?q=:', html.includes('/url?q='));
    console.log('HTML contains <h3:', html.includes('<h3'));
    console.log('HTML contains data-ved:', html.includes('data-ved'));
    
    // Multiple patterns to try
    const patterns = [
      // Pattern 1: Google redirect links with h3
      /<a[^>]*href="\/url\?q=([^&"]*)"[^>]*>[\s\S]*?<h3[^>]*>(.*?)<\/h3>/gi,
      
      // Pattern 2: Direct links with h3
      /<a[^>]*href="(https?:\/\/[^"]*)"[^>]*>[\s\S]*?<h3[^>]*>(.*?)<\/h3>/gi,
      
      // Pattern 3: More flexible h3 pattern
      /<h3[^>]*>[\s\S]*?<a[^>]*href="\/url\?q=([^&"]*)"[^>]*>(.*?)<\/a>[\s\S]*?<\/h3>/gi,
      
      // Pattern 4: Very simple link extraction
      /<a[^>]*href="\/url\?q=([^&"]*)"[^>]*[^>]*>(.*?)<\/a>/gi,
      
      // Pattern 5: Look for any external links
      /<a[^>]*href="(https?:\/\/(?!google\.com|googleadservices)[^"]*)"[^>]*>(.*?)<\/a>/gi
    ];
    
    // Try each pattern until we find results
    for (let i = 0; i < patterns.length && results.length === 0; i++) {
      const pattern = patterns[i];
      console.log(`Trying pattern ${i + 1}...`);
      
      let match;
      let tempPosition = 1;
      
      while ((match = pattern.exec(html)) !== null && tempPosition <= 50) {
        try {
          let url, title;
          
          // Handle different match groups based on pattern
          if (match[1] && match[1].startsWith('http')) {
            url = match[1];
            title = match[2];
          } else if (match[1] && !match[1].startsWith('http')) {
            url = decodeURIComponent(match[1]);
            title = match[2];
          } else {
            continue;
          }
          
          title = stripHtml(title || '');
          
          // Validate URL and title
          if (url && url.startsWith('http') && 
              !url.includes('google.com') && 
              !url.includes('googleadservices') &&
              !url.includes('youtube.com/redirect') &&
              title && title.length > 0) {
            
            // Check for duplicates
            const exists = results.find(r => r.url === url);
            if (!exists) {
              results.push({
                position: tempPosition,
                title: title.substring(0, 200),
                url,
                description: 'Description extracted from search results',
                displayUrl: extractDisplayUrl(url),
                type: 'organic'
              });
              tempPosition++;
            }
          }
        } catch (error) {
          console.log(`Error parsing with pattern ${i + 1}:`, error);
        }
      }
      
      console.log(`Pattern ${i + 1} found ${results.length} results`);
      if (results.length > 0) break;
    }
    
    console.log(`Parsed ${results.length} results from Google search`);

    // Detect featured snippets
    if (html.includes('data-attrid="FeaturedSnippet"') || html.includes('featured-snippet')) {
      features.push({
        type: 'featured_snippet',
        position: 0,
        content: 'Featured snippet detected'
      });
    }

    // Detect local pack
    if (html.includes('local-results') || html.includes('maps')) {
      features.push({
        type: 'local_pack',
        position: 1,
        content: 'Local pack detected'
      });
    }

    // Detect image pack
    if (html.includes('image-results') || html.includes('Images for')) {
      features.push({
        type: 'image_pack',
        position: 2,
        content: 'Image pack detected'
      });
    }

  } catch (error) {
    console.error('Error parsing Google results:', error);
  }

  return {
    keyword,
    searchEngine: 'google',
    location,
    device: device as 'desktop' | 'mobile',
    totalResults,
    results,
    features,
    targetFound: false,
    competitorUrls: [],
    searchTime: 0,
    timestamp: new Date().toISOString()
  };
}

/**
 * Parse Bing search results HTML
 */
function parseBingResults(
  html: string,
  keyword: string,
  location: string,
  device: string
): SerpAnalysis {
  const results: SerpResult[] = [];
  const features: SerpFeature[] = [];
  let totalResults = 0;

  try {
    // Extract total results count for Bing
    const totalMatch = html.match(/([\d,]+) results/i);
    if (totalMatch) {
      totalResults = parseInt(totalMatch[1].replace(/,/g, ''));
    }

    // Parse Bing organic results
    const organicPattern = /<li[^>]*class="[^"]*b_algo[^"]*"[^>]*>[\s\S]*?<h2[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>[\s\S]*?<\/h2>[\s\S]*?<p[^>]*>(.*?)<\/p>/gi;

    let match;
    let position = 1;

    while ((match = organicPattern.exec(html)) !== null && position <= 50) {
      const url = match[1];
      const title = stripHtml(match[2]);
      const description = stripHtml(match[3]);

      if (url.startsWith('http')) {
        results.push({
          position,
          title: title.substring(0, 200),
          url,
          description: description.substring(0, 300),
          displayUrl: extractDisplayUrl(url),
          type: 'organic'
        });
        position++;
      }
    }

  } catch (error) {
    console.error('Error parsing Bing results:', error);
  }

  return {
    keyword,
    searchEngine: 'bing',
    location,
    device: device as 'desktop' | 'mobile',
    totalResults,
    results,
    features,
    targetFound: false,
    competitorUrls: [],
    searchTime: 0,
    timestamp: new Date().toISOString()
  };
}

/**
 * Helper functions
 */
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

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function extractDisplayUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname;
  } catch {
    return url;
  }
}
