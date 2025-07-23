import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

interface SchemaItem {
  type: string;
  properties: Record<string, any>;
  errors: string[];
  warnings: string[];
  valid: boolean;
  richSnippetEligible: boolean;
}

interface SchemaResult {
  url: string;
  schemas: SchemaItem[];
  summary: {
    totalSchemas: number;
    validSchemas: number;
    errorCount: number;
    warningCount: number;
    richSnippetEligible: number;
  };
  recommendations: string[];
  seoScore: number;
  lastChecked: string;
}

// Rich snippet eligible schema types
const RICH_SNIPPET_TYPES = [
  'Article', 'Recipe', 'Product', 'Review', 'Event', 'Organization',
  'Person', 'LocalBusiness', 'FAQ', 'HowTo', 'JobPosting', 'Course',
  'Movie', 'Book', 'SoftwareApplication', 'VideoObject', 'BreadcrumbList'
];

// Required properties for common schema types
const REQUIRED_PROPERTIES = {
  'Article': ['headline', 'author', 'datePublished'],
  'Product': ['name', 'description', 'offers'],
  'Recipe': ['name', 'recipeIngredient', 'recipeInstructions'],
  'Event': ['name', 'startDate', 'location'],
  'Organization': ['name'],
  'Person': ['name'],
  'LocalBusiness': ['name', 'address'],
  'Review': ['reviewBody', 'author', 'itemReviewed'],
  'FAQ': ['mainEntity'],
  'BreadcrumbList': ['itemListElement'],
};

function extractJsonLdSchemas(html: string): any[] {
  const schemas: any[] = [];

  // More flexible regex patterns for JSON-LD
  const patterns = [
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis,
    /<script[^>]*type\s*=\s*application\/ld\+json[^>]*>(.*?)<\/script>/gis,
    /<script[^>]*type\s*=\s*"application\/ld\+json"[^>]*>(.*?)<\/script>/gis,
    /<script[^>]*type\s*=\s*'application\/ld\+json'[^>]*>(.*?)<\/script>/gis
  ];

  patterns.forEach((regex, index) => {
    // Reset regex lastIndex to avoid issues with global flag
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(html)) !== null) {
      try {
        const jsonContent = match[1].trim();
        // Clean up common issues
        const cleanedContent = jsonContent
          .replace(/^\s*<!--/, '')
          .replace(/-->\s*$/, '')
          .replace(/^\s*\/\*/, '')
          .replace(/\*\/\s*$/, '')
          .trim();

        if (cleanedContent) {
          const parsed = JSON.parse(cleanedContent);

          if (Array.isArray(parsed)) {
            schemas.push(...parsed);
          } else {
            schemas.push(parsed);
          }
          console.log(`JSON-LD found with pattern ${index + 1}:`, parsed['@type'] || 'Unknown type');
        }
      } catch (error) {
        console.log('JSON-LD parsing error:', error);
        console.log('Failed content preview:', match[1].substring(0, 100) + '...');
      }
    }
  });

  return schemas;
}

function extractMicrodataSchemas(html: string): any[] {
  const schemas: any[] = [];

  // More comprehensive microdata extraction
  const patterns = [
    /itemscope[^>]*itemtype=["']([^"']+)["']/gi,
    /itemscope[^>]*itemtype=([^>\s]+)/gi,
    /itemtype=["']([^"']+)["'][^>]*itemscope/gi
  ];

  const foundTypes = new Set<string>();

  patterns.forEach(regex => {
    let match;
    while ((match = regex.exec(html)) !== null) {
      const itemType = match[1];
      if (!foundTypes.has(itemType)) {
        foundTypes.add(itemType);
        schemas.push({
          '@type': itemType.split('/').pop() || 'Unknown',
          '@context': 'https://schema.org',
          source: 'microdata',
          // Note: Full microdata parsing would require DOM parsing
        });
      }
    }
  });

  return schemas;
}

function validateSchema(schema: any): SchemaItem {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Extract type
  let type = schema['@type'] || 'Unknown';
  if (Array.isArray(type)) {
    type = type[0];
  }

  // Basic validation
  if (!schema['@context']) {
    errors.push('Missing @context property');
  } else if (!schema['@context'].includes('schema.org')) {
    warnings.push('@context should reference schema.org');
  }

  if (!schema['@type']) {
    errors.push('Missing @type property');
  }

  // Check required properties for known types
  const requiredProps = REQUIRED_PROPERTIES[type as keyof typeof REQUIRED_PROPERTIES];
  if (requiredProps) {
    requiredProps.forEach(prop => {
      if (!schema[prop]) {
        errors.push(`Missing required property: ${prop}`);
      }
    });
  }

  // Type-specific validations
  if (type === 'Product' && schema.offers) {
    if (!schema.offers.price && !schema.offers.priceRange) {
      warnings.push('Product offers should include price information');
    }
  }

  if (type === 'Article') {
    if (!schema.image) {
      warnings.push('Article should include an image for better rich snippets');
    }
    if (!schema.dateModified) {
      warnings.push('Article should include dateModified for freshness signals');
    }
  }

  if (type === 'LocalBusiness') {
    if (!schema.telephone) {
      warnings.push('LocalBusiness should include telephone number');
    }
    if (!schema.openingHours) {
      warnings.push('LocalBusiness should include opening hours');
    }
  }

  const valid = errors.length === 0;
  const richSnippetEligible = valid && RICH_SNIPPET_TYPES.includes(type);

  return {
    type,
    properties: schema,
    errors,
    warnings,
    valid,
    richSnippetEligible
  };
}

function generateRecommendations(schemas: SchemaItem[]): string[] {
  const recommendations: string[] = [];

  if (schemas.length === 0) {
    recommendations.push('Add structured data markup to help search engines understand your content');
    recommendations.push('Consider implementing Organization schema for brand information');
    recommendations.push('Add BreadcrumbList schema to improve navigation understanding');
    return recommendations;
  }

  const types = schemas.map(s => s.type);
  const hasErrors = schemas.some(s => s.errors.length > 0);
  const hasWarnings = schemas.some(s => s.warnings.length > 0);

  if (hasErrors) {
    recommendations.push('Fix validation errors to ensure proper schema markup interpretation');
  }

  if (hasWarnings) {
    recommendations.push('Address warnings to improve rich snippet eligibility');
  }

  if (!types.includes('Organization')) {
    recommendations.push('Add Organization schema to establish brand entity');
  }

  if (!types.includes('WebSite')) {
    recommendations.push('Implement WebSite schema with siteNavigationElement for better site understanding');
  }

  if (!types.includes('BreadcrumbList')) {
    recommendations.push('Add BreadcrumbList schema to improve navigation structure');
  }

  const richSnippetEligible = schemas.filter(s => s.richSnippetEligible).length;
  if (richSnippetEligible < schemas.length) {
    recommendations.push('Optimize schema markup for rich snippet eligibility');
  }

  if (schemas.length < 3) {
    recommendations.push('Consider adding more structured data types relevant to your content');
  }

  return recommendations;
}

function calculateSeoScore(schemas: SchemaItem[]): number {
  if (schemas.length === 0) return 0;

  let score = 0;
  const maxScore = 100;

  // Base score for having schemas
  score += Math.min(schemas.length * 10, 30);

  // Valid schemas bonus
  const validSchemas = schemas.filter(s => s.valid).length;
  score += (validSchemas / schemas.length) * 30;

  // Rich snippet eligible bonus
  const richSnippetEligible = schemas.filter(s => s.richSnippetEligible).length;
  score += (richSnippetEligible / schemas.length) * 25;

  // Error penalty
  const totalErrors = schemas.reduce((sum, s) => sum + s.errors.length, 0);
  score -= Math.min(totalErrors * 5, 20);

  // Diversity bonus
  const uniqueTypes = new Set(schemas.map(s => s.type)).size;
  score += Math.min(uniqueTypes * 3, 15);

  return Math.max(0, Math.min(maxScore, Math.round(score)));
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const rateLimitResult = await checkRateLimit(ip, 'schema-markup');
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
      cache: 'no-store', // Ensure fresh content
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract schemas
    const jsonLdSchemas = extractJsonLdSchemas(html);
    const microdataSchemas = extractMicrodataSchemas(html);
    const allSchemas = [...jsonLdSchemas, ...microdataSchemas];

    // Debug logging
    console.log('HTML length:', html.length);
    console.log('JSON-LD schemas found:', jsonLdSchemas.length);
    console.log('Microdata schemas found:', microdataSchemas.length);
    console.log('Total schemas:', allSchemas.length);

    // If no schemas found, check for common schema indicators
    if (allSchemas.length === 0) {
      const hasJsonLdScript = html.includes('application/ld+json');
      const hasMicrodata = html.includes('itemscope') || html.includes('itemtype');
      const hasRDFa = html.includes('typeof=') || html.includes('property=');

      console.log('Schema indicators - JSON-LD script:', hasJsonLdScript, 'Microdata:', hasMicrodata, 'RDFa:', hasRDFa);

      // Additional debugging for JSON-LD
      if (hasJsonLdScript) {
        const scriptMatches = html.match(/<script[^>]*application\/ld\+json[^>]*>/gi);
        console.log('JSON-LD script tags found:', scriptMatches ? scriptMatches.length : 0);
        if (scriptMatches) {
          console.log('First script tag:', scriptMatches[0]);
        }
      }
    }

    // Validate schemas
    const validatedSchemas = allSchemas.map(validateSchema);

    // Generate summary
    const summary = {
      totalSchemas: validatedSchemas.length,
      validSchemas: validatedSchemas.filter(s => s.valid).length,
      errorCount: validatedSchemas.reduce((sum, s) => sum + s.errors.length, 0),
      warningCount: validatedSchemas.reduce((sum, s) => sum + s.warnings.length, 0),
      richSnippetEligible: validatedSchemas.filter(s => s.richSnippetEligible).length,
    };

    // Generate recommendations
    const recommendations = generateRecommendations(validatedSchemas);

    // Calculate SEO score
    const seoScore = calculateSeoScore(validatedSchemas);

    const result: SchemaResult = {
      url: validUrl.toString(),
      schemas: validatedSchemas,
      summary,
      recommendations,
      seoScore,
      lastChecked: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: result,
      cached: false,
      analyzedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Schema markup analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during analysis' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Schema Markup Validator',
    description: 'Validate structured data and check for rich snippet eligibility',
    version: '1.0.0',
    endpoints: {
      validate: {
        method: 'POST',
        description: 'Analyze schema markup on a webpage',
        parameters: {
          url: 'string (required) - The URL to analyze'
        }
      }
    },
    features: [
      'JSON-LD schema detection',
      'Microdata schema extraction',
      'Rich snippet eligibility check',
      'Validation error reporting',
      'SEO score calculation',
      'Schema optimization recommendations'
    ],
    rateLimit: '20 requests per minute'
  });
}
