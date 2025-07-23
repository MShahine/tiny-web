import { NextRequest, NextResponse } from 'next/server'
import { getDashboardStats } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const format = searchParams.get('format') || 'csv'
    
    // Validate parameters
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days parameter must be between 1 and 365' },
        { status: 400 }
      )
    }

    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be csv or json' },
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

    if (format === 'json') {
      return NextResponse.json(stats, {
        headers: {
          'Content-Disposition': `attachment; filename="analytics-${days}days.json"`,
          'Content-Type': 'application/json'
        }
      })
    }

    // Generate CSV
    const csv = generateCSV(stats)
    
    return new NextResponse(csv, {
      headers: {
        'Content-Disposition': `attachment; filename="analytics-${days}days.csv"`,
        'Content-Type': 'text/csv'
      }
    })
    
  } catch (error) {
    console.error('Analytics export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateCSV(stats: any): string {
  const lines: string[] = []
  
  // Header
  lines.push('Date,Total Analyses,Unique Users,Avg Response Time,Success Rate')
  
  // Daily data
  stats.dailyStats.forEach((day: any) => {
    lines.push([
      day.date,
      day.totalAnalyses,
      day.uniqueUsers,
      day.avgResponseTime || 0,
      day.successRate || 100
    ].join(','))
  })
  
  lines.push('') // Empty line
  lines.push('Tool Usage Summary')
  lines.push('Tool,Usage Count,Percentage')
  
  // Tool usage data
  const totalUsage = Object.values(stats.toolStats).reduce((sum: number, count: any) => sum + count, 0)
  Object.entries(stats.toolStats).forEach(([tool, count]: [string, any]) => {
    const percentage = totalUsage > 0 ? ((count / totalUsage) * 100).toFixed(1) : '0'
    lines.push([tool, count, `${percentage}%`].join(','))
  })
  
  lines.push('') // Empty line
  lines.push('Top Domains')
  lines.push('Domain,Total Analyses,Tools Used')
  
  // Top domains data
  stats.topDomains.slice(0, 20).forEach((domain: any) => {
    lines.push([
      domain.domain,
      domain.totalAnalyses,
      Array.isArray(domain.toolsUsed) ? domain.toolsUsed.length : 0
    ].join(','))
  })
  
  return lines.join('\n')
}