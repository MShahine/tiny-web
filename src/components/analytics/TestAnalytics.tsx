'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Database, RefreshCw, CheckCircle } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'

export function TestAnalytics() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const analytics = useAnalytics()

  const generateTestData = async () => {
    setLoading(true)
    try {
      console.log('Generating test analytics data...')

      // Generate some test events
      const testUrls = [
        'https://example.com',
        'https://google.com',
        'https://github.com',
        'https://stackoverflow.com',
        'https://developer.mozilla.org'
      ]

      const tools = [
        'meta-tags',
        'opengraph',
        'http-headers',
        'serp-checker',
        'link-extractor'
      ]

      // Generate 20 test events
      for (let i = 0; i < 20; i++) {
        const randomUrl = testUrls[Math.floor(Math.random() * testUrls.length)]
        const randomTool = tools[Math.floor(Math.random() * tools.length)]

        // Simulate tool usage
        analytics.trackToolStart(randomTool, randomUrl)

        // Simulate completion after random delay
        setTimeout(() => {
          analytics.trackToolComplete(randomTool, randomUrl, {
            seoScore: Math.floor(Math.random() * 100),
            responseTime: Math.floor(Math.random() * 2000) + 500
          })
        }, Math.random() * 1000)
      }

      // Wait a bit for events to be tracked
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Trigger daily aggregation
      console.log('Triggering daily aggregation...')
      const aggregateResponse = await fetch('/api/analytics/aggregate', {
        method: 'GET'
      })

      const aggregateResult = await aggregateResponse.json()
      console.log('Aggregation result:', aggregateResult)

      // Get dashboard stats
      console.log('Fetching dashboard stats...')
      const statsResponse = await fetch('/api/analytics/dashboard?days=7')
      const stats = await statsResponse.json()

      setResults({
        eventsGenerated: 20,
        aggregateResult,
        dashboardStats: stats
      })

    } catch (error) {
      console.error('Failed to generate test data:', error)
      setResults({ error: error })
    } finally {
      setLoading(false)
    }
  }

  const checkRealtimeData = async () => {
    try {
      const response = await fetch('/api/analytics/realtime-check')
      const data = await response.json()
      console.log('Realtime data check:', data)
    } catch (error) {
      console.error('Failed to check realtime data:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Analytics Test Center
        </CardTitle>
        <CardDescription>
          Generate test data and verify analytics system is working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button
            onClick={generateTestData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Generate Test Data
          </Button>

          <Button
            variant="outline"
            onClick={checkRealtimeData}
          >
            Check Realtime Data
          </Button>
        </div>

        {loading && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800">
              🔄 Generating test analytics data... This will:
            </p>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Generate 20 random tool usage events</li>
              <li>• Track them in realtime_analytics table</li>
              <li>• Aggregate data into daily_analytics</li>
              <li>• Fetch updated dashboard stats</li>
            </ul>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            {results.error ? (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800">❌ Error: {results.error}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Test Completed Successfully!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Events Generated:</span>
                      <Badge variant="secondary" className="ml-2">
                        {results.eventsGenerated}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-green-700">Total Analyses:</span>
                      <Badge variant="secondary" className="ml-2">
                        {results.dashboardStats?.totalAnalyses || 0}
                      </Badge>
                    </div>
                  </div>
                </div>

                {results.dashboardStats && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Dashboard Stats:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Total Users: {results.dashboardStats.totalUsers}</div>
                      <div>Avg Response: {results.dashboardStats.avgResponseTime}ms</div>
                      <div>Daily Records: {results.dashboardStats.dailyStats?.length || 0}</div>
                      <div>Top Domains: {results.dashboardStats.topDomains?.length || 0}</div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    ✅ Analytics system is working! Visit the dashboard to see your data.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 <strong>How it works:</strong></p>
          <p>1. Real-time events are stored in `realtime_analytics`</p>
          <p>2. Daily aggregation processes data into `daily_analytics`</p>
          <p>3. Dashboard queries the aggregated data for fast performance</p>
        </div>
      </CardContent>
    </Card>
  )
}
