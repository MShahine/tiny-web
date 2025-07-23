"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Globe, Zap } from "lucide-react";
import Link from "next/link";

const popularTools = [
  {
    name: "OpenGraph Preview",
    description: "Quick social media preview",
    href: "/tools/opengraph",
    icon: "OG",
    color: "bg-blue-500"
  },
  {
    name: "Meta Tags Checker",
    description: "SEO optimization analysis",
    href: "/tools/meta-tags",
    icon: "MT",
    color: "bg-purple-500"
  },
  {
    name: "Image SEO Analyzer",
    description: "Optimize images for SEO",
    href: "/tools/image-seo",
    icon: "IMG",
    color: "bg-orange-500"
  },
  {
    name: "Page Speed Insights",
    description: "Performance analysis",
    href: "/tools/page-speed-insights",
    icon: "PS",
    color: "bg-green-500"
  }
];

export function QuickLauncher() {
  const [url, setUrl] = useState("");

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleQuickAnalysis = (toolPath: string) => {
    if (url && isValidUrl(url)) {
      window.open(`${toolPath}?url=${encodeURIComponent(url)}`, '_blank');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter a URL and instantly analyze with our most popular tools
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10"
            />
          </div>
          {url && !isValidUrl(url) && (
            <p className="text-xs text-destructive">Please enter a valid URL</p>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">Popular Tools</Badge>
          </div>
          <div className="grid gap-2">
            {popularTools.map((tool) => (
              <Button
                key={tool.href}
                variant="outline"
                className="justify-between h-auto p-3"
                onClick={() => handleQuickAnalysis(tool.href)}
                disabled={!url || !isValidUrl(url)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold ${tool.color}`}>
                    {tool.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{tool.name}</div>
                    <div className="text-xs text-muted-foreground">{tool.description}</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        {/* Browse All Tools */}
        <div className="pt-4 border-t">
          <Button asChild variant="ghost" className="w-full">
            <Link href="#tools">
              Browse All Tools <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}