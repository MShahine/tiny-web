import {
  int,
  mysqlTable,
  varchar,
  text,
  json,
  timestamp,
  boolean,
  index,
  uniqueIndex
} from 'drizzle-orm/mysql-core';

// Users table for tracking usage and rate limiting
export const usersTable = mysqlTable('users', {
  id: int().primaryKey().autoincrement(),
  sessionId: varchar({ length: 255 }).notNull().unique(), // For anonymous users
  ipAddress: varchar({ length: 45 }).notNull(), // IPv4/IPv6
  userAgent: text(),
  createdAt: timestamp().defaultNow().notNull(),
  lastActiveAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index('session_idx').on(table.sessionId),
  ipIdx: index('ip_idx').on(table.ipAddress),
}));

// Main analysis results table - stores results for all tools
export const analysisResultsTable = mysqlTable('analysis_results', {
  id: int().primaryKey().autoincrement(),
  userId: int().references(() => usersTable.id),
  toolType: varchar({ length: 50 }).notNull(), // 'opengraph', 'sitemap', 'robots', etc.
  targetUrl: varchar({ length: 2048 }).notNull(), // URL being analyzed
  urlHash: varchar({ length: 64 }).notNull(), // SHA-256 hash for quick lookups
  status: varchar({ length: 20 }).notNull().default('pending'), // 'pending', 'completed', 'failed'
  results: json(), // Tool-specific results stored as JSON
  errorMessage: text(),
  processingTimeMs: int(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  expiresAt: timestamp(), // For cache expiration
}, (table) => ({
  toolUrlIdx: uniqueIndex('tool_url_idx').on(table.toolType, table.urlHash),
  userIdx: index('user_idx').on(table.userId),
  statusIdx: index('status_idx').on(table.status),
  expiresIdx: index('expires_idx').on(table.expiresAt),
}));

// Rate limiting table
export const rateLimitsTable = mysqlTable('rate_limits', {
  id: int().primaryKey().autoincrement(),
  identifier: varchar({ length: 255 }).notNull(), // IP or session ID
  toolType: varchar({ length: 50 }).notNull(),
  requestCount: int().notNull().default(1),
  windowStart: timestamp().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  identifierToolIdx: uniqueIndex('identifier_tool_idx').on(table.identifier, table.toolType, table.windowStart),
}));

// OpenGraph specific data (for detailed social media previews)
export const openGraphDataTable = mysqlTable('opengraph_data', {
  id: int().primaryKey().autoincrement(),
  analysisId: int().references(() => analysisResultsTable.id).notNull(),
  title: text(),
  description: text(),
  image: varchar({ length: 2048 }),
  imageAlt: text(),
  url: varchar({ length: 2048 }),
  siteName: varchar({ length: 255 }),
  type: varchar({ length: 50 }),
  locale: varchar({ length: 10 }),
  // Platform-specific data
  twitterCard: varchar({ length: 50 }),
  twitterSite: varchar({ length: 255 }),
  twitterCreator: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  analysisIdx: index('analysis_idx').on(table.analysisId),
}));

// Meta tags data
export const metaTagsTable = mysqlTable('meta_tags', {
  id: int().primaryKey().autoincrement(),
  analysisId: int().references(() => analysisResultsTable.id).notNull(),
  name: varchar({ length: 255 }),
  property: varchar({ length: 255 }),
  content: text(),
  httpEquiv: varchar({ length: 255 }),
  charset: varchar({ length: 50 }),
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  analysisIdx: index('analysis_idx').on(table.analysisId),
  nameIdx: index('name_idx').on(table.name),
}));

// HTTP headers data
export const httpHeadersTable = mysqlTable('http_headers', {
  id: int().primaryKey().autoincrement(),
  analysisId: int().references(() => analysisResultsTable.id).notNull(),
  headerName: varchar({ length: 255 }).notNull(),
  headerValue: text(),
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  analysisIdx: index('analysis_idx').on(table.analysisId),
  headerIdx: index('header_idx').on(table.headerName),
}));

// Links and anchor texts
export const linksTable = mysqlTable('links', {
  id: int().primaryKey().autoincrement(),
  analysisId: int().references(() => analysisResultsTable.id).notNull(),
  url: varchar({ length: 2048 }).notNull(),
  anchorText: text(),
  linkType: varchar({ length: 20 }).notNull(), // 'internal', 'external', 'mailto', etc.
  isNoFollow: boolean().default(false),
  isNoIndex: boolean().default(false),
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  analysisIdx: index('analysis_idx').on(table.analysisId),
  typeIdx: index('type_idx').on(table.linkType),
}));

// Technology detection results
export const technologiesTable = mysqlTable('technologies', {
  id: int().primaryKey().autoincrement(),
  analysisId: int().references(() => analysisResultsTable.id).notNull(),
  category: varchar({ length: 100 }).notNull(), // 'cms', 'framework', 'analytics', etc.
  name: varchar({ length: 255 }).notNull(),
  version: varchar({ length: 100 }),
  confidence: int(), // 0-100
  evidence: json(), // What indicated this technology
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  analysisIdx: index('analysis_idx').on(table.analysisId),
  categoryIdx: index('category_idx').on(table.category),
}));

// SERP ranking data
export const serpRankingsTable = mysqlTable('serp_rankings', {
  id: int().primaryKey().autoincrement(),
  analysisId: int().references(() => analysisResultsTable.id).notNull(),
  keyword: varchar({ length: 500 }).notNull(),
  searchEngine: varchar({ length: 50 }).notNull().default('google'),
  country: varchar({ length: 2 }).default('US'),
  language: varchar({ length: 5 }).default('en'),
  position: int(),
  title: text(),
  snippet: text(),
  displayUrl: varchar({ length: 2048 }),
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  analysisIdx: index('analysis_idx').on(table.analysisId),
  keywordIdx: index('keyword_idx').on(table.keyword),
}));

// Keyword density analysis data
export const keywordDensityTable = mysqlTable('keyword_density', {
  id: int().primaryKey().autoincrement(),
  analysisId: int().references(() => analysisResultsTable.id).notNull(),
  keyword: varchar({ length: 255 }).notNull(),
  frequency: int().notNull(),
  density: int().notNull(), // Stored as percentage * 100 (e.g., 250 = 2.50%)
  tfIdfScore: int(), // Stored as score * 1000 for precision
  keywordType: varchar({ length: 20 }).notNull(), // 'single', 'phrase', 'long_tail'
  position: varchar({ length: 20 }), // 'title', 'h1', 'h2', 'body', 'meta'
  isStopWord: boolean().default(false),
  stemmedForm: varchar({ length: 255 }), // Root form of the keyword
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  analysisIdx: index('kd_analysis_idx').on(table.analysisId),
  keywordIdx: index('kd_keyword_idx').on(table.keyword),
  densityIdx: index('kd_density_idx').on(table.density),
  typeIdx: index('kd_type_idx').on(table.keywordType),
}));

// Keyword suggestions and related terms
export const keywordSuggestionsTable = mysqlTable('keyword_suggestions', {
  id: int().primaryKey().autoincrement(),
  analysisId: int().references(() => analysisResultsTable.id).notNull(),
  originalKeyword: varchar({ length: 255 }).notNull(),
  suggestedKeyword: varchar({ length: 255 }).notNull(),
  suggestionType: varchar({ length: 30 }).notNull(), // 'related', 'semantic', 'long_tail', 'lsi'
  relevanceScore: int().notNull(), // 0-100
  searchVolume: int(), // Estimated monthly searches (if available)
  competition: varchar({ length: 10 }), // 'low', 'medium', 'high'
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  analysisIdx: index('ks_analysis_idx').on(table.analysisId),
  originalIdx: index('ks_original_idx').on(table.originalKeyword),
  typeIdx: index('ks_type_idx').on(table.suggestionType),
}));

// ============================================================================
// ADVANCED ANALYTICS TABLES - REAL DATA TRACKING
// ============================================================================

// Daily analytics aggregation - for fast dashboard queries
export const dailyAnalyticsTable = mysqlTable('daily_analytics', {
  id: int().primaryKey().autoincrement(),
  date: varchar({ length: 10 }).notNull(), // YYYY-MM-DD format
  
  // Tool usage stats
  totalAnalyses: int().notNull().default(0),
  uniqueUsers: int().notNull().default(0),
  uniqueIPs: int().notNull().default(0),
  
  // Tool breakdown
  metaTagsUsage: int().notNull().default(0),
  openGraphUsage: int().notNull().default(0),
  httpHeadersUsage: int().notNull().default(0),
  serpCheckerUsage: int().notNull().default(0),
  sitemapFinderUsage: int().notNull().default(0),
  robotsTxtUsage: int().notNull().default(0),
  linkExtractorUsage: int().notNull().default(0),
  pageSpeedUsage: int().notNull().default(0),
  technologyCheckerUsage: int().notNull().default(0),
  socialPreviewUsage: int().notNull().default(0),
  websiteCrawlUsage: int().notNull().default(0),
  keywordDensityUsage: int().notNull().default(0),
  
  // Geographic data
  topCountries: json(), // [{country: 'US', count: 150}, ...]
  topCities: json(), // [{city: 'New York', count: 50}, ...]
  
  // Performance metrics
  avgResponseTime: int(), // milliseconds
  successRate: int(), // percentage (0-100)
  errorCount: int().notNull().default(0),
  
  // Popular domains analyzed
  topDomains: json(), // [{domain: 'example.com', count: 25}, ...]
  
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  dateIdx: uniqueIndex('date_idx').on(table.date),
}));

// Real-time analytics - for live dashboard updates
export const realtimeAnalyticsTable = mysqlTable('realtime_analytics', {
  id: int().primaryKey().autoincrement(),
  sessionId: varchar({ length: 255 }).notNull(),
  
  // Event data
  eventType: varchar({ length: 50 }).notNull(), // 'tool_usage', 'page_view', 'error'
  toolType: varchar({ length: 50 }), // null for non-tool events
  targetUrl: varchar({ length: 2048 }),
  
  // User context
  ipAddress: varchar({ length: 45 }).notNull(),
  userAgent: text(),
  country: varchar({ length: 2 }),
  city: varchar({ length: 100 }),
  referrer: text(),
  
  // Performance data
  responseTime: int(), // milliseconds
  success: boolean().default(true),
  errorMessage: text(),
  
  // Additional metadata
  metadata: json(), // Flexible field for extra data
  
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index('session_idx').on(table.sessionId),
  eventTypeIdx: index('event_type_idx').on(table.eventType),
  toolTypeIdx: index('tool_type_idx').on(table.toolType),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
  countryIdx: index('country_idx').on(table.country),
}));

// Popular URLs being analyzed - trending domains
export const popularUrlsTable = mysqlTable('popular_urls', {
  id: int().primaryKey().autoincrement(),
  domain: varchar({ length: 255 }).notNull(),
  fullUrl: varchar({ length: 2048 }).notNull(),
  urlHash: varchar({ length: 64 }).notNull(), // SHA-256 for quick lookups
  
  // Usage statistics
  totalAnalyses: int().notNull().default(1),
  uniqueUsers: int().notNull().default(1),
  lastAnalyzed: timestamp().defaultNow().notNull(),
  
  // Tool usage breakdown
  toolsUsed: json(), // ['meta-tags', 'opengraph', 'headers']
  
  // SEO insights from analyses
  avgSeoScore: int(), // Average SEO score across tools
  commonIssues: json(), // Most frequent issues found
  
  // Trending data
  dailyCount: int().notNull().default(0), // Today's count
  weeklyCount: int().notNull().default(0), // This week's count
  monthlyCount: int().notNull().default(0), // This month's count
  
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  domainIdx: index('domain_idx').on(table.domain),
  urlHashIdx: uniqueIndex('url_hash_idx').on(table.urlHash),
  totalAnalysesIdx: index('total_analyses_idx').on(table.totalAnalyses),
  lastAnalyzedIdx: index('last_analyzed_idx').on(table.lastAnalyzed),
}));

// User behavior tracking - for UX optimization
export const userBehaviorTable = mysqlTable('user_behavior', {
  id: int().primaryKey().autoincrement(),
  sessionId: varchar({ length: 255 }).notNull(),
  
  // Page/tool interaction
  page: varchar({ length: 100 }).notNull(), // 'homepage', 'meta-tags', 'opengraph'
  action: varchar({ length: 50 }).notNull(), // 'view', 'analyze', 'export', 'share'
  
  // Interaction details
  timeOnPage: int(), // seconds
  scrollDepth: int(), // percentage (0-100)
  clicksCount: int().notNull().default(0),
  
  // Tool-specific behavior
  toolCompleted: boolean().default(false),
  exportedResults: boolean().default(false),
  sharedResults: boolean().default(false),
  
  // User journey
  previousPage: varchar({ length: 100 }),
  nextPage: varchar({ length: 100 }),
  sessionDuration: int(), // total session time in seconds
  
  // Device/browser info
  deviceType: varchar({ length: 20 }), // 'desktop', 'mobile', 'tablet'
  browserName: varchar({ length: 50 }),
  screenResolution: varchar({ length: 20 }),
  
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index('behavior_session_idx').on(table.sessionId),
  pageIdx: index('behavior_page_idx').on(table.page),
  actionIdx: index('behavior_action_idx').on(table.action),
  createdAtIdx: index('behavior_created_at_idx').on(table.createdAt),
}));

// Performance monitoring - track system health
export const performanceMetricsTable = mysqlTable('performance_metrics', {
  id: int().primaryKey().autoincrement(),
  
  // Time period
  timestamp: timestamp().defaultNow().notNull(),
  period: varchar({ length: 10 }).notNull(), // 'minute', 'hour', 'day'
  
  // API performance
  avgResponseTime: int(), // milliseconds
  p95ResponseTime: int(), // 95th percentile
  p99ResponseTime: int(), // 99th percentile
  
  // Error rates
  totalRequests: int().notNull().default(0),
  successfulRequests: int().notNull().default(0),
  failedRequests: int().notNull().default(0),
  errorRate: int(), // percentage (0-100)
  
  // Tool-specific performance
  toolPerformance: json(), // {tool: avg_time} for each tool
  
  createdAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  timestampIdx: index('perf_timestamp_idx').on(table.timestamp),
  periodIdx: index('perf_period_idx').on(table.period),
}));
