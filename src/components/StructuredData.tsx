'use client'

import { envConfig } from '@/lib/env-config'

interface StructuredDataProps {
  type: 'WebSite' | 'SoftwareApplication' | 'WebPage' | 'Tool'
  data: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// Website Schema for homepage
export function WebsiteSchema() {
  const websiteData = {
    name: envConfig.site.name,
    alternateName: envConfig.business.name,
    url: envConfig.site.url,
    description: envConfig.site.description,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: envConfig.business.name,
      url: envConfig.site.url
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${envConfig.site.url}/tools/{search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    sameAs: [
      envConfig.social.twitter.replace('@', 'https://twitter.com/'),
      envConfig.social.github,
      envConfig.social.linkedin
    ]
  }

  return <StructuredData type="WebSite" data={websiteData} />
}

// Software Application Schema for the platform
export function SoftwareApplicationSchema() {
  const appData = {
    name: 'TinyWeb SEO Tools',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'SEO Tools',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1247',
      bestRating: '5',
      worstRating: '1'
    },
    featureList: [
      'Meta Tags Analysis',
      'OpenGraph Preview',
      'HTTP Headers Check',
      'Sitemap Validation',
      'Robots.txt Testing',
      'SERP Rank Checking',
      'Page Speed Analysis',
      'Link Extraction',
      'Social Media Preview',
      'Website Crawling',
      'Technology Detection'
    ],
    screenshot: 'https://tinyweb.tools/screenshot.png',
    softwareVersion: '2.0',
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    author: {
      '@type': 'Organization',
      name: 'TinyWeb'
    }
  }

  return <StructuredData type="SoftwareApplication" data={appData} />
}

// Tool-specific schema
export function ToolSchema({ 
  name, 
  description, 
  url, 
  category = 'SEO Tool',
  features = []
}: {
  name: string
  description: string
  url: string
  category?: string
  features?: string[]
}) {
  const toolData = {
    name,
    description,
    url,
    category,
    isAccessibleForFree: true,
    inLanguage: 'en-US',
    creator: {
      '@type': 'Organization',
      name: 'TinyWeb',
      url: 'https://tinyweb.tools'
    },
    mainEntity: {
      '@type': 'SoftwareApplication',
      name,
      applicationCategory: 'WebApplication',
      applicationSubCategory: category,
      featureList: features,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    }
  }

  return <StructuredData type="WebPage" data={toolData} />
}