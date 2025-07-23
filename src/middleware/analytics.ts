// Analytics middleware for automatic event tracking
import { NextRequest, NextResponse } from 'next/server'
import { trackEvent, generateSessionId, getDeviceType, getBrowserName } from '@/lib/analytics'

export async function analyticsMiddleware(request: NextRequest) {
  const response = NextResponse.next()

  // Get or create session ID
  let sessionId = request.cookies.get('session_id')?.value
  if (!sessionId) {
    sessionId = generateSessionId()
    response.cookies.set('session_id', sessionId, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  }

  // Extract user information
  const userAgent = request.headers.get('user-agent') || ''
  const ipAddress = getClientIP(request)
  const referrer = request.headers.get('referer') || undefined
  const deviceType = getDeviceType(userAgent)
  const browserName = getBrowserName(userAgent)

  // Track page views for tool pages
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/tools/')) {
    const toolName = pathname.split('/')[2]

    // Track page view
    await trackEvent({
      sessionId,
      eventType: 'page_view',
      toolType: toolName,
      ipAddress,
      userAgent,
      referrer,
      metadata: {
        pathname,
        deviceType,
        browserName,
        timestamp: new Date().toISOString()
      }
    })
  }

  return response
}

function getClientIP(request: NextRequest): string {
  // Try various headers for IP address
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

  // Fallback to connection remote address
  return request.headers.get("x-real-ip")  || '127.0.0.1'
}
