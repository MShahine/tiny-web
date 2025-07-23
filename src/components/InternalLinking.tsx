'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink } from "lucide-react"

interface RelatedTool {
  name: string
  description: string
  href: string
  category: string
}

interface InternalLinkingProps {
  currentTool?: string
  relatedTools?: RelatedTool[]
}

const defaultRelatedTools: RelatedTool[] = [
  {
    name: "Meta Tags Checker",
    description: "Analyze and optimize your meta tags for better SEO",
    href: "/tools/meta-tags",
    category: "Technical SEO"
  },
  {
    name: "OpenGraph Preview",
    description: "Preview how your site appears on social media",
    href: "/tools/opengraph", 
    category: "Social SEO"
  },
  {
    name: "SERP Checker",
    description: "Check your search engine rankings",
    href: "/tools/serp-checker",
    category: "Rankings"
  }
]

export function InternalLinking({ currentTool, relatedTools = defaultRelatedTools }: InternalLinkingProps) {
  const filteredTools = relatedTools.filter(tool => tool.href !== currentTool)

  return (
    <div className="mt-12 p-6 bg-muted/30 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">
        Related SEO Tools
      </h3>
      <p className="text-muted-foreground mb-6">
        Complete your SEO analysis with these complementary tools
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.slice(0, 3).map((tool) => (
          <Card key={tool.href} className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                  {tool.category}
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">{tool.name}</CardTitle>
              <CardDescription className="text-sm">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                <Link href={tool.href}>
                  Try Tool
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Button variant="outline" asChild>
          <Link href="/#tools">
            View All SEO Tools <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

// SEO-focused internal linking for blog posts
export function BlogInternalLinking() {
  const seoGuides = [
    {
      title: "Complete Meta Tags Guide",
      description: "Master meta tag optimization for better rankings",
      href: "/blog/meta-tags-guide-2024",
      tool: "/tools/meta-tags"
    },
    {
      title: "OpenGraph Optimization",
      description: "Boost social media engagement with proper OG tags",
      href: "/blog/opengraph-optimization-guide", 
      tool: "/tools/opengraph"
    },
    {
      title: "HTTP Headers Security",
      description: "Essential security headers for SEO and protection",
      href: "/blog/http-headers-security-guide",
      tool: "/tools/http-headers"
    }
  ]

  return (
    <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/10">
      <h3 className="text-lg font-semibold mb-4 text-primary">
        📚 Related SEO Guides & Tools
      </h3>
      
      <div className="space-y-3">
        {seoGuides.map((guide) => (
          <div key={guide.href} className="flex items-center justify-between p-3 bg-background rounded border">
            <div className="flex-1">
              <Link href={guide.href} className="font-medium hover:text-primary transition-colors">
                {guide.title}
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                {guide.description}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={guide.href}>Read Guide</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={guide.tool}>Try Tool</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}