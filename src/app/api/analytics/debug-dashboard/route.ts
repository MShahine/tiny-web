import { NextResponse } from 'next/server'
import { getDashboardStats } from '@/lib/analytics'

export async function GET() {
  try {
    console.log('🔍 DEBUG DASHBOARD: Testing dashboard data flow')
    
    // Test dashboard stats function
    console.log('📊 Calling getDashboardStats...')
    const stats = await getDashboardStats(30)
    
    console.log('📊 Dashboard stats result:', JSON.stringify(stats, null, 2))
    
    if (!stats) {
      return NextResponse.json({
        error: 'getDashboardStats returned null',
        message: 'Check console for detailed logs'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      stats: stats,
      message: 'Dashboard stats retrieved successfully'
    })
    
  } catch (error) {
    console.error('❌ DEBUG DASHBOARD ERROR:', error)
    return NextResponse.json(
      { 
        error: 'Dashboard debug failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}