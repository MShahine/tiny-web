import { NextResponse } from 'next/server'
import { db } from '@/db'
import { realtimeAnalyticsTable, dailyAnalyticsTable } from '@/db/schema'
import { desc, count } from 'drizzle-orm'

export async function GET() {
  try {
    console.log('DEBUG: realtime-check endpoint called')
    
    // Check realtime analytics data
    console.log('DEBUG: Querying realtime analytics count...')
    const realtimeCount = await db
      .select({ count: count() })
      .from(realtimeAnalyticsTable)
    
    console.log('DEBUG: Realtime count result:', realtimeCount)
    
    console.log('DEBUG: Querying recent events...')
    const recentEvents = await db
      .select()
      .from(realtimeAnalyticsTable)
      .orderBy(desc(realtimeAnalyticsTable.createdAt))
      .limit(10)
    
    console.log('DEBUG: Recent events result:', recentEvents)
    
    // Check daily analytics data
    const dailyCount = await db
      .select({ count: count() })
      .from(dailyAnalyticsTable)
    
    const recentDaily = await db
      .select()
      .from(dailyAnalyticsTable)
      .orderBy(desc(dailyAnalyticsTable.date))
      .limit(5)
    
    const totalEvents = realtimeCount[0]?.count || 0;
    console.log('DEBUG: Total events count:', totalEvents);
    console.log('DEBUG: Recent events length:', recentEvents.length);
    
    return NextResponse.json({
      realtime: {
        totalEvents: totalEvents,
        recentEvents: recentEvents.map(event => ({
          id: event.id,
          eventType: event.eventType,
          toolType: event.toolType,
          targetUrl: event.targetUrl,
          country: event.country,
          sessionId: event.sessionId,
          success: event.success,
          errorMessage: event.errorMessage,
          createdAt: event.createdAt
        }))
      },
      daily: {
        totalDays: dailyCount[0]?.count || 0,
        recentDays: recentDaily.map(day => ({
          date: day.date,
          totalAnalyses: day.totalAnalyses,
          uniqueUsers: day.uniqueUsers,
          avgResponseTime: day.avgResponseTime
        }))
      }
    })
    
  } catch (error) {
    console.error('Realtime check error:', error)
    return NextResponse.json(
      { error: 'Failed to check realtime data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}