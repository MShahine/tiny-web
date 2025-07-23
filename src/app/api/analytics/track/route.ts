import { NextRequest, NextResponse } from 'next/server'
import { trackEvent, getLocationFromIP } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.sessionId || !body.eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, eventType' },
        { status: 400 }
      )
    }

    // Get client IP and location
    const ipAddress = getClientIP(request)
    const location = await getLocationFromIP(ipAddress)

    // Track the event
    await trackEvent({
      sessionId: body.sessionId,
      eventType: body.eventType,
      toolType: body.toolType,
      targetUrl: body.targetUrl,
      ipAddress,
      userAgent: body.metadata?.userAgent || request.headers.get('user-agent') || '',
      country: location.country,
      city: location.city,
      referrer: body.metadata?.referrer,
      responseTime: body.responseTime,
      success: body.success ?? true,
      errorMessage: body.errorMessage,
      metadata: body.metadata
    })

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return request.ip || '127.0.0.1'
}