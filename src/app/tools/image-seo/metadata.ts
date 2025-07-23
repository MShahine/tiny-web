import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image SEO Analyzer - Optimize Images for Better Rankings | TinyWeb Tools',
  description: 'Free Image SEO analyzer tool. Check alt text, file sizes, formats, lazy loading, and get optimization recommendations for better search rankings and performance.',
  keywords: [
    'image seo analyzer',
    'alt text checker',
    'image optimization',
    'webp converter',
    'lazy loading checker',
    'image compression',
    'seo image audit',
    'accessibility checker',
    'core web vitals',
    'page speed optimization'
  ],
  openGraph: {
    title: 'Image SEO Analyzer - Optimize Images for Better Rankings',
    description: 'Analyze and optimize your website images for SEO. Check alt text, file sizes, formats, and get actionable recommendations.',
    type: 'website',
    url: 'https://tinyweb.tools/tools/image-seo',
    images: [
      {
        url: 'https://tinyweb.tools/og-image-image-seo.png',
        width: 1200,
        height: 630,
        alt: 'Image SEO Analyzer Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image SEO Analyzer - Optimize Images for Better Rankings',
    description: 'Free tool to analyze and optimize website images for SEO performance.',
    images: ['https://tinyweb.tools/twitter-image-image-seo.png'],
  },
  alternates: {
    canonical: 'https://tinyweb.tools/tools/image-seo',
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