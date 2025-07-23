import Link from "next/link";
import { Zap, Github, Twitter, Mail } from "lucide-react";

const toolLinks = [
  { name: "OpenGraph Preview", href: "/tools/opengraph" },
  { name: "Meta Tags Checker", href: "/tools/meta-tags" },
  { name: "HTTP Headers Checker", href: "/tools/http-headers" },
  { name: "Sitemap Finder", href: "/tools/sitemap-finder" },
  { name: "Robots.txt Tester", href: "/tools/robots-txt-tester" },
  { name: "SERP Rank Checker", href: "/tools/serp-checker" },
];

const moreTools = [
  { name: "Website Crawl Test", href: "/tools/website-crawl-test" },
  { name: "Technology Checker", href: "/tools/website-technology-checker" },
  { name: "Page Speed Insights", href: "/tools/page-speed-insights" },
  { name: "Link Extractor", href: "/tools/link-extractor" },
  { name: "Social Media Preview", href: "/tools/social-media-preview" },
];

export function Footer() {
  return (
    <footer className="border-t m-4 bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-lg">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-bold text-xl">TinyWeb</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Comprehensive suite of free SEO and web analysis tools to optimize your website's performance and search engine rankings.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:contact@tinyweb.tools"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* SEO Tools */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">SEO Tools</h3>
            <ul className="space-y-2">
              {toolLinks.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Tools */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">More Tools</h3>
            <ul className="space-y-2">
              {moreTools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/api-docs"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TinyWeb. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Made with ❤️ for the SEO community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
