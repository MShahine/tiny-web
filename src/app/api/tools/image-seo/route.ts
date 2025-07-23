import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

interface ImageAnalysis {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  format: string;
  loading?: string;
  issues: string[];
  recommendations: string[];
  seoScore: number;
}

interface ImageSeoResult {
  url: string;
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  averageFileSize: number;
  largestImage: number;
  formatDistribution: Record<string, number>;
  lazyLoadingUsage: number;
  images: ImageAnalysis[];
  summary: {
    altTextScore: number;
    performanceScore: number;
    formatScore: number;
    lazyLoadingScore: number;
    overallScore: number;
  };
  recommendations: string[];
  lastChecked: string;
}

// Modern image formats that are SEO-friendly
const MODERN_FORMATS = ['webp', 'avif', 'jxl'];
const LEGACY_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'];

// File size thresholds (in bytes)
const SIZE_THRESHOLDS = {
  small: 50 * 1024,    // 50KB
  medium: 200 * 1024,  // 200KB
  large: 500 * 1024,   // 500KB
  huge: 1024 * 1024,   // 1MB
};

function extractImageFormat(src: string): string {
  // Extract format from URL
  const urlFormat = src.split('.').pop()?.split('?')[0]?.toLowerCase();
  if (urlFormat && [...MODERN_FORMATS, ...LEGACY_FORMATS].includes(urlFormat)) {
    return urlFormat;
  }
  
  // Check for data URLs
  if (src.startsWith('data:image/')) {
    const format = src.split('data:image/')[1]?.split(';')[0];
    return format || 'unknown';
  }
  
  return 'unknown';
}

function extractImagesFromHtml(html: string, baseUrl: string): Partial<ImageAnalysis>[] {
  const images: Partial<ImageAnalysis>[] = [];
  
  // More comprehensive regex for img tags
  const imgRegex = /<img[^>]*>/gi;
  const matches = html.match(imgRegex) || [];
  
  matches.forEach(imgTag => {
    // Extract attributes
    const srcMatch = imgTag.match(/src\s*=\s*["']([^"']+)["']/i);
    const altMatch = imgTag.match(/alt\s*=\s*["']([^"']*)["']/i);
    const titleMatch = imgTag.match(/title\s*=\s*["']([^"']*)["']/i);
    const widthMatch = imgTag.match(/width\s*=\s*["']?(\d+)["']?/i);
    const heightMatch = imgTag.match(/height\s*=\s*["']?(\d+)["']?/i);
    const loadingMatch = imgTag.match(/loading\s*=\s*["']([^"']+)["']/i);
    
    if (srcMatch) {
      let src = srcMatch[1];
      
      // Convert relative URLs to absolute
      if (src.startsWith('//')) {
        src = 'https:' + src;
      } else if (src.startsWith('/')) {
        const base = new URL(baseUrl);
        src = base.origin + src;
      } else if (!src.startsWith('http') && !src.startsWith('data:')) {
        try {
          src = new URL(src, baseUrl).toString();
        } catch {
          // Skip invalid URLs
          return;
        }
      }
      
      const format = extractImageFormat(src);
      
      images.push({
        src,
        alt: altMatch ? altMatch[1] : '',
        title: titleMatch ? titleMatch[1] : undefined,
        width: widthMatch ? parseInt(widthMatch[1]) : undefined,
        height: heightMatch ? parseInt(heightMatch[1]) : undefined,
        format,
        loading: loadingMatch ? loadingMatch[1] : undefined,
      });
    }
  });
  
  return images;
}

async function getImageFileSize(url: string): Promise<number | undefined> {
  try {
    // Skip data URLs and very long URLs
    if (url.startsWith('data:') || url.length > 2000) {
      return undefined;
    }
    
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Tools-Bot/1.0)',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength) : undefined;
  } catch {
    return undefined;
  }
}

function analyzeImage(image: Partial<ImageAnalysis>): ImageAnalysis {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;
  
  // Alt text analysis
  if (!image.alt) {
    issues.push('Missing alt text');
    recommendations.push('Add descriptive alt text for accessibility and SEO');
    score -= 30;
  } else if (image.alt.length < 5) {
    issues.push('Alt text too short');
    recommendations.push('Use more descriptive alt text (at least 5 characters)');
    score -= 15;
  } else if (image.alt.length > 125) {
    issues.push('Alt text too long');
    recommendations.push('Keep alt text under 125 characters for better accessibility');
    score -= 10;
  }
  
  // Check for generic alt text
  const genericAltTexts = ['image', 'photo', 'picture', 'img', 'untitled'];
  if (image.alt && genericAltTexts.some(generic => 
    image.alt!.toLowerCase().includes(generic) && image.alt!.length < 20
  )) {
    issues.push('Generic alt text detected');
    recommendations.push('Use specific, descriptive alt text instead of generic terms');
    score -= 20;
  }
  
  // Format analysis
  if (image.format && LEGACY_FORMATS.includes(image.format)) {
    if (image.format === 'png' && (!image.width || !image.height || (image.width * image.height > 100000))) {
      issues.push('Large PNG file - consider WebP format');
      recommendations.push('Convert large PNG images to WebP for better compression');
      score -= 15;
    } else if (['jpg', 'jpeg'].includes(image.format)) {
      recommendations.push('Consider using WebP format for better compression and quality');
      score -= 5;
    }
  }
  
  // File size analysis
  if (image.fileSize) {
    if (image.fileSize > SIZE_THRESHOLDS.huge) {
      issues.push(`Very large file size: ${Math.round(image.fileSize / 1024 / 1024 * 10) / 10}MB`);
      recommendations.push('Compress image to reduce file size below 1MB');
      score -= 25;
    } else if (image.fileSize > SIZE_THRESHOLDS.large) {
      issues.push(`Large file size: ${Math.round(image.fileSize / 1024)}KB`);
      recommendations.push('Consider compressing image to improve loading speed');
      score -= 15;
    }
  }
  
  // Dimensions analysis
  if (image.width && image.height) {
    const totalPixels = image.width * image.height;
    if (totalPixels > 4000000) { // > 4MP
      issues.push('Very high resolution image');
      recommendations.push('Resize image to appropriate dimensions for web use');
      score -= 10;
    }
  }
  
  // Lazy loading analysis
  if (!image.loading || image.loading !== 'lazy') {
    recommendations.push('Add loading="lazy" attribute for better performance');
    score -= 5;
  }
  
  // Bonus points for modern formats
  if (image.format && MODERN_FORMATS.includes(image.format)) {
    score += 10;
  }
  
  return {
    src: image.src || '',
    alt: image.alt || '',
    title: image.title,
    width: image.width,
    height: image.height,
    fileSize: image.fileSize,
    format: image.format || 'unknown',
    loading: image.loading,
    issues,
    recommendations,
    seoScore: Math.max(0, Math.min(100, score)),
  };
}

function calculateSummaryScores(images: ImageAnalysis[]): {
  altTextScore: number;
  performanceScore: number;
  formatScore: number;
  lazyLoadingScore: number;
  overallScore: number;
} {
  if (images.length === 0) {
    return {
      altTextScore: 0,
      performanceScore: 0,
      formatScore: 0,
      lazyLoadingScore: 0,
      overallScore: 0,
    };
  }
  
  // Alt text score
  const imagesWithGoodAlt = images.filter(img => 
    img.alt && img.alt.length >= 5 && img.alt.length <= 125
  ).length;
  const altTextScore = Math.round((imagesWithGoodAlt / images.length) * 100);
  
  // Performance score (based on file sizes)
  const imagesWithSize = images.filter(img => img.fileSize);
  const performanceScore = imagesWithSize.length > 0 
    ? Math.round((imagesWithSize.filter(img => 
        img.fileSize! <= SIZE_THRESHOLDS.medium
      ).length / imagesWithSize.length) * 100)
    : 50; // Default score if no size info
  
  // Format score
  const modernFormatImages = images.filter(img => 
    MODERN_FORMATS.includes(img.format)
  ).length;
  const formatScore = Math.round((modernFormatImages / images.length) * 100);
  
  // Lazy loading score
  const lazyLoadImages = images.filter(img => img.loading === 'lazy').length;
  const lazyLoadingScore = Math.round((lazyLoadImages / images.length) * 100);
  
  // Overall score (weighted average)
  const overallScore = Math.round(
    (altTextScore * 0.4) + 
    (performanceScore * 0.3) + 
    (formatScore * 0.2) + 
    (lazyLoadingScore * 0.1)
  );
  
  return {
    altTextScore,
    performanceScore,
    formatScore,
    lazyLoadingScore,
    overallScore,
  };
}

function generateRecommendations(images: ImageAnalysis[], summary: any): string[] {
  const recommendations: string[] = [];
  
  const imagesWithoutAlt = images.filter(img => !img.alt).length;
  const largeImages = images.filter(img => 
    img.fileSize && img.fileSize > SIZE_THRESHOLDS.large
  ).length;
  const legacyFormatImages = images.filter(img => 
    LEGACY_FORMATS.includes(img.format)
  ).length;
  const imagesWithoutLazyLoading = images.filter(img => 
    img.loading !== 'lazy'
  ).length;
  
  if (imagesWithoutAlt > 0) {
    recommendations.push(`Add alt text to ${imagesWithoutAlt} images for better accessibility and SEO`);
  }
  
  if (largeImages > 0) {
    recommendations.push(`Optimize ${largeImages} large images to improve page loading speed`);
  }
  
  if (legacyFormatImages > 0) {
    recommendations.push(`Convert ${legacyFormatImages} images to modern formats (WebP, AVIF) for better compression`);
  }
  
  if (imagesWithoutLazyLoading > 0) {
    recommendations.push(`Add lazy loading to ${imagesWithoutLazyLoading} images to improve initial page load`);
  }
  
  if (summary.overallScore < 60) {
    recommendations.push('Consider implementing a comprehensive image optimization strategy');
  }
  
  if (images.length > 20) {
    recommendations.push('Consider reducing the number of images or implementing image sprites for better performance');
  }
  
  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const rateLimitResult = await checkRateLimit(ip, 'image-seo');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the webpage
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Tools-Bot/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract images from HTML
    const extractedImages = extractImagesFromHtml(html, validUrl.toString());
    
    console.log(`Found ${extractedImages.length} images on ${validUrl.toString()}`);

    // Get file sizes for images (with concurrency limit)
    const BATCH_SIZE = 5;
    const imagesWithSizes: Partial<ImageAnalysis>[] = [];
    
    for (let i = 0; i < extractedImages.length; i += BATCH_SIZE) {
      const batch = extractedImages.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (image) => {
        const fileSize = await getImageFileSize(image.src!);
        return { ...image, fileSize };
      });
      
      const batchResults = await Promise.all(batchPromises);
      imagesWithSizes.push(...batchResults);
    }

    // Analyze each image
    const analyzedImages = imagesWithSizes.map(analyzeImage);

    // Calculate statistics
    const totalImages = analyzedImages.length;
    const imagesWithAlt = analyzedImages.filter(img => img.alt).length;
    const imagesWithoutAlt = totalImages - imagesWithAlt;
    
    const imagesWithFileSize = analyzedImages.filter(img => img.fileSize);
    const averageFileSize = imagesWithFileSize.length > 0
      ? Math.round(imagesWithFileSize.reduce((sum, img) => sum + img.fileSize!, 0) / imagesWithFileSize.length)
      : 0;
    
    const largestImage = imagesWithFileSize.length > 0
      ? Math.max(...imagesWithFileSize.map(img => img.fileSize!))
      : 0;

    // Format distribution
    const formatDistribution: Record<string, number> = {};
    analyzedImages.forEach(img => {
      formatDistribution[img.format] = (formatDistribution[img.format] || 0) + 1;
    });

    // Lazy loading usage
    const lazyLoadingUsage = analyzedImages.filter(img => img.loading === 'lazy').length;

    // Calculate summary scores
    const summary = calculateSummaryScores(analyzedImages);

    // Generate recommendations
    const recommendations = generateRecommendations(analyzedImages, summary);

    const result: ImageSeoResult = {
      url: validUrl.toString(),
      totalImages,
      imagesWithAlt,
      imagesWithoutAlt,
      averageFileSize,
      largestImage,
      formatDistribution,
      lazyLoadingUsage,
      images: analyzedImages,
      summary,
      recommendations,
      lastChecked: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: result,
      cached: false,
      analyzedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Image SEO analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during analysis' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Image SEO Analyzer',
    description: 'Analyze and optimize images for better SEO performance',
    version: '1.0.0',
    endpoints: {
      analyze: {
        method: 'POST',
        description: 'Analyze images on a webpage for SEO optimization',
        parameters: {
          url: 'string (required) - The URL to analyze'
        }
      }
    },
    features: [
      'Alt text analysis and validation',
      'File size and compression analysis',
      'Image format optimization recommendations',
      'Lazy loading detection',
      'Accessibility compliance checking',
      'Performance impact assessment',
      'SEO score calculation',
      'Detailed optimization recommendations'
    ],
    rateLimit: '20 requests per minute'
  });
}