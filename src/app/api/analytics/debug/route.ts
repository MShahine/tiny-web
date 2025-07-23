import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { realtimeAnalyticsTable } from '@/db/schema'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Analytics debug endpoint called')
    
    const body = await request.json()
    console.log('📝 DEBUG: Request body:', JSON.stringify(body, null, 2))
    
    // Get client IP
    const ipAddress = getClientIP(request)
    console.log('🌐 DEBUG: Client IP:', ipAddress)
    
    // Test database insertion
    const testEvent = {
      sessionId: body.sessionId || 'debug-session',
      eventType: 'debug_test',
      toolType: 'debug',
      targetUrl: 'https://debug.test',
      ipAddress,
      userAgent: request.headers.get('user-agent') || 'debug-agent',
      country: 'US',
      city: 'Debug City',
      referrer: 'debug-referrer',
      responseTime: 1000,
      success: true,
      errorMessage: null,
      metadata: JSON.stringify({ debug: true, timestamp: new Date().toISOString() })
    }
    
    console.log('💾 DEBUG: Attempting to insert:', JSON.stringify(testEvent, null, 2))
    
    const result = await db.insert(realtimeAnalyticsTable).values(testEvent)
    console.log('✅ DEBUG: Insert result:', result)
    
    // Check if data was actually inserted
    const count = await db.select().from(realtimeAnalyticsTable).limit(5)
    console.log('📊 DEBUG: Recent events count:', count.length)
    console.log('📊 DEBUG: Recent events:', JSON.stringify(count, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Debug test completed',
      testEvent,
      recentEvents: count
    })
    
  } catch (error) {
    console.error('❌ DEBUG: Error in debug endpoint:', error)
    return NextResponse.json(
      { 
        error: 'Debug test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
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