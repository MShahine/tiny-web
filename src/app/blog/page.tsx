import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { SEOBreadcrumbs } from "@/components/SEOBreadcrumbs"

export const metadata: Metadata = {
  title: 'SEO Blog - Expert Tips, Guides & Best Practices | TinyWeb',
  description: 'Learn SEO best practices, optimization techniques, and expert tips from our comprehensive blog. Stay updated with the latest search engine optimization trends and strategies.',
  keywords: ['SEO blog', 'SEO tips', 'SEO guide', 'search engine optimization', 'SEO best practices', 'SEO tutorials'],
  openGraph: {
    title: 'SEO Blog - Expert Tips & Guides | TinyWeb',
    description: 'Learn SEO best practices and optimization techniques from our expert blog.',
    url: 'https://tinyweb.tools/blog',
  },
  alternates: {
    canonical: 'https://tinyweb.tools/blog',
  },
}

const blogPosts = [
  {
    title: 'Complete Meta Tags Guide for SEO Success in 2024',
    description: 'Learn how to optimize meta tags for better search rankings. Comprehensive guide covering title tags, meta descriptions, and advanced meta tag strategies.',
    category: 'Technical SEO',
    readTime: '8 min read',
    date: '2024-01-15',
    slug: 'meta-tags-guide-2024',
    featured: true
  },
  {
    title: 'OpenGraph Optimization: Boost Social Media Engagement',
    description: 'Master OpenGraph tags to improve social media sharing. Learn how to create compelling previews for Facebook, Twitter, and LinkedIn.',
    category: 'Social SEO',
    readTime: '6 min read',
    date: '2024-01-12',
    slug: 'opengraph-optimization-guide'
  },
  {
    title: 'HTTP Headers Security: Essential SEO & Security Guide',
    description: 'Comprehensive guide to HTTP security headers. Learn about HSTS, CSP, CORS, and how they impact SEO and website security.',
    category: 'Technical SEO',
    readTime: '10 min read',
    date: '2024-01-10',
    slug: 'http-headers-security-guide'
  },
  {
    title: 'SERP Features Analysis: Dominate Google Search Results',
    description: 'Understanding SERP features and how to optimize for featured snippets, knowledge panels, and other rich results.',
    category: 'SERP Optimization',
    readTime: '7 min read',
    date: '2024-01-08',
    slug: 'serp-features-optimization'
  },
  {
    title: 'XML Sitemap Best Practices for Better Crawling',
    description: 'Create and optimize XML sitemaps for improved search engine crawling. Learn sitemap structure, submission, and common mistakes.',
    category: 'Technical SEO',
    readTime: '9 min read',
    date: '2024-01-05',
    slug: 'xml-sitemap-best-practices'
  },
  {
    title: 'Robots.txt Optimization: Control Search Engine Access',
    description: 'Master robots.txt configuration for better SEO. Learn syntax, best practices, and common robots.txt mistakes to avoid.',
    category: 'Technical SEO',
    readTime: '6 min read',
    date: '2024-01-03',
    slug: 'robots-txt-optimization-guide'
  }
]

export default function BlogPage() {
  const featuredPost = blogPosts.find(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <SEOBreadcrumbs items={[{ label: 'Blog' }]} />
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            SEO Blog & Guides
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Expert SEO tips, comprehensive guides, and best practices to help you dominate search engine rankings. 
            Learn from real-world examples and actionable strategies.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Featured Article</h2>
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Badge variant="default" className="mb-4">
                      {featuredPost.category}
                    </Badge>
                    <div className="text-4xl font-bold text-primary mb-2">
                      Featured
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Most Popular Guide
                    </div>
                  </div>
                </div>
                <div className="md:w-2/3 p-8">
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(featuredPost.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {featuredPost.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-2xl mb-2">{featuredPost.title}</CardTitle>
                    <CardDescription className="text-base">
                      {featuredPost.description}
                    </CardDescription>
                  </CardHeader>
                  <Button asChild>
                    <Link href={`/blog/${featuredPost.slug}`}>
                      Read Full Guide <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Latest SEO Guides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Card key={post.slug} className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        Read More <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-muted/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Optimize Your Website?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Put these SEO strategies into action with our free professional tools. 
            Analyze your website and get actionable insights in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/tools/meta-tags">
                Check Your Meta Tags <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#tools">View All Tools</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}