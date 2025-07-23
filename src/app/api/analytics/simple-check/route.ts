import { NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET() {
  try {
    console.log('🔍 SIMPLE CHECK: Starting simple database check')
    
    // Test 1: Raw SQL count
    const rawCount = await db.execute(`SELECT COUNT(*) as total FROM realtime_analytics`)
    console.log('📊 Raw count result:', rawCount)
    
    // Test 2: Raw SQL select
    const rawData = await db.execute(`SELECT * FROM realtime_analytics ORDER BY createdAt DESC LIMIT 5`)
    console.log('📊 Raw data result:', rawData)
    
    // Test 3: Check table structure
    const structure = await db.execute(`DESCRIBE realtime_analytics`)
    console.log('📊 Table structure:', structure)
    
    return NextResponse.json({
      success: true,
      rawCount: rawCount,
      rawData: rawData,
      tableStructure: structure,
      message: 'Check console for detailed logs'
    })
    
  } catch (error) {
    console.error('❌ SIMPLE CHECK ERROR:', error)
    return NextResponse.json(
      { 
        error: 'Simple check failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}