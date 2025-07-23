// Vercel Analytics Integration for TinyWeb
import { track } from '@vercel/analytics';
import { envConfig } from './env-config';

// Tool usage events
export const trackToolUsage = (toolName: string, action: 'start' | 'complete' | 'error', metadata?: Record<string, any>) => {
  if (!envConfig.analytics.vercel.enabled) return;

  track(`tool_${action}`, {
    tool: toolName,
    ...metadata,
  });
};

// Page view events
export const trackPageView = (page: string, metadata?: Record<string, any>) => {
  if (!envConfig.analytics.vercel.enabled) return;

  track('page_view', {
    page,
    ...metadata,
  });
};

// Export events
export const trackExport = (toolName: string, format: string, metadata?: Record<string, any>) => {
  if (!envConfig.analytics.vercel.enabled) return;

  track('export', {
    tool: toolName,
    format,
    ...metadata,
  });
};

// Share events
export const trackShare = (toolName: string, platform: string, metadata?: Record<string, any>) => {
  if (!envConfig.analytics.vercel.enabled) return;

  track('share', {
    tool: toolName,
    platform,
    ...metadata,
  });
};

// Error events
export const trackError = (errorType: string, toolName?: string, metadata?: Record<string, any>) => {
  if (!envConfig.analytics.vercel.enabled) return;

  track('error', {
    error_type: errorType,
    ...(toolName && { tool: toolName }),
    ...metadata,
  });
};

// Performance events
export const trackPerformance = (metric: string, value: number, toolName?: string, metadata?: Record<string, any>) => {
  if (!envConfig.analytics.vercel.enabled) return;

  track('performance', {
    metric,
    value,
    ...(toolName && { tool: toolName }),
    ...metadata,
  });
};

// User engagement events
export const trackEngagement = (action: string, metadata?: Record<string, any>) => {
  if (!envConfig.analytics.vercel.enabled) return;

  track('engagement', {
    action,
    ...metadata,
  });
};

// Feature usage events
export const trackFeatureUsage = (feature: string, metadata?: Record<string, any>) => {
  if (!envConfig.analytics.vercel.enabled) return;

  track('feature_usage', {
    feature,
    ...metadata,
  });
};

// Search events
export const trackSearch = (query: string, results: number, metadata?: Record<string, any>) => {
  if (!envConfig.analytics.vercel.enabled) return;

  track('search', {
    query: query.toLowerCase(),
    results,
    ...metadata,
  });
};

// Conversion events
export const trackConversion = (type: string, value?: number, metadata?: Record<string, any>) => {
  if (!envConfig.analytics.vercel.enabled) return;

  track('conversion', {
    type,
    ...(value !== undefined && { value }),
    ...metadata,
  });
};
