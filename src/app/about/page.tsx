import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, Shield, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4">About TinyWeb</Badge>
        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
          Free SEO Tools for Everyone
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          TinyWeb is a comprehensive platform offering professional-grade SEO and web analysis tools, 
          completely free for developers, marketers, and website owners worldwide.
        </p>
      </div>

      {/* Mission Section */}
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-muted-foreground mb-4">
            We believe that powerful SEO tools shouldn't be locked behind expensive paywalls. 
            Our mission is to democratize access to professional web analysis tools, helping 
            everyone optimize their websites for better search engine rankings and user experience.
          </p>
          <p className="text-muted-foreground">
            Whether you're a solo developer, small business owner, or digital marketing professional, 
            TinyWeb provides the tools you need to succeed online.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Always Free</h3>
              <p className="text-sm text-muted-foreground">No hidden costs, no premium tiers, no credit card required</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-yellow-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Optimized for speed with intelligent caching and rate limiting</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">Built with security best practices and SSRF protection</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Globe className="h-6 w-6 text-purple-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Global Access</h3>
              <p className="text-sm text-muted-foreground">Available worldwide with no geographical restrictions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Overview */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  SEO
                </div>
                SEO Analysis
              </CardTitle>
              <CardDescription>
                Comprehensive tools to analyze and optimize your search engine rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• OpenGraph Preview</li>
                <li>• Meta Tags Checker</li>
                <li>• SERP Rank Checker</li>
                <li>• Link Extractor</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  TECH
                </div>
                Technical SEO
              </CardTitle>
              <CardDescription>
                Fix technical issues and improve your website's crawlability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• HTTP Headers Checker</li>
                <li>• Sitemap Finder</li>
                <li>• Robots.txt Tester</li>
                <li>• Website Crawl Test</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  PERF
                </div>
                Performance & Social
              </CardTitle>
              <CardDescription>
                Boost website speed and optimize social media presence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Page Speed Insights</li>
                <li>• Social Media Preview</li>
                <li>• Technology Checker</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-muted/30 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Built with Modern Technology</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <h3 className="font-semibold mb-2">Frontend</h3>
            <p className="text-sm text-muted-foreground">Next.js 15, React 19, TypeScript</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Styling</h3>
            <p className="text-sm text-muted-foreground">Tailwind CSS, shadcn/ui</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Database</h3>
            <p className="text-sm text-muted-foreground">Drizzle ORM, MySQL</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Security</h3>
            <p className="text-sm text-muted-foreground">Rate limiting, SSRF protection</p>
          </div>
        </div>
      </div>
    </div>
  );
}