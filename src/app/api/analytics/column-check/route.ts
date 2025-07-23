import { NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET() {
  try {
    console.log('🔍 COLUMN CHECK: Checking actual column names')
    
    // Get the exact column structure
    const columns = await db.execute(`SHOW COLUMNS FROM realtime_analytics`)
    console.log('📊 Actual columns:', columns)
    
    // Try to select with different column name formats
    console.log('🔍 Testing camelCase column names...')
    try {
      const camelTest = await db.execute(`SELECT sessionId, eventType, toolType FROM realtime_analytics LIMIT 1`)
      console.log('✅ camelCase works:', camelTest)
    } catch (error) {
      console.log('❌ camelCase failed:', error.message)
    }
    
    console.log('🔍 Testing snake_case column names...')
    try {
      const snakeTest = await db.execute(`SELECT session_id, event_type, tool_type FROM realtime_analytics LIMIT 1`)
      console.log('✅ snake_case works:', snakeTest)
    } catch (error) {
      console.log('❌ snake_case failed:', error.message)
    }
    
    // Get actual data to see what's there
    const actualData = await db.execute(`SELECT * FROM realtime_analytics LIMIT 2`)
    console.log('📊 Actual data:', actualData)
    
    return NextResponse.json({
      success: true,
      columns: columns,
      actualData: actualData,
      message: 'Check console for detailed column analysis'
    })
    
  } catch (error) {
    console.error('❌ COLUMN CHECK ERROR:', error)
    return NextResponse.json(
      { 
        error: 'Column check failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}