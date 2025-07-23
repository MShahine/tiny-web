import { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/seo-config'

export const metadata: Metadata = {
  ...generateToolMetadata('meta-tags'),
  alternates: {
    canonical: 'https://tinyweb.tools/tools/meta-tags',
  },
}