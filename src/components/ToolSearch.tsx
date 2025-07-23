"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Tool {
  name: string;
  description: string;
  href: string;
  status: string;
  icon: string;
  category?: string;
}

interface ToolSearchProps {
  tools: Tool[];
}

export function ToolSearch({ tools }: ToolSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools;
    
    const query = searchQuery.toLowerCase();
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      (tool.category && tool.category.toLowerCase().includes(query))
    );
  }, [tools, searchQuery]);

  const getCategoryColor = (toolName: string) => {
    if (["OpenGraph Preview", "Meta Tags Checker", "SERP Rank Checker", "Link Extractor"].includes(toolName)) {
      return "bg-blue-500";
    }
    if (["HTTP Headers Checker", "Sitemap Finder", "Robots.txt Tester", "Website Crawl Test"].includes(toolName)) {
      return "bg-green-500";
    }
    return "bg-purple-500";
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search SEO tools... (e.g., 'meta tags', 'performance', 'social media')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-4">
            Found {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Card key={tool.href} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${getCategoryColor(tool.name)}`}>
                  {tool.icon}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {tool.status === "ready" ? "Ready" : "Soon"}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{tool.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="mb-4 line-clamp-2">
                {tool.description}
              </CardDescription>
              <Button asChild className="w-full group-hover:bg-primary/90">
                <Link href={tool.href}>
                  Try Tool <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {searchQuery && filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tools found</h3>
          <p className="text-muted-foreground mb-4">
            Try searching for different keywords like "SEO", "performance", or "social media"
          </p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}