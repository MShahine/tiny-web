// Fallback analytics functions
import { db } from '@/db'
import { realtimeAnalyticsTable } from '@/db/schema'
import { and, gte, lte } from 'drizzle-orm'

// Fallback function to get stats from realtime data when daily_analytics is not available
export async function getDashboardStatsFromRealtime(days: number = 30) {
  try {
    console.log('Using realtime data fallback for', days, 'days')
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get realtime data for the period with timeout
    const realtimeData = await Promise.race([
      db
        .select()
        .from(realtimeAnalyticsTable)
        .where(
          and(
            gte(realtimeAnalyticsTable.createdAt, startDate),
            lte(realtimeAnalyticsTable.createdAt, endDate)
          )
        ),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Realtime query timeout')), 15000)
      )
    ]) as any[]

    console.log('Found', realtimeData.length, 'realtime records')

    // Calculate stats from realtime data
    const toolUsageEvents = realtimeData.filter(d => d.eventType === 'tool_usage')
    const totalAnalyses = toolUsageEvents.length
    const uniqueUsers = new Set(realtimeData.map(d => d.sessionId)).size
    
    // Calculate tool usage breakdown
    const toolStats = toolUsageEvents.reduce((acc, event) => {
      const tool = event.toolType || 'unknown'
      acc[tool] = (acc[tool] || 0) + 1
      return acc
    }, {
      'meta-tags': 0,
      'opengraph': 0,
      'http-headers': 0,
      'serp-checker': 0,
      'sitemap-finder': 0,
      'robots-txt-tester': 0,
      'link-extractor': 0,
      'page-speed-insights': 0,
      'website-technology-checker': 0,
      'social-media-preview': 0,
      'website-crawl-test': 0,
      'keyword-density': 0,
    })

    // Calculate average response time
    const responseTimes = realtimeData
      .filter(d => d.responseTime)
      .map(d => d.responseTime)
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0

    // Create mock daily stats for chart display
    const dailyStats = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayEvents = realtimeData.filter(d => {
        const eventDate = new Date(d.createdAt).toISOString().split('T')[0]
        return eventDate === dateStr
      })
      
      const dayToolEvents = dayEvents.filter(d => d.eventType === 'tool_usage')
      
      dailyStats.push({
        date: dateStr,
        totalAnalyses: dayToolEvents.length,
        uniqueUsers: new Set(dayEvents.map(d => d.sessionId)).size,
        uniqueIPs: new Set(dayEvents.map(d => d.ipAddress)).size,
        avgResponseTime: dayEvents.filter(d => d.responseTime).length > 0 
          ? Math.round(dayEvents.filter(d => d.responseTime).reduce((sum, d) => sum + d.responseTime, 0) / dayEvents.filter(d => d.responseTime).length)
          : 0,
        successRate: dayEvents.length > 0 
          ? Math.round((dayEvents.filter(d => d.success).length / dayEvents.length) * 100)
          : 100,
        errorCount: dayEvents.filter(d => !d.success).length,
      })
    }

    console.log('Realtime fallback completed successfully')
    return {
      totalAnalyses,
      totalUsers: uniqueUsers,
      avgResponseTime,
      dailyStats,
      toolStats,
      topDomains: [], // Empty for realtime fallback
      isRealtimeFallback: true
    }

  } catch (error) {
    console.error('Realtime fallback failed:', error)
    // Return empty stats as last resort
    return {
      totalAnalyses: 0,
      totalUsers: 0,
      avgResponseTime: 0,
      dailyStats: [],
      toolStats: {
        'meta-tags': 0,
        'opengraph': 0,
        'http-headers': 0,
        'serp-checker': 0,
        'sitemap-finder': 0,
        'robots-txt-tester': 0,
        'link-extractor': 0,
        'page-speed-insights': 0,
        'website-technology-checker': 0,
        'social-media-preview': 0,
        'website-crawl-test': 0,
        'keyword-density': 0,
      },
      topDomains: [],
      isEmptyFallback: true
    }
  }
}