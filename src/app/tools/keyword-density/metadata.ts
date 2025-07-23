import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Keyword Density Analyzer - Free SEO Tool | TinyWeb',
  description: 'Analyze keyword frequency, density, and get SEO recommendations. Check TF-IDF scores, find keyword opportunities, and optimize your content for better search rankings.',
  keywords: [
    'keyword density analyzer',
    'keyword frequency checker',
    'SEO keyword tool',
    'TF-IDF calculator',
    'content optimization',
    'keyword research',
    'SEO analysis',
    'keyword stuffing checker',
    'content analysis tool',
    'search engine optimization'
  ],
  openGraph: {
    title: 'Free Keyword Density Analyzer - SEO Content Optimization Tool',
    description: 'Analyze keyword frequency, density, and get actionable SEO recommendations. Check TF-IDF scores and optimize your content for better search rankings.',
    type: 'website',
    url: 'https://tinyweb.dev/tools/keyword-density',
    images: [
      {
        url: 'https://tinyweb.dev/og-keyword-density.png',
        width: 1200,
        height: 630,
        alt: 'Keyword Density Analyzer Tool'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Keyword Density Analyzer - SEO Tool',
    description: 'Analyze keyword frequency, density, and get SEO recommendations for better content optimization.',
    images: ['https://tinyweb.dev/og-keyword-density.png']
  },
  alternates: {
    canonical: 'https://tinyweb.dev/tools/keyword-density'
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