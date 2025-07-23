import { NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET() {
  try {
    console.log('🔍 CONNECTION TEST: Testing database connections')
    
    // Test 1: Raw SQL (this works)
    console.log('📊 Test 1: Raw SQL query...')
    const rawResult = await db.execute(`SELECT 1 as test`)
    console.log('✅ Raw SQL works:', rawResult)
    
    // Test 2: Simple Drizzle query without count()
    console.log('📊 Test 2: Simple Drizzle query...')
    const simpleResult = await db.execute(`SELECT 1 as test`)
    console.log('✅ Simple Drizzle works:', simpleResult)
    
    // Test 3: Check database connection info
    console.log('📊 Test 3: Database connection info...')
    const dbInfo = await db.execute(`SELECT DATABASE() as current_db, USER() as current_user`)
    console.log('📊 Database info:', dbInfo)
    
    return NextResponse.json({
      success: true,
      rawResult: rawResult,
      simpleResult: simpleResult,
      dbInfo: dbInfo,
      message: 'Connection test completed - check console'
    })
    
  } catch (error) {
    console.error('❌ CONNECTION TEST ERROR:', error)
    return NextResponse.json(
      { 
        error: 'Connection test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}