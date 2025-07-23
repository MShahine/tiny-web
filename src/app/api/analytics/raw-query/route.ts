import { NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET() {
  try {
    console.log('🔍 RAW QUERY: Testing direct database queries')
    
    // Test 1: Show all tables
    console.log('📋 Step 1: Checking tables...')
    const tables = await db.execute(`SHOW TABLES`)
    console.log('Tables:', tables)
    
    // Test 2: Check realtime_analytics table structure
    console.log('📋 Step 2: Checking realtime_analytics structure...')
    const structure = await db.execute(`DESCRIBE realtime_analytics`)
    console.log('Table structure:', structure)
    
    // Test 3: Count all records in realtime_analytics
    console.log('📋 Step 3: Counting records...')
    const countResult = await db.execute(`SELECT COUNT(*) as total FROM realtime_analytics`)
    console.log('Count result:', countResult)
    
    // Test 4: Get all records from realtime_analytics
    console.log('📋 Step 4: Getting all records...')
    const allRecords = await db.execute(`SELECT * FROM realtime_analytics ORDER BY createdAt DESC LIMIT 10`)
    console.log('All records:', allRecords)
    
    // Test 5: Check daily_analytics
    console.log('📋 Step 5: Checking daily_analytics...')
    const dailyRecords = await db.execute(`SELECT * FROM daily_analytics ORDER BY date DESC LIMIT 5`)
    console.log('Daily records:', dailyRecords)
    
    return NextResponse.json({
      success: true,
      debug: {
        tables: tables,
        structure: structure,
        count: countResult,
        realtimeRecords: allRecords,
        dailyRecords: dailyRecords
      }
    })
    
  } catch (error) {
    console.error('❌ RAW QUERY ERROR:', error)
    return NextResponse.json(
      { 
        error: 'Raw query failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}