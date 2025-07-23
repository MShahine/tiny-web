'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SEOContent() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What SEO tools does TinyWeb offer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TinyWeb offers 11+ professional SEO tools including Meta Tags Checker, OpenGraph Preview, HTTP Headers Analyzer, SERP Rank Checker, Sitemap Finder, Robots.txt Tester, Website Technology Checker, Website Crawler, Page Speed Test, Link Extractor, and Social Media Preview Generator.'
        }
      },
      {
        '@type': 'Question',
        name: 'Are TinyWeb SEO tools really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all TinyWeb SEO tools are completely free to use. There are no hidden fees, subscription costs, or registration requirements. You can access all professional-grade SEO analysis tools without any limitations.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do I need to register to use TinyWeb tools?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No registration is required. You can use all SEO tools immediately without creating an account, providing email, or any personal information. Simply visit the tool page and start analyzing your website.'
        }
      },
      {
        '@type': 'Question',
        name: 'How accurate are TinyWeb SEO analysis results?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TinyWeb uses professional-grade algorithms and follows the same standards as premium SEO tools. Our tools are trusted by 10,000+ SEO professionals and provide accurate, actionable insights for website optimization.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I use TinyWeb tools for commercial websites?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, TinyWeb tools can be used for personal and commercial websites without restrictions. Whether you\'re an SEO professional, web developer, or business owner, you can use our tools to optimize any website.'
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* SEO Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Complete SEO Analysis in One Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to optimize your website for search engines and improve your rankings
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">Technical SEO</Badge>
                <CardTitle>Technical Optimization</CardTitle>
                <CardDescription>
                  Analyze technical SEO factors that impact search engine crawling and indexing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Meta tags analysis and optimization</li>
                  <li>• HTTP headers security check</li>
                  <li>• Sitemap validation and testing</li>
                  <li>• Robots.txt file analysis</li>
                  <li>• Website crawling simulation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">Content SEO</Badge>
                <CardTitle>Content Analysis</CardTitle>
                <CardDescription>
                  Optimize your content for better search engine visibility and user engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Link structure analysis</li>
                  <li>• Anchor text optimization</li>
                  <li>• Social media preview generation</li>
                  <li>• OpenGraph tags validation</li>
                  <li>• Content performance metrics</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">Performance</Badge>
                <CardTitle>Speed & Performance</CardTitle>
                <CardDescription>
                  Monitor and improve your website's loading speed and user experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Page speed analysis</li>
                  <li>• Core Web Vitals monitoring</li>
                  <li>• Performance optimization tips</li>
                  <li>• Technology stack detection</li>
                  <li>• SERP ranking analysis</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about TinyWeb SEO tools
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What SEO tools does TinyWeb offer?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  TinyWeb offers 11+ professional SEO tools including Meta Tags Checker, OpenGraph Preview, 
                  HTTP Headers Analyzer, SERP Rank Checker, Sitemap Finder, Robots.txt Tester, Website 
                  Technology Checker, Website Crawler, Page Speed Test, Link Extractor, and Social Media 
                  Preview Generator.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Are TinyWeb SEO tools really free?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, all TinyWeb SEO tools are completely free to use. There are no hidden fees, 
                  subscription costs, or registration requirements. You can access all professional-grade 
                  SEO analysis tools without any limitations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do I need to register to use TinyWeb tools?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No registration is required. You can use all SEO tools immediately without creating an 
                  account, providing email, or any personal information. Simply visit the tool page and 
                  start analyzing your website.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How accurate are TinyWeb SEO analysis results?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  TinyWeb uses professional-grade algorithms and follows the same standards as premium SEO 
                  tools. Our tools are trusted by 10,000+ SEO professionals and provide accurate, actionable 
                  insights for website optimization.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I use TinyWeb tools for commercial websites?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, TinyWeb tools can be used for personal and commercial websites without restrictions. 
                  Whether you're an SEO professional, web developer, or business owner, you can use our 
                  tools to optimize any website.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}