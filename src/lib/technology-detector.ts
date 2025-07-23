/**
 * Website Technology Detection Library
 * Detects CMS, frameworks, libraries, analytics, and more
 */

export interface TechnologySignature {
  name: string;
  category: string;
  confidence: number;
  version?: string;
  description?: string;
  website?: string;
  icon?: string;
}

export interface DetectionResult {
  url: string;
  technologies: TechnologySignature[];
  categories: Record<string, TechnologySignature[]>;
  summary: {
    totalDetected: number;
    categoriesFound: string[];
    confidence: 'high' | 'medium' | 'low';
  };
  meta: {
    title?: string;
    description?: string;
    generator?: string;
    viewport?: string;
  };
  performance: {
    loadTime: number;
    responseSize: number;
    httpStatus: number;
  };
}

export interface TechnologyPattern {
  name: string;
  category: string;
  description: string;
  website?: string;
  icon?: string;
  patterns: {
    html?: RegExp[];
    headers?: Record<string, RegExp>;
    cookies?: Record<string, RegExp>;
    scripts?: RegExp[];
    meta?: Record<string, RegExp>;
    dom?: string[];
    implies?: string[];
  };
  version?: RegExp;
}

/**
 * Technology detection patterns
 * Based on Wappalyzer patterns but enhanced
 */
export const TECHNOLOGY_PATTERNS: TechnologyPattern[] = [
  // CMS
  {
    name: 'WordPress',
    category: 'CMS',
    description: 'WordPress is a free and open-source content management system',
    website: 'https://wordpress.org',
    icon: '🔷',
    patterns: {
      html: [
        /\/wp-content\//i,
        /\/wp-includes\//i,
        /\/wp-admin\//i,
        /<link[^>]*wp-content/i,
        /wp-json/i
      ],
      headers: {
        'x-pingback': /\/xmlrpc\.php$/i
      },
      meta: {
        generator: /WordPress\s*([\d.]+)?/i
      }
    },
    version: /WordPress\s*([\d.]+)/i
  },

  {
    name: 'Shopify',
    category: 'E-commerce',
    description: 'Shopify is a commerce platform',
    website: 'https://shopify.com',
    icon: '🛒',
    patterns: {
      html: [
        /Shopify\.shop/i,
        /cdn\.shopify\.com/i,
        /shopify-analytics/i
      ],
      headers: {
        'x-shopify-stage': /.*/,
        'x-shopify-shop-api-call-limit': /.*/
      }
    }
  },

  {
    name: 'Drupal',
    category: 'CMS',
    description: 'Drupal is a free and open-source CMS',
    website: 'https://drupal.org',
    icon: '🔵',
    patterns: {
      html: [
        /Drupal\.settings/i,
        /sites\/all\/modules/i,
        /sites\/default\/files/i
      ],
      meta: {
        generator: /Drupal\s*([\d.]+)?/i
      }
    },
    version: /Drupal\s*([\d.]+)/i
  },

  {
    name: 'Ghost',
    category: 'CMS',
    description: 'Ghost is a professional publishing platform',
    website: 'https://ghost.org',
    icon: '👻',
    patterns: {
      html: [
        /ghost\.org/i,
        /ghost-/i,
        /\/ghost\//i
      ],
      meta: {
        generator: /Ghost\s*([\d.]+)?/i
      }
    },
    version: /Ghost\s*([\d.]+)/i
  },

  {
    name: 'Sanity',
    category: 'Headless CMS',
    description: 'Sanity is a headless CMS with real-time collaboration',
    website: 'https://sanity.io',
    icon: '🏗️',
    patterns: {
      html: [
        /sanity/i,
        /cdn\.sanity\.io/i,
        /sanityClient/i
      ],
      scripts: [
        /sanity/i,
        /cdn\.sanity\.io/i
      ]
    }
  },

  // JavaScript Frameworks
  {
    name: 'React',
    category: 'JavaScript Framework',
    description: 'React is a JavaScript library for building user interfaces',
    website: 'https://reactjs.org',
    icon: '⚛️',
    patterns: {
      html: [
        /__REACT_DEVTOOLS_GLOBAL_HOOK__/i,
        /react-dom/i,
        /data-reactroot/i
      ],
      scripts: [
        /react\.js/i,
        /react\.min\.js/i,
        /react-dom/i
      ]
    }
  },

  {
    name: 'Vue.js',
    category: 'JavaScript Framework',
    description: 'Vue.js is a progressive JavaScript framework',
    website: 'https://vuejs.org',
    icon: '💚',
    patterns: {
      html: [
        /Vue\.js/i,
        /__VUE__/i,
        /v-if|v-for|v-show/i
      ],
      scripts: [
        /vue\.js/i,
        /vue\.min\.js/i
      ]
    }
  },

  {
    name: 'Angular',
    category: 'JavaScript Framework',
    description: 'Angular is a platform for building mobile and desktop web applications',
    website: 'https://angular.io',
    icon: '🅰️',
    patterns: {
      html: [
        /ng-app/i,
        /ng-controller/i,
        /angular\.js/i,
        /_angular_/i,
        /ng-version/i
      ],
      scripts: [
        /angular\.js/i,
        /angular\.min\.js/i
      ],
      meta: {
        generator: /Angular/i
      }
    }
  },

  {
    name: 'Next.js',
    category: 'JavaScript Framework',
    description: 'Next.js is a React framework for production',
    website: 'https://nextjs.org',
    icon: '▲',
    patterns: {
      html: [
        /__NEXT_DATA__/i,
        /_next\/static/i,
        /next\.js/i,
        /__next/i
      ],
      scripts: [
        /_next\/static/i,
        /next\.js/i
      ],
      meta: {
        generator: /Next\.js/i
      }
    }
  },

  {
    name: 'Nuxt.js',
    category: 'JavaScript Framework',
    description: 'Nuxt.js is a Vue.js framework for universal applications',
    website: 'https://nuxtjs.org',
    icon: '💚',
    patterns: {
      html: [
        /__NUXT__/i,
        /_nuxt\//i,
        /nuxt\.js/i,
        /window\.__NUXT__/i
      ],
      scripts: [
        /_nuxt\//i,
        /nuxt\.js/i
      ],
      meta: {
        generator: /Nuxt\.js/i
      }
    }
  },

  {
    name: 'Gatsby',
    category: 'Static Site Generator',
    description: 'Gatsby is a React-based static site generator',
    website: 'https://gatsbyjs.com',
    icon: '🟣',
    patterns: {
      html: [
        /___gatsby/i,
        /gatsby-/i,
        /webpack-runtime/i
      ],
      scripts: [
        /gatsby-/i
      ],
      meta: {
        generator: /Gatsby/i
      }
    }
  },

  {
    name: 'Astro',
    category: 'Static Site Generator',
    description: 'Astro is a modern static site builder',
    website: 'https://astro.build',
    icon: '🚀',
    patterns: {
      html: [
        /astro-/i,
        /data-astro-/i,
        /\.astro/i
      ],
      meta: {
        generator: /Astro/i
      }
    }
  },

  {
    name: 'Svelte',
    category: 'JavaScript Framework',
    description: 'Svelte is a radical new approach to building user interfaces',
    website: 'https://svelte.dev',
    icon: '🧡',
    patterns: {
      html: [
        /svelte/i,
        /\.svelte/i,
        /svelte-/i
      ],
      scripts: [
        /svelte/i
      ]
    }
  },

  {
    name: 'SvelteKit',
    category: 'JavaScript Framework',
    description: 'SvelteKit is the fastest way to build svelte apps',
    website: 'https://kit.svelte.dev',
    icon: '🧡',
    patterns: {
      html: [
        /__SVELTEKIT__/i,
        /sveltekit/i,
        /_app\/immutable/i
      ],
      scripts: [
        /sveltekit/i,
        /_app\/immutable/i
      ]
    }
  },

  {
    name: 'Remix',
    category: 'JavaScript Framework',
    description: 'Remix is a full stack web framework focused on web standards',
    website: 'https://remix.run',
    icon: '💿',
    patterns: {
      html: [
        /__remixContext/i,
        /remix/i,
        /build\/assets/i
      ],
      scripts: [
        /remix/i
      ],
      meta: {
        generator: /Remix/i
      }
    }
  },

  {
    name: 'Vite',
    category: 'Build Tool',
    description: 'Vite is a build tool that aims to provide a faster development experience',
    website: 'https://vitejs.dev',
    icon: '⚡',
    patterns: {
      html: [
        /vite/i,
        /@vite/i,
        /\.vite/i
      ],
      scripts: [
        /vite/i,
        /@vite/i
      ]
    }
  },

  // Libraries
  {
    name: 'jQuery',
    category: 'JavaScript Library',
    description: 'jQuery is a fast, small, and feature-rich JavaScript library',
    website: 'https://jquery.com',
    icon: '📚',
    patterns: {
      html: [
        /\$\.fn\.jquery/i,
        /jquery/i
      ],
      scripts: [
        /jquery[.-](\d+(?:\.\d+)*)/i,
        /jquery\.min\.js/i
      ]
    },
    version: /jquery[.-](\d+(?:\.\d+)*)/i
  },

  {
    name: 'Bootstrap',
    category: 'CSS Framework',
    description: 'Bootstrap is a CSS framework for responsive web design',
    website: 'https://getbootstrap.com',
    icon: '🎨',
    patterns: {
      html: [
        /bootstrap/i,
        /btn btn-/i,
        /container-fluid/i
      ],
      scripts: [
        /bootstrap\.js/i,
        /bootstrap\.min\.js/i
      ]
    }
  },

  // Analytics & Tracking
  {
    name: 'Google Analytics',
    category: 'Analytics',
    description: 'Google Analytics is a web analytics service',
    website: 'https://analytics.google.com',
    icon: '📊',
    patterns: {
      html: [
        /google-analytics\.com\/analytics\.js/i,
        /gtag\(/i,
        /ga\(/i,
        /GoogleAnalyticsObject/i
      ],
      scripts: [
        /google-analytics\.com/i,
        /googletagmanager\.com/i
      ]
    }
  },

  {
    name: 'Google Tag Manager',
    category: 'Tag Manager',
    description: 'Google Tag Manager is a tag management system',
    website: 'https://tagmanager.google.com',
    icon: '🏷️',
    patterns: {
      html: [
        /googletagmanager\.com\/gtm\.js/i,
        /dataLayer/i,
        /GTM-/i
      ]
    }
  },

  {
    name: 'Facebook Pixel',
    category: 'Analytics',
    description: 'Facebook Pixel is an analytics tool',
    website: 'https://facebook.com',
    icon: '📘',
    patterns: {
      html: [
        /connect\.facebook\.net\/.*\/fbevents\.js/i,
        /fbq\(/i,
        /_fbp/i
      ]
    }
  },

  // CDN & Infrastructure
  {
    name: 'Cloudflare',
    category: 'CDN',
    description: 'Cloudflare is a web infrastructure and website security company',
    website: 'https://cloudflare.com',
    icon: '☁️',
    patterns: {
      headers: {
        'cf-ray': /.*/,
        'server': /cloudflare/i
      }
    }
  },

  {
    name: 'AWS CloudFront',
    category: 'CDN',
    description: 'Amazon CloudFront is a content delivery network',
    website: 'https://aws.amazon.com/cloudfront/',
    icon: '☁️',
    patterns: {
      headers: {
        'x-amz-cf-id': /.*/,
        'x-amz-cf-pop': /.*/
      }
    }
  },

  // Web Servers
  {
    name: 'Apache',
    category: 'Web Server',
    description: 'Apache HTTP Server',
    website: 'https://httpd.apache.org',
    icon: '🖥️',
    patterns: {
      headers: {
        'server': /Apache/i
      }
    },
    version: /Apache\/([\d.]+)/i
  },

  {
    name: 'Nginx',
    category: 'Web Server',
    description: 'Nginx is a web server and reverse proxy',
    website: 'https://nginx.org',
    icon: '🖥️',
    patterns: {
      headers: {
        'server': /nginx/i
      }
    },
    version: /nginx\/([\d.]+)/i
  },

  // Font & Icon Libraries
  {
    name: 'Font Awesome',
    category: 'Font Library',
    description: 'Font Awesome is an icon library',
    website: 'https://fontawesome.com',
    icon: '🔤',
    patterns: {
      html: [
        /font-awesome/i,
        /fa fa-/i,
        /fas fa-/i,
        /far fa-/i
      ],
      scripts: [
        /font-awesome/i
      ]
    }
  },

  {
    name: 'Google Fonts',
    category: 'Font Library',
    description: 'Google Fonts is a library of free licensed fonts',
    website: 'https://fonts.google.com',
    icon: '🔤',
    patterns: {
      html: [
        /fonts\.googleapis\.com/i,
        /fonts\.gstatic\.com/i
      ]
    }
  }
];

/**
 * Detect technologies from website content
 */
export async function detectTechnologies(
  url: string,
  html: string,
  headers: Record<string, string>
): Promise<DetectionResult> {
  const startTime = Date.now();
  const technologies: TechnologySignature[] = [];
  const categories: Record<string, TechnologySignature[]> = {};

  // Extract meta information
  const meta = extractMetaInfo(html);

  for (const pattern of TECHNOLOGY_PATTERNS) {
    const detection = detectTechnology(pattern, html, headers);

    if (detection) {
      technologies.push(detection);

      if (!categories[pattern.category]) {
        categories[pattern.category] = [];
      }
      categories[pattern.category].push(detection);
    }
  }

  // Sort by confidence
  technologies.sort((a, b) => b.confidence - a.confidence);

  // Calculate overall confidence
  const avgConfidence = technologies.length > 0
    ? technologies.reduce((sum, tech) => sum + tech.confidence, 0) / technologies.length
    : 0;

  const confidence = avgConfidence > 80 ? 'high' : avgConfidence > 50 ? 'medium' : 'low';

  return {
    url,
    technologies,
    categories,
    summary: {
      totalDetected: technologies.length,
      categoriesFound: Object.keys(categories),
      confidence
    },
    meta,
    performance: {
      loadTime: Date.now() - startTime,
      responseSize: html.length,
      httpStatus: 200
    }
  };
}

/**
 * Detect a specific technology
 */
function detectTechnology(
  pattern: TechnologyPattern,
  html: string,
  headers: Record<string, string>
): TechnologySignature | null {
  let confidence = 0;
  let version: string | undefined;
  const maxConfidence = 100;

  // Check HTML patterns
  if (pattern.patterns.html) {
    for (const regex of pattern.patterns.html) {
      if (regex.test(html)) {
        confidence += 25;

        // Try to extract version
        if (pattern.version) {
          const versionMatch = html.match(pattern.version);
          if (versionMatch && versionMatch[1]) {
            version = versionMatch[1];
            confidence += 10;
          }
        }
      }
    }
  }

  // Check headers
  if (pattern.patterns.headers) {
    for (const [headerName, headerRegex] of Object.entries(pattern.patterns.headers)) {
      const headerValue = headers[headerName.toLowerCase()];
      if (headerValue && headerRegex.test(headerValue)) {
        confidence += 30;

        // Try to extract version from headers
        if (pattern.version) {
          const versionMatch = headerValue.match(pattern.version);
          if (versionMatch && versionMatch[1]) {
            version = versionMatch[1];
            confidence += 10;
          }
        }
      }
    }
  }

  // Check meta tags
  if (pattern.patterns.meta) {
    for (const [metaName, metaRegex] of Object.entries(pattern.patterns.meta)) {
      const metaRegexPattern = new RegExp(`<meta[^>]*name=["']${metaName}["'][^>]*content=["']([^"']*)["']`, 'i');
      const metaMatch = html.match(metaRegexPattern);

      if (metaMatch && metaMatch[1] && metaRegex.test(metaMatch[1])) {
        confidence += 40;

        // Try to extract version from meta
        if (pattern.version) {
          const versionMatch = metaMatch[1].match(pattern.version);
          if (versionMatch && versionMatch[1]) {
            version = versionMatch[1];
            confidence += 15;
          }
        }
      }
    }
  }

  // Check script sources
  if (pattern.patterns.scripts) {
    for (const scriptRegex of pattern.patterns.scripts) {
      const scriptMatch = html.match(new RegExp(`<script[^>]*src=["']([^"']*${scriptRegex.source}[^"']*)["']`, 'i'));
      if (scriptMatch) {
        confidence += 20;

        // Try to extract version from script URL
        if (pattern.version) {
          const versionMatch = scriptMatch[1].match(pattern.version);
          if (versionMatch && versionMatch[1]) {
            version = versionMatch[1];
            confidence += 10;
          }
        }
      }
    }
  }

  // Return detection if confidence is high enough
  if (confidence >= 25) {
    return {
      name: pattern.name,
      category: pattern.category,
      confidence: Math.min(confidence, maxConfidence),
      version,
      description: pattern.description,
      website: pattern.website
    };
  }

  return null;
}

/**
 * Extract meta information from HTML
 */
function extractMetaInfo(html: string): Record<string, string> {
  const meta: Record<string, string> = {};

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) {
    meta.title = titleMatch[1].trim();
  }

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (descMatch) {
    meta.description = descMatch[1];
  }

  // Extract generator
  const genMatch = html.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']*)["']/i);
  if (genMatch) {
    meta.generator = genMatch[1];
  }

  // Extract viewport
  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i);
  if (viewportMatch) {
    meta.viewport = viewportMatch[1];
  }

  return meta;
}
