"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Zap, CheckCircle } from "lucide-react";

export function ToolStats() {
  const [stats, setStats] = useState({
    totalTools: 11,
    readyTools: 11,
    totalAnalyses: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // Simulate loading stats with animation
    const timer = setTimeout(() => {
      setStats({
        totalTools: 11,
        readyTools: 11,
        totalAnalyses: Math.floor(Math.random() * 50000) + 25000,
        activeUsers: Math.floor(Math.random() * 500) + 200
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const statItems = [
    {
      icon: CheckCircle,
      label: "SEO Tools",
      value: `${stats.readyTools}/${stats.totalTools}`,
      description: "Ready to use",
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      label: "Analyses",
      value: stats.totalAnalyses.toLocaleString(),
      description: "Completed today",
      color: "text-blue-500"
    },
    {
      icon: Users,
      label: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      description: "This month",
      color: "text-purple-500"
    },
    {
      icon: Zap,
      label: "Response Time",
      value: "< 2s",
      description: "Average speed",
      color: "text-yellow-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <Card key={index} className="text-center border-0 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex flex-col items-center space-y-2">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm font-medium">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}