// Advanced Analytics System for TinyWeb
// Real-time data collection and insights generation

import { db } from '@/db'
import { 
  realtimeAnalyticsTable, 
  dailyAnalyticsTable, 
  popularUrlsTable,
  userBehaviorTable,
  performanceMetricsTable
} from '@/db/schema'
import { eq, sql, desc, and, gte, lte, count } from 'drizzle-orm'
import { getDashboardStatsFromRealtime } from './analytics-fallback'

// ============================================================================
// REAL-TIME EVENT TRACKING
// ============================================================================

export interface AnalyticsEvent {
  sessionId: string
  eventType: 'tool_usage' | 'page_view' | 'error' | 'export' | 'share'
  toolType?: string
  targetUrl?: string
  ipAddress: string
  userAgent?: string
  country?: string
  city?: string
  referrer?: string
  responseTime?: number
  success?: boolean
  errorMessage?: string
  metadata?: Record<string, any>
}

export async function trackEvent(event: AnalyticsEvent) {
  try {
    console.log('Analytics: trackEvent called with:', JSON.stringify(event, null, 2))
    
    const insertData = {
      sessionId: event.sessionId,
      eventType: event.eventType,
      toolType: event.toolType,
      targetUrl: event.targetUrl,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent || 'unknown',
      country: event.country,
      city: event.city,
      referrer: event.referrer,
      responseTime: event.responseTime,
      success: event.success ?? true,
      errorMessage: event.errorMessage,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
    }
    
    console.log('Analytics: Inserting data:', JSON.stringify(insertData, null, 2))
    
    const result = await db.insert(realtimeAnalyticsTable).values(insertData)
    
    console.log('Analytics: Event tracked successfully:', result)

    // Update popular URLs if this is a tool usage event
    if (event.eventType === 'tool_usage' && event.targetUrl) {
      await updatePopularUrl(event.targetUrl, event.toolType!)
    }

    return result
  } catch (error) {
    console.error('Failed to track analytics event:', error)
    throw error
  }
}

// ============================================================================
// POPULAR URLS TRACKING
// ============================================================================

async function updatePopularUrl(url: string, toolType: string) {
  try {
    const domain = new URL(url).hostname
    const urlHash = await hashUrl(url)
    
    // Check if URL already exists
    const existing = await db
      .select()
      .from(popularUrlsTable)
      .where(eq(popularUrlsTable.urlHash, urlHash))
      .limit(1)

    if (existing.length > 0) {
      // Update existing record
      const current = existing[0]
      const toolsUsed = JSON.parse(current.toolsUsed as string || '[]')
      if (!toolsUsed.includes(toolType)) {
        toolsUsed.push(toolType)
      }

      await db
        .update(popularUrlsTable)
        .set({
          totalAnalyses: current.totalAnalyses + 1,
          dailyCount: current.dailyCount + 1,
          weeklyCount: current.weeklyCount + 1,
          monthlyCount: current.monthlyCount + 1,
          toolsUsed: JSON.stringify(toolsUsed),
          lastAnalyzed: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(popularUrlsTable.id, current.id))
    } else {
      // Create new record
      await db.insert(popularUrlsTable).values({
        domain,
        fullUrl: url,
        urlHash,
        totalAnalyses: 1,
        uniqueUsers: 1,
        toolsUsed: JSON.stringify([toolType]),
        dailyCount: 1,
        weeklyCount: 1,
        monthlyCount: 1,
      })
    }
  } catch (error) {
    console.error('Failed to update popular URL:', error)
  }
}

// ============================================================================
// DAILY ANALYTICS AGGREGATION
// ============================================================================

export async function aggregateDailyAnalytics(date: string) {
  try {
    const startOfDay = `${date} 00:00:00`
    const endOfDay = `${date} 23:59:59`

    // Get real-time data for the day
    const dayData = await db
      .select()
      .from(realtimeAnalyticsTable)
      .where(
        and(
          gte(realtimeAnalyticsTable.createdAt, new Date(startOfDay)),
          lte(realtimeAnalyticsTable.createdAt, new Date(endOfDay))
        )
      )

    // Calculate aggregated metrics
    const totalAnalyses = dayData.filter(d => d.eventType === 'tool_usage').length
    const uniqueUsers = new Set(dayData.map(d => d.sessionId)).size
    const uniqueIPs = new Set(dayData.map(d => d.ipAddress)).size

    // Tool usage breakdown
    const toolUsage = dayData
      .filter(d => d.eventType === 'tool_usage')
      .reduce((acc, d) => {
        const tool = d.toolType || 'unknown'
        acc[tool] = (acc[tool] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // Geographic data
    const countryData = dayData.reduce((acc, d) => {
      if (d.country) {
        acc[d.country] = (acc[d.country] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const topCountries = Object.entries(countryData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }))

    // Performance metrics
    const responseTimes = dayData
      .filter(d => d.responseTime)
      .map(d => d.responseTime!)
    
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0

    const successCount = dayData.filter(d => d.success).length
    const successRate = dayData.length > 0 
      ? Math.round((successCount / dayData.length) * 100)
      : 100

    // Insert or update daily analytics
    await db.insert(dailyAnalyticsTable).values({
      date,
      totalAnalyses,
      uniqueUsers,
      uniqueIPs,
      metaTagsUsage: toolUsage['meta-tags'] || 0,
      openGraphUsage: toolUsage['opengraph'] || 0,
      httpHeadersUsage: toolUsage['http-headers'] || 0,
      serpCheckerUsage: toolUsage['serp-checker'] || 0,
      sitemapFinderUsage: toolUsage['sitemap-finder'] || 0,
      robotsTxtUsage: toolUsage['robots-txt-tester'] || 0,
      linkExtractorUsage: toolUsage['link-extractor'] || 0,
      pageSpeedUsage: toolUsage['page-speed-insights'] || 0,
      technologyCheckerUsage: toolUsage['website-technology-checker'] || 0,
      socialPreviewUsage: toolUsage['social-media-preview'] || 0,
      websiteCrawlUsage: toolUsage['website-crawl-test'] || 0,
      keywordDensityUsage: toolUsage['keyword-density'] || 0,
      topCountries: JSON.stringify(topCountries),
      avgResponseTime,
      successRate,
      errorCount: dayData.filter(d => !d.success).length,
    })

  } catch (error) {
    console.error('Failed to aggregate daily analytics:', error)
  }
}

// ============================================================================
// ANALYTICS QUERIES - FOR DASHBOARD
// ============================================================================

export async function getDashboardStats(days: number = 30) {
  try {
    console.log('getDashboardStats: Starting with days =', days)
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    console.log('Date range:', startDateStr, 'to', endDateStr)

    // First check if daily_analytics table exists and has data
    let dailyStats = []
    try {
      console.log('Checking if daily_analytics table exists...')
      
      // Use raw SQL with timeout to check table existence
      const tableCheck = await Promise.race([
        db.execute(`
          SELECT COUNT(*) as count 
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'daily_analytics'
        `),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Table check timeout')), 10000)
        )
      ])
      
      console.log('Table check result:', tableCheck)
      
      if (tableCheck[0][0].count === 0) {
        console.log('daily_analytics table does not exist, using realtime data fallback')
        return await getDashboardStatsFromRealtime(days)
      }

      // Get daily analytics for the period with timeout
      console.log('Querying daily_analytics table...')
      const dailyStatsResult = await Promise.race([
        db
          .select()
          .from(dailyAnalyticsTable)
          .where(
            and(
              gte(dailyAnalyticsTable.date, startDateStr),
              lte(dailyAnalyticsTable.date, endDateStr)
            )
          )
          .orderBy(desc(dailyAnalyticsTable.date)),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 15000)
        )
      ])
      
      dailyStats = dailyStatsResult as any[]
      console.log('Found', dailyStats.length, 'daily stats records')

    } catch (error) {
      console.log('Error querying daily_analytics, falling back to realtime data:', error.message)
      return await getDashboardStatsFromRealtime(days)
    }

    // If no daily stats found, fall back to realtime data
    if (dailyStats.length === 0) {
      console.log('No daily stats found, using realtime data fallback')
      return await getDashboardStatsFromRealtime(days)
    }

    // Calculate totals from daily stats
    const totalAnalyses = dailyStats.reduce((sum, day) => sum + day.totalAnalyses, 0)
    const totalUsers = dailyStats.reduce((sum, day) => sum + day.uniqueUsers, 0)
    const avgResponseTime = dailyStats.length > 0 ? Math.round(
      dailyStats.reduce((sum, day) => sum + (day.avgResponseTime || 0), 0) / dailyStats.length
    ) : 0

    // Tool popularity
    const toolStats = {
      'meta-tags': dailyStats.reduce((sum, day) => sum + day.metaTagsUsage, 0),
      'opengraph': dailyStats.reduce((sum, day) => sum + day.openGraphUsage, 0),
      'http-headers': dailyStats.reduce((sum, day) => sum + day.httpHeadersUsage, 0),
      'serp-checker': dailyStats.reduce((sum, day) => sum + day.serpCheckerUsage, 0),
      'sitemap-finder': dailyStats.reduce((sum, day) => sum + day.sitemapFinderUsage, 0),
      'robots-txt-tester': dailyStats.reduce((sum, day) => sum + day.robotsTxtUsage, 0),
      'link-extractor': dailyStats.reduce((sum, day) => sum + day.linkExtractorUsage, 0),
      'page-speed-insights': dailyStats.reduce((sum, day) => sum + day.pageSpeedUsage, 0),
      'website-technology-checker': dailyStats.reduce((sum, day) => sum + day.technologyCheckerUsage, 0),
      'social-media-preview': dailyStats.reduce((sum, day) => sum + day.socialPreviewUsage, 0),
      'website-crawl-test': dailyStats.reduce((sum, day) => sum + day.websiteCrawlUsage, 0),
      'keyword-density': dailyStats.reduce((sum, day) => sum + day.keywordDensityUsage, 0),
    }

    // Get top domains with timeout
    let topDomains = []
    try {
      console.log('Querying popular_urls table...')
      const topDomainsResult = await Promise.race([
        db
          .select()
          .from(popularUrlsTable)
          .orderBy(desc(popularUrlsTable.totalAnalyses))
          .limit(10),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Top domains query timeout')), 10000)
        )
      ])
      topDomains = topDomainsResult as any[]
    } catch (error) {
      console.log('Error querying popular_urls:', error.message)
      topDomains = []
    }

    console.log('Dashboard stats completed successfully')
    return {
      totalAnalyses,
      totalUsers,
      avgResponseTime,
      dailyStats,
      toolStats,
      topDomains,
    }

  } catch (error) {
    console.error('Failed to get dashboard stats:', error)
    return null
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function hashUrl(url: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(url)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Get user's geographic location from IP
export async function getLocationFromIP(ip: string): Promise<{ country?: string; city?: string }> {
  try {
    // You can integrate with services like:
    // - ipapi.co
    // - ipgeolocation.io
    // - MaxMind GeoIP
    
    // For now, return empty object
    // In production, implement actual geolocation service
    return {}
  } catch (error) {
    console.error('Failed to get location from IP:', error)
    return {}
  }
}

// Generate session ID
export function generateSessionId(): string {
  return crypto.randomUUID()
}

// Get device type from user agent
export function getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  const ua = userAgent.toLowerCase()
  
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet'
  }
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile'
  }
  
  return 'desktop'
}

// Get browser name from user agent
export function getBrowserName(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  
  if (ua.includes('chrome')) return 'Chrome'
  if (ua.includes('firefox')) return 'Firefox'
  if (ua.includes('safari')) return 'Safari'
  if (ua.includes('edge')) return 'Edge'
  if (ua.includes('opera')) return 'Opera'
  
  return 'Unknown'
}