import { envConfig } from './env-config'

// SEO Configuration for all tools
export const seoConfig = {
  baseUrl: envConfig.site.url,
  siteName: envConfig.site.name,
  defaultTitle: envConfig.site.name + ' - Professional SEO Analysis Tools for Free',
  defaultDescription: envConfig.site.description,
  
  // Tool-specific SEO data
  tools: {
    'meta-tags': {
      title: 'Free Meta Tags Checker & Analyzer - SEO Meta Tag Optimization Tool',
      description: 'Analyze and optimize your website\'s meta tags for better SEO rankings. Check title tags, meta descriptions, keywords, and get actionable recommendations. Free meta tag checker tool.',
      keywords: ['meta tags checker', 'meta tag analyzer', 'SEO meta tags', 'title tag checker', 'meta description checker', 'meta tag optimization'],
      features: ['Meta tag analysis', 'SEO scoring', 'Title tag optimization', 'Meta description analysis', 'Keyword density check', 'Social media tags']
    },
    'opengraph': {
      title: 'Free OpenGraph Checker - Social Media Preview Generator & Validator',
      description: 'Preview how your website appears on Facebook, Twitter, LinkedIn and other social platforms. Validate OpenGraph tags and optimize social media sharing. Free OG tag checker.',
      keywords: ['opengraph checker', 'og tag validator', 'social media preview', 'facebook preview', 'twitter card checker', 'linkedin preview'],
      features: ['Social media preview', 'OpenGraph validation', 'Twitter card check', 'Facebook preview', 'LinkedIn optimization', 'Social sharing analysis']
    },
    'http-headers': {
      title: 'Free HTTP Headers Checker - Security & Performance Analysis Tool',
      description: 'Analyze HTTP response headers for security vulnerabilities and performance issues. Check HTTPS, HSTS, CSP, CORS and more. Free HTTP header analyzer tool.',
      keywords: ['http headers checker', 'security headers', 'HTTPS analyzer', 'HSTS checker', 'CSP validator', 'CORS checker'],
      features: ['Security analysis', 'Performance headers', 'HTTPS validation', 'HSTS check', 'CSP analysis', 'CORS validation']
    },
    'serp-checker': {
      title: 'Free SERP Checker - Google Search Rankings & Position Tracker',
      description: 'Check your website\'s Google search rankings and SERP positions. Track keyword rankings, analyze SERP features, and monitor search visibility. Free SERP rank checker.',
      keywords: ['SERP checker', 'google rank checker', 'keyword position tracker', 'search rankings', 'SERP analysis', 'rank tracking tool'],
      features: ['SERP position tracking', 'Keyword rankings', 'SERP features analysis', 'Search visibility', 'Ranking history', 'Competitor analysis']
    },
    'sitemap-finder': {
      title: 'Free Sitemap Finder & XML Sitemap Checker - SEO Sitemap Validator',
      description: 'Find and validate XML sitemaps for better SEO. Check sitemap structure, URLs, errors, and optimization opportunities. Free sitemap checker and validator tool.',
      keywords: ['sitemap finder', 'xml sitemap checker', 'sitemap validator', 'sitemap analyzer', 'SEO sitemap', 'sitemap optimization'],
      features: ['Sitemap detection', 'XML validation', 'URL analysis', 'Error detection', 'SEO optimization', 'Sitemap structure check']
    },
    'robots-txt-tester': {
      title: 'Free Robots.txt Tester & Validator - SEO Robots File Checker',
      description: 'Test and validate your robots.txt file for proper SEO configuration. Check crawl directives, user-agent rules, and sitemap declarations. Free robots.txt tester.',
      keywords: ['robots.txt tester', 'robots file checker', 'robots.txt validator', 'crawl directives', 'user-agent rules', 'SEO robots'],
      features: ['Robots.txt validation', 'Crawl directive testing', 'User-agent analysis', 'Sitemap detection', 'SEO compliance', 'Crawler accessibility']
    },
    'website-technology-checker': {
      title: 'Free Website Technology Checker - CMS, Framework & Library Detector',
      description: 'Detect technologies used on any website. Identify CMS, frameworks, libraries, analytics tools, and more. Free website technology stack analyzer.',
      keywords: ['website technology checker', 'CMS detector', 'framework detector', 'library detector', 'technology stack', 'website analyzer'],
      features: ['Technology detection', 'CMS identification', 'Framework analysis', 'Library detection', 'Analytics tools', 'Tech stack analysis']
    },
    'website-crawl-test': {
      title: 'Free Website Crawler - SEO Crawl Test & Site Analysis Tool',
      description: 'Crawl and analyze your website like search engines do. Find SEO issues, broken links, and optimization opportunities. Free website crawler and SEO audit tool.',
      keywords: ['website crawler', 'SEO crawl test', 'site crawler', 'website analysis', 'SEO audit', 'crawl analysis'],
      features: ['Website crawling', 'SEO analysis', 'Broken link detection', 'Page analysis', 'Site structure', 'Crawl optimization']
    },
    'page-speed-insights': {
      title: 'Free Page Speed Test - Website Performance & Core Web Vitals Checker',
      description: 'Test your website\'s loading speed and performance. Analyze Core Web Vitals, get optimization recommendations, and improve user experience. Free page speed test.',
      keywords: ['page speed test', 'website speed test', 'core web vitals', 'performance test', 'speed optimization', 'loading time'],
      features: ['Speed analysis', 'Core Web Vitals', 'Performance metrics', 'Optimization tips', 'Loading time', 'User experience']
    },
    'link-extractor': {
      title: 'Free Link Extractor - Website Link Analyzer & SEO Link Checker',
      description: 'Extract and analyze all links from any webpage. Check internal/external links, anchor texts, and link SEO health. Free link extraction and analysis tool.',
      keywords: ['link extractor', 'link analyzer', 'anchor text analyzer', 'internal links', 'external links', 'link SEO'],
      features: ['Link extraction', 'Anchor text analysis', 'Internal link check', 'External link analysis', 'Link SEO audit', 'Link structure']
    },
    'social-media-preview': {
      title: 'Free Social Media Preview Generator - Multi-Platform Sharing Optimizer',
      description: 'Generate and optimize social media previews for all platforms. Preview how your content appears on Facebook, Twitter, LinkedIn, and more. Free social preview tool.',
      keywords: ['social media preview', 'social sharing preview', 'facebook preview', 'twitter preview', 'linkedin preview', 'social optimization'],
      features: ['Multi-platform preview', 'Social optimization', 'Sharing analysis', 'Preview generation', 'Social media SEO', 'Platform compatibility']
    }
  }
}

// Generate metadata for tool pages
export function generateToolMetadata(toolKey: keyof typeof seoConfig.tools) {
  const tool = seoConfig.tools[toolKey]
  if (!tool) return null
  
  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
      title: tool.title,
      description: tool.description,
      url: `${seoConfig.baseUrl}/tools/${toolKey}`,
      images: [`/tools/${toolKey}/og-image.png`],
    },
    twitter: {
      title: tool.title,
      description: tool.description,
      images: [`/tools/${toolKey}/twitter-image.png`],
    },
    alternates: {
      canonical: `${seoConfig.baseUrl}/tools/${toolKey}`,
    }
  }
}