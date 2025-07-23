import { NextRequest, NextResponse } from 'next/server'
import { aggregateDailyAnalytics } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date } = body
    
    // Default to today if no date provided
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    console.log(`Aggregating analytics for date: ${targetDate}`)
    
    await aggregateDailyAnalytics(targetDate)
    
    return NextResponse.json({ 
      success: true, 
      message: `Analytics aggregated for ${targetDate}` 
    })
    
  } catch (error) {
    console.error('Analytics aggregation error:', error)
    return NextResponse.json(
      { error: 'Failed to aggregate analytics' },
      { status: 500 }
    )
  }
}

// GET endpoint to trigger aggregation for today
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    console.log(`Auto-aggregating analytics for today: ${today}`)
    
    await aggregateDailyAnalytics(today)
    
    return NextResponse.json({ 
      success: true, 
      message: `Analytics aggregated for ${today}` 
    })
    
  } catch (error) {
    console.error('Analytics aggregation error:', error)
    return NextResponse.json(
      { error: 'Failed to aggregate analytics' },
      { status: 500 }
    )
  }
}