'use client'

import { useEffect, useRef, useReducer } from 'react'
import { track as vercelTrack } from '@vercel/analytics'

interface AnalyticsEvent {
  action: 'tool_start' | 'tool_complete' | 'tool_error' | 'export' | 'share'
  tool: string
  url?: string
  duration?: number
  error?: string
  metadata?: Record<string, any>
}

export function useAnalytics() {
  // @ts-ignore
  const startTime = useRef<number>()
  // @ts-ignore
  const sessionId = useRef<string>()

  useEffect(() => {
    // Get or generate session ID
    sessionId.current = getSessionId()
    startTime.current = Date.now()
  }, [])

  const track = async (event: AnalyticsEvent) => {
    console.log('useAnalytics: Tracking event', event)

    try {
      // Track to internal analytics system
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId.current,
          eventType: event.action,
          toolType: event.tool,
          targetUrl: event.url,
          responseTime: event.duration,
          success: event.action !== 'tool_error',
          errorMessage: event.error,
          metadata: {
            ...event.metadata,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            referrer: document.referrer,
          }
        })
      })

      const result = await response.json()
      console.log('useAnalytics: API response', result)

      // Also track to Vercel Analytics
      vercelTrack(`${event.action}_${event.tool}`, {
        tool: event.tool,
        action: event.action,
        duration: event.duration,
        success: event.action !== 'tool_error',
        ...(event.metadata || {})
      })

    } catch (error) {
      console.error('Failed to track analytics event:', error)
    }
  }

  const trackToolStart = (tool: string, url: string) => {
    startTime.current = Date.now()
    track({
      action: 'tool_start',
      tool,
      url
    })
  }

  const trackToolComplete = (tool: string, url: string, metadata?: Record<string, any>) => {
    const duration = startTime.current ? Date.now() - startTime.current : undefined
    track({
      action: 'tool_complete',
      tool,
      url,
      duration,
      metadata
    })
  }

  const trackToolError = (tool: string, url: string, error: string) => {
    const duration = startTime.current ? Date.now() - startTime.current : undefined
    track({
      action: 'tool_error',
      tool,
      url,
      duration,
      error
    })
  }

  const trackExport = (tool: string, format: string) => {
    track({
      action: 'export',
      tool,
      metadata: { format }
    })
  }

  const trackShare = (tool: string, platform: string) => {
    track({
      action: 'share',
      tool,
      metadata: { platform }
    })
  }

  return {
    trackToolStart,
    trackToolComplete,
    trackToolError,
    trackExport,
    trackShare,
    track
  }
}

function getSessionId(): string {
  // Try to get from cookie first
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'session_id') {
      return value
    }
  }

  // Generate new session ID if not found
  const newSessionId = crypto.randomUUID()
  document.cookie = `session_id=${newSessionId}; max-age=${60 * 60 * 24 * 30}; path=/`
  return newSessionId
}
