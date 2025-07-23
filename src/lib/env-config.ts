// Environment configuration with fallbacks and validation
export const envConfig = {
  // Site Configuration
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://tinyweb.tools',
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'TinyWeb - Free SEO Tools',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Professional-grade SEO analysis tools for free. Complete toolkit with 11+ tools for meta tags, OpenGraph, headers, sitemaps, SERP tracking, and more.',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    version: process.env.NEXT_PUBLIC_VERSION || '2.0.0',
  },

  // SEO & Analytics
  seo: {
    googleAnalytics: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'your-google-verification-code',
    bingVerification: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || 'your-bing-verification-code',
    yandexVerification: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || 'your-yandex-verification-code',
    yahooVerification: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION || 'your-yahoo-verification-code',
  },

  // Social Media
  social: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@tinyweb_tools',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_PAGE || 'https://facebook.com/tinyweb.tools',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_PAGE || 'https://linkedin.com/company/tinyweb-tools',
    github: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/tinyweb-tools',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL || 'https://youtube.com/@tinyweb-tools',
  },

  // Contact Information
  contact: {
    support: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@tinyweb.tools',
    business: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'hello@tinyweb.tools',
    help: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'help@tinyweb.tools',
  },

  // Business Information (for Local SEO)
  business: {
    name: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'TinyWeb SEO Tools',
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '123 SEO Street',
    city: process.env.NEXT_PUBLIC_BUSINESS_CITY || 'Digital City',
    state: process.env.NEXT_PUBLIC_BUSINESS_STATE || 'Tech State',
    zip: process.env.NEXT_PUBLIC_BUSINESS_ZIP || '12345',
    country: process.env.NEXT_PUBLIC_BUSINESS_COUNTRY || 'US',
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+1-555-SEO-TOOL',
    latitude: parseFloat(process.env.NEXT_PUBLIC_BUSINESS_LATITUDE || '40.7128'),
    longitude: parseFloat(process.env.NEXT_PUBLIC_BUSINESS_LONGITUDE || '-74.0060'),
  },

  // Assets
  assets: {
    logo: process.env.NEXT_PUBLIC_LOGO_URL || '/logo.png',
    favicon: process.env.NEXT_PUBLIC_FAVICON_URL || '/favicon.ico',
    ogImage: process.env.NEXT_PUBLIC_OG_IMAGE || '/og-image.png',
    twitterImage: process.env.NEXT_PUBLIC_TWITTER_IMAGE || '/twitter-image.png',
  },

  // Feature Flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    newsletter: process.env.NEXT_PUBLIC_ENABLE_NEWSLETTER === 'true',
    liveChat: process.env.NEXT_PUBLIC_ENABLE_LIVE_CHAT === 'true',
    blog: process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true',
    apiDocs: process.env.NEXT_PUBLIC_ENABLE_API_DOCS === 'true',
  },

  // API Configuration
  api: {
    rateLimit: {
      requests: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_REQUESTS || '100'),
      window: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW || '3600'),
    },
    keys: {
      pagespeed: process.env.PAGESPEED_API_KEY || '',
      serp: process.env.SERP_API_KEY || '',
      socialMedia: process.env.SOCIAL_MEDIA_API_KEY || '',
    },
  },

  // Development URLs
  urls: {
    production: process.env.NEXT_PUBLIC_SITE_URL || 'https://tinyweb.tools',
    staging: process.env.NEXT_PUBLIC_STAGING_URL || 'https://staging.tinyweb.tools',
    development: process.env.NEXT_PUBLIC_DEV_URL || 'http://localhost:3000',
  },
}

// Helper functions
export const isDevelopment = envConfig.site.environment === 'development'
export const isProduction = envConfig.site.environment === 'production'
export const isStaging = envConfig.site.environment === 'staging'

// Get current site URL based on environment
export const getCurrentSiteUrl = () => {
  if (isProduction) return envConfig.urls.production
  if (isStaging) return envConfig.urls.staging
  return envConfig.urls.development
}

// Validation function
export const validateEnvConfig = () => {
  const errors: string[] = []

  // Required in production
  if (isProduction) {
    if (!envConfig.site.url.startsWith('https://')) {
      errors.push('NEXT_PUBLIC_SITE_URL must be HTTPS in production')
    }
    
    if (!envConfig.seo.googleAnalytics) {
      console.warn('Warning: Google Analytics ID not set')
    }
    
    if (envConfig.seo.googleVerification === 'your-google-verification-code') {
      console.warn('Warning: Google verification code not updated')
    }
  }

  if (errors.length > 0) {
    throw new Error(`Environment configuration errors:\n${errors.join('\n')}`)
  }

  return true
}

// Export for easy access
export default envConfig