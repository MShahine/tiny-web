import { NextResponse } from 'next/server'
import { db } from '@/db'
import { realtimeAnalyticsTable } from '@/db/schema'
import { desc, count } from 'drizzle-orm'

export async function GET() {
  try {
    console.log('🔍 DRIZZLE TEST: Testing Drizzle ORM queries')
    
    // Test 1: Simple count with Drizzle
    console.log('📊 Test 1: Drizzle count query...')
    const drizzleCount = await db
      .select({ count: count() })
      .from(realtimeAnalyticsTable)
    console.log('📊 Drizzle count result:', drizzleCount)
    
    // Test 2: Simple select with Drizzle
    console.log('📊 Test 2: Drizzle select query...')
    const drizzleSelect = await db
      .select()
      .from(realtimeAnalyticsTable)
      .limit(5)
    console.log('📊 Drizzle select result:', drizzleSelect)
    
    // Test 3: Select with order by
    console.log('📊 Test 3: Drizzle select with order...')
    const drizzleOrdered = await db
      .select()
      .from(realtimeAnalyticsTable)
      .orderBy(desc(realtimeAnalyticsTable.createdAt))
      .limit(5)
    console.log('📊 Drizzle ordered result:', drizzleOrdered)
    
    // Test 4: Raw SQL for comparison
    console.log('📊 Test 4: Raw SQL for comparison...')
    const rawSQL = await db.execute(`SELECT COUNT(*) as total FROM realtime_analytics`)
    console.log('📊 Raw SQL result:', rawSQL)
    
    return NextResponse.json({
      success: true,
      drizzleCount: drizzleCount,
      drizzleSelect: drizzleSelect,
      drizzleOrdered: drizzleOrdered,
      rawSQL: rawSQL,
      message: 'Check console for detailed Drizzle test results'
    })
    
  } catch (error) {
    console.error('❌ DRIZZLE TEST ERROR:', error)
    return NextResponse.json(
      { 
        error: 'Drizzle test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}