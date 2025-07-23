import { NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET() {
  try {
    console.log('🔍 TABLE CHECK: Starting table existence check')
    
    // Test 1: Check if daily_analytics table exists
    console.log('📊 Test 1: Checking if daily_analytics table exists...')
    const tableCheckResult = await db.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'daily_analytics'
    `)
    console.log('📊 Table check result:', tableCheckResult)
    
    if (tableCheckResult[0].length === 0) {
      console.log('❌ daily_analytics table does NOT exist')
      
      // Show all tables
      const allTablesResult = await db.execute(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
      `)
      console.log('📋 Available tables:', allTablesResult[0])
      
      return NextResponse.json({
        tableExists: false,
        availableTables: allTablesResult[0],
        message: 'daily_analytics table does not exist - migrations may need to be run'
      })
    }
    
    console.log('✅ daily_analytics table exists')
    
    // Test 2: Check table structure
    console.log('📊 Test 2: Checking table structure...')
    const columnsResult = await db.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'daily_analytics'
      ORDER BY ORDINAL_POSITION
    `)
    console.log('📊 Table columns:', columnsResult[0])
    
    // Test 3: Simple count query
    console.log('📊 Test 3: Testing simple count query...')
    const countResult = await db.execute('SELECT COUNT(*) as count FROM daily_analytics')
    console.log('📊 Row count:', countResult[0])
    
    // Test 4: Test the problematic date range query with a smaller range
    console.log('📊 Test 4: Testing date range query...')
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const dateRangeResult = await db.execute(`
      SELECT id, date, totalAnalyses, uniqueUsers 
      FROM daily_analytics 
      WHERE date >= ? AND date <= ? 
      ORDER BY date DESC 
      LIMIT 5
    `, [yesterday, today])
    console.log('📊 Date range result:', dateRangeResult[0])
    
    return NextResponse.json({
      tableExists: true,
      columns: columnsResult[0],
      rowCount: countResult[0][0],
      sampleData: dateRangeResult[0],
      message: 'Table check completed successfully'
    })
    
  } catch (error) {
    console.error('❌ TABLE CHECK ERROR:', error)
    return NextResponse.json(
      { 
        error: 'Table check failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}