import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Zap, Search, BarChart3, Shield, Globe, Smartphone } from "lucide-react";
import { ToolSearch } from "@/components/ToolSearch";
import { ToolStats } from "@/components/ToolStats";
import { QuickLauncher } from "@/components/QuickLauncher";
import { SEOContent } from "@/components/SEOContent";

const tools = [
  {
    name: "OpenGraph Preview",
    description: "Preview how your website appears on social media platforms",
    href: "/tools/opengraph",
    status: "ready",
    icon: "OG",
  },
  {
    name: "Meta Tags Checker",
    description: "Analyze and optimize your website's meta tags with SEO scoring",
    href: "/tools/meta-tags",
    status: "ready",
    icon: "MT",
  },
  {
    name: "HTTP Headers Checker",
    description: "Analyze HTTP headers for security and performance optimization",
    href: "/tools/http-headers",
    status: "ready",
    icon: "HH",
  },
  {
    name: "Sitemap Finder",
    description: "Find and analyze XML sitemaps for SEO optimization",
    href: "/tools/sitemap-finder",
    status: "ready",
    icon: "SM",
  },
  {
    name: "Robots.txt Tester",
    description: "Test robots.txt files and URL accessibility for search engines",
    href: "/tools/robots-txt-tester",
    status: "ready",
    icon: "RT",
  },
  {
    name: "SERP Rank Checker",
    description: "Check keyword rankings in search results and analyze SERP features",
    href: "/tools/serp-checker",
    status: "ready",
    icon: "SR",
  },
  {
    name: "Website Crawl Test",
    description: "Crawl websites to analyze SEO, technical issues, and content structure",
    href: "/tools/website-crawl-test",
    status: "ready",
    icon: "WC",
  },
  {
    name: "Technology Checker",
    description: "Detect frameworks, CMS, libraries, and technologies powering websites",
    href: "/tools/website-technology-checker",
    status: "ready",
    icon: "TC",
  },
  {
    name: "Page Speed Insights",
    description: "Analyze website performance, Core Web Vitals, and get optimization tips",
    href: "/tools/page-speed-insights",
    status: "ready",
    icon: "PS",
  },
  {
    name: "Link Extractor",
    description: "Extract and analyze all links from webpages with SEO insights",
    href: "/tools/link-extractor",
    status: "ready",
    icon: "LE",
  },
  {
    name: "Social Media Preview",
    description: "Preview how content appears on social platforms",
    href: "/tools/social-media-preview",
    status: "ready",
    icon: "SP",
  },
  {
    name: "Keyword Density Analyzer",
    description: "Analyze keyword frequency, density, and get SEO optimization recommendations",
    href: "/tools/keyword-density",
    status: "ready",
    icon: "KD",
  },
];

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get instant results with our optimized analysis tools"
  },
  {
    icon: CheckCircle,
    title: "100% Free",
    description: "All tools are completely free with no hidden costs"
  },
  {
    icon: BarChart3,
    title: "Comprehensive",
    description: "Complete SEO analysis suite in one place"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is safe with enterprise-grade security"
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Analyze websites from anywhere in the world"
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Works perfectly on all devices and screen sizes"
  }
];


export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-muted/20 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              11 Free SEO Tools Available
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Professional SEO Tools
              <span className="text-primary block">100% Free Forever</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Complete SEO toolkit with 11+ professional-grade tools. Analyze meta tags, OpenGraph, HTTP headers, sitemaps, SERP rankings, page speed, and more. Trusted by 10,000+ SEO professionals worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild>
                <Link href="#tools">
                  Explore Tools <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            {/* Quick Launcher */}
            <QuickLauncher />
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 mt-16">
          <ToolStats />
        </div>

      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose TinyWeb?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade SEO tools that deliver real results for your website
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Complete SEO Toolkit
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to analyze, optimize, and improve your website's SEO performance
            </p>
          </div>

          {/* Interactive Tool Search */}
          <ToolSearch tools={tools} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Optimize Your Website?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Start using our free SEO tools today and see immediate improvements in your website's performance.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="#tools">
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* SEO Content Section */}
      <SEOContent />
    </div>
  );
}
