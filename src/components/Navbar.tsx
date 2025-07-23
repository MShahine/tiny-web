"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const tools = [
  {
    name: "OpenGraph Preview",
    description: "Preview how your website appears on social media",
    href: "/tools/opengraph",
    category: "Social Media"
  },
  {
    name: "Meta Tags Checker",
    description: "Analyze and optimize meta tags for SEO",
    href: "/tools/meta-tags",
    category: "SEO Analysis"
  },
  {
    name: "HTTP Headers Checker",
    description: "Analyze headers for security and performance",
    href: "/tools/http-headers",
    category: "Technical SEO"
  },
  {
    name: "Sitemap Finder",
    description: "Find and analyze XML sitemaps",
    href: "/tools/sitemap-finder",
    category: "Technical SEO"
  },
  {
    name: "Robots.txt Tester",
    description: "Test robots.txt files and URL accessibility",
    href: "/tools/robots-txt-tester",
    category: "Technical SEO"
  },
  {
    name: "SERP Rank Checker",
    description: "Check keyword rankings in search results",
    href: "/tools/serp-checker",
    category: "SEO Analysis"
  },
  {
    name: "Website Crawl Test",
    description: "Crawl websites for SEO and technical analysis",
    href: "/tools/website-crawl-test",
    category: "Technical SEO"
  },
  {
    name: "Technology Checker",
    description: "Detect frameworks, CMS, and technologies",
    href: "/tools/website-technology-checker",
    category: "Technical Analysis"
  },
  {
    name: "Page Speed Insights",
    description: "Analyze performance and Core Web Vitals",
    href: "/tools/page-speed-insights",
    category: "Performance"
  },
  {
    name: "Link Extractor",
    description: "Extract and analyze webpage links",
    href: "/tools/link-extractor",
    category: "SEO Analysis"
  },
  {
    name: "Social Media Preview",
    description: "Preview content on social platforms",
    href: "/tools/social-media-preview",
    category: "Social Media"
  }
];

const toolCategories = {
  "SEO Analysis": tools.filter(tool => tool.category === "SEO Analysis"),
  "Technical SEO": tools.filter(tool => tool.category === "Technical SEO"),
  "Performance": tools.filter(tool => tool.category === "Performance"),
  "Social Media": tools.filter(tool => tool.category === "Social Media"),
  "Technical Analysis": tools.filter(tool => tool.category === "Technical Analysis"),
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-lg">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-bold text-xl">TinyWeb</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center space-x-4">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>SEO Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[600px] grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium leading-none">SEO Analysis</h4>
                      {toolCategories["SEO Analysis"].map((tool) => (
                        <NavigationMenuLink key={tool.href} asChild>
                          <Link
                            href={tool.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{tool.name}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {tool.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium leading-none">Technical SEO</h4>
                      {toolCategories["Technical SEO"].map((tool) => (
                        <NavigationMenuLink key={tool.href} asChild>
                          <Link
                            href={tool.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{tool.name}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {tool.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Performance & Social</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[500px] grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium leading-none">Performance</h4>
                      {toolCategories["Performance"].map((tool) => (
                        <NavigationMenuLink key={tool.href} asChild>
                          <Link
                            href={tool.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{tool.name}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {tool.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                      <h4 className="text-sm font-medium leading-none mt-4">Technical Analysis</h4>
                      {toolCategories["Technical Analysis"].map((tool) => (
                        <NavigationMenuLink key={tool.href} asChild>
                          <Link
                            href={tool.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{tool.name}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {tool.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium leading-none">Social Media</h4>
                      {toolCategories["Social Media"].map((tool) => (
                        <NavigationMenuLink key={tool.href} asChild>
                          <Link
                            href={tool.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{tool.name}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {tool.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/about"
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    About
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-4">
                <Link href="/" className="text-lg font-semibold" onClick={() => setIsOpen(false)}>
                  Home
                </Link>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">SEO Analysis</h4>
                  {toolCategories["SEO Analysis"].map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="block py-2 text-sm hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Technical SEO</h4>
                  {toolCategories["Technical SEO"].map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="block py-2 text-sm hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Performance & Social</h4>
                  {[...toolCategories["Performance"], ...toolCategories["Social Media"], ...toolCategories["Technical Analysis"]].map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="block py-2 text-sm hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>

                <Link
                  href="/about"
                  className="text-sm hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
