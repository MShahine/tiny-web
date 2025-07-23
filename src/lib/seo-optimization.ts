// Advanced SEO optimization utilities
export const seoOptimization = {
  // Core Web Vitals optimization
  performance: {
    // Preload critical resources
    preloadResources: [
      '/fonts/inter-var.woff2',
      '/images/hero-bg.webp'
    ],
    
    // Critical CSS inlining
    criticalCSS: `
      .hero-section { display: block; }
      .navigation { position: sticky; top: 0; }
    `,
    
    // Image optimization settings
    imageOptimization: {
      formats: ['webp', 'avif'],
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      quality: 85
    }
  },

  // Schema markup templates
  schemas: {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'TinyWeb',
      url: 'https://tinyweb.tools',
      logo: 'https://tinyweb.tools/logo.png',
      description: 'Professional SEO tools platform offering free analysis tools for website optimization',
      foundingDate: '2024',
      sameAs: [
        'https://twitter.com/tinyweb_tools',
        'https://github.com/tinyweb-tools',
        'https://linkedin.com/company/tinyweb-tools'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@tinyweb.tools',
        url: 'https://tinyweb.tools/contact'
      }
    },

    localBusiness: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://tinyweb.tools/#business',
      name: 'TinyWeb SEO Tools',
      image: 'https://tinyweb.tools/business-image.jpg',
      telephone: '+1-555-SEO-TOOL',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 SEO Street',
        addressLocality: 'Digital City',
        addressRegion: 'Tech State',
        postalCode: '12345',
        addressCountry: 'US'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 40.7128,
        longitude: -74.0060
      },
      url: 'https://tinyweb.tools',
      priceRange: 'Free',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ],
        opens: '00:00',
        closes: '23:59'
      }
    }
  },

  // SEO-optimized URL structure
  urlStructure: {
    tools: '/tools/{tool-name}',
    blog: '/blog/{post-slug}',
    guides: '/guides/{guide-category}/{guide-slug}',
    api: '/api/tools/{tool-name}'
  },

  // Meta tag templates for different page types
  metaTemplates: {
    tool: {
      titleTemplate: '{Tool Name} - Free {Tool Category} | TinyWeb SEO Tools',
      descriptionTemplate: '{Tool Description}. Professional {Tool Category} analysis tool. Free, accurate, and trusted by 10,000+ SEO professionals.',
      keywordsTemplate: ['{tool name}', 'free {tool category}', '{tool name} checker', 'SEO {tool category}', '{tool name} analyzer']
    },
    
    blog: {
      titleTemplate: '{Post Title} | TinyWeb SEO Blog',
      descriptionTemplate: '{Post Excerpt}. Expert SEO tips and strategies from TinyWeb.',
      keywordsTemplate: ['SEO tips', '{post category}', 'SEO guide', '{main keywords}']
    },

    category: {
      titleTemplate: '{Category Name} Tools - Free SEO {Category} | TinyWeb',
      descriptionTemplate: 'Professional {Category Name} tools for SEO optimization. Free analysis tools trusted by experts.',
      keywordsTemplate: ['{category} tools', 'free {category}', 'SEO {category}', '{category} analyzer']
    }
  },

  // Internal linking strategy
  internalLinking: {
    // Hub pages (high authority pages that link to many others)
    hubPages: [
      '/', // Homepage
      '/tools', // Tools overview
      '/blog', // Blog hub
      '/guides' // Guides hub
    ],

    // Contextual linking rules
    contextualLinks: {
      'meta tags': '/tools/meta-tags',
      'opengraph': '/tools/opengraph',
      'http headers': '/tools/http-headers',
      'serp checker': '/tools/serp-checker',
      'sitemap': '/tools/sitemap-finder',
      'robots.txt': '/tools/robots-txt-tester',
      'page speed': '/tools/page-speed-insights',
      'link analysis': '/tools/link-extractor',
      'social media': '/tools/social-media-preview',
      'website crawler': '/tools/website-crawl-test',
      'technology checker': '/tools/website-technology-checker'
    },

    // Related content suggestions
    relatedContent: {
      'technical-seo': [
        '/tools/meta-tags',
        '/tools/http-headers', 
        '/tools/sitemap-finder',
        '/tools/robots-txt-tester'
      ],
      'content-seo': [
        '/tools/link-extractor',
        '/tools/opengraph',
        '/tools/social-media-preview'
      ],
      'performance': [
        '/tools/page-speed-insights',
        '/tools/website-crawl-test',
        '/tools/website-technology-checker'
      ]
    }
  },

  // Content optimization guidelines
  contentOptimization: {
    // Target keyword density
    keywordDensity: {
      primary: 0.5, // 0.5-1%
      secondary: 0.3, // 0.3-0.5%
      related: 0.2 // 0.2-0.3%
    },

    // Content structure
    structure: {
      h1: 1, // Exactly one H1 per page
      h2: '3-6', // 3-6 H2 tags
      h3: '5-10', // 5-10 H3 tags
      paragraphs: '150-300 words each',
      totalWords: '1500-3000 words for pillar content'
    },

    // Readability targets
    readability: {
      fleschScore: 60, // Target 60+ (standard reading level)
      avgSentenceLength: 20, // Max 20 words per sentence
      avgParagraphLength: 4, // Max 4 sentences per paragraph
      passiveVoice: 10 // Max 10% passive voice
    }
  },

  // Technical SEO checklist
  technicalSEO: {
    // Core requirements
    core: [
      'SSL certificate (HTTPS)',
      'Mobile-responsive design',
      'Fast loading speed (<3s)',
      'XML sitemap',
      'Robots.txt file',
      'Clean URL structure',
      'Proper meta tags',
      'Schema markup'
    ],

    // Advanced optimizations
    advanced: [
      'Core Web Vitals optimization',
      'Image optimization (WebP/AVIF)',
      'Lazy loading implementation',
      'CDN integration',
      'Gzip/Brotli compression',
      'HTTP/2 support',
      'Security headers',
      'Canonical URLs'
    ]
  }
}

// SEO monitoring and tracking
export const seoTracking = {
  // Key metrics to monitor
  metrics: [
    'Organic traffic',
    'Keyword rankings',
    'Click-through rates',
    'Core Web Vitals',
    'Page load speed',
    'Mobile usability',
    'Crawl errors',
    'Index coverage'
  ],

  // Tools for monitoring
  tools: [
    'Google Search Console',
    'Google Analytics 4',
    'Google PageSpeed Insights',
    'Bing Webmaster Tools',
    'Yandex Webmaster',
    'Schema markup validator',
    'Mobile-friendly test',
    'Rich results test'
  ]
}