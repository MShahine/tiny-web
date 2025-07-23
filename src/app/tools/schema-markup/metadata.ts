import type { Metadata } from 'next';
import { envConfig } from '@/lib/env-config';

export const metadata: Metadata = {
  title: 'Schema Markup Validator - Free Structured Data Testing Tool',
  description: 'Validate schema markup and structured data on any website. Check JSON-LD, Microdata, and RDFa for rich snippet eligibility. Free schema validator with detailed error reporting.',
  keywords: [
    'schema markup validator',
    'structured data testing',
    'JSON-LD validator',
    'rich snippets checker',
    'microdata validator',
    'schema.org testing',
    'structured data errors',
    'SEO schema markup',
    'Google rich snippets',
    'schema validation tool'
  ],
  openGraph: {
    title: 'Schema Markup Validator - Validate Structured Data for Rich Snippets',
    description: 'Free tool to validate schema markup and structured data. Check for rich snippet eligibility, detect errors, and get optimization recommendations.',
    type: 'website',
    url: `${envConfig.site.url}/tools/schema-markup`,
    images: [
      {
        url: `${envConfig.assets.ogImage}`,
        width: 1200,
        height: 630,
        alt: 'Schema Markup Validator Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schema Markup Validator - Free Structured Data Testing',
    description: 'Validate schema markup, check rich snippet eligibility, and optimize structured data for better search visibility.',
    images: [`${envConfig.assets.twitterImage}`],
  },
  alternates: {
    canonical: `${envConfig.site.url}/tools/schema-markup`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};