import { NextRequest, NextResponse } from 'next/server'
import { getDashboardStats } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days parameter must be between 1 and 365' },
        { status: 400 }
      )
    }

    const stats = await getDashboardStats(days)
    
    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to retrieve analytics data' },
        { status: 500 }
      )
    }

    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Analytics dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}