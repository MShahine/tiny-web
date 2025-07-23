CREATE TABLE `daily_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`totalAnalyses` int NOT NULL DEFAULT 0,
	`uniqueUsers` int NOT NULL DEFAULT 0,
	`uniqueIPs` int NOT NULL DEFAULT 0,
	`metaTagsUsage` int NOT NULL DEFAULT 0,
	`openGraphUsage` int NOT NULL DEFAULT 0,
	`httpHeadersUsage` int NOT NULL DEFAULT 0,
	`serpCheckerUsage` int NOT NULL DEFAULT 0,
	`sitemapFinderUsage` int NOT NULL DEFAULT 0,
	`robotsTxtUsage` int NOT NULL DEFAULT 0,
	`linkExtractorUsage` int NOT NULL DEFAULT 0,
	`pageSpeedUsage` int NOT NULL DEFAULT 0,
	`technologyCheckerUsage` int NOT NULL DEFAULT 0,
	`socialPreviewUsage` int NOT NULL DEFAULT 0,
	`websiteCrawlUsage` int NOT NULL DEFAULT 0,
	`topCountries` json,
	`topCities` json,
	`avgResponseTime` int,
	`successRate` int,
	`errorCount` int NOT NULL DEFAULT 0,
	`topDomains` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_analytics_id` PRIMARY KEY(`id`),
	CONSTRAINT `date_idx` UNIQUE(`date`)
);
--> statement-breakpoint
CREATE TABLE `performance_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`period` varchar(10) NOT NULL,
	`avgResponseTime` int,
	`p95ResponseTime` int,
	`p99ResponseTime` int,
	`totalRequests` int NOT NULL DEFAULT 0,
	`successfulRequests` int NOT NULL DEFAULT 0,
	`failedRequests` int NOT NULL DEFAULT 0,
	`errorRate` int,
	`toolPerformance` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performance_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `popular_urls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`fullUrl` varchar(2048) NOT NULL,
	`urlHash` varchar(64) NOT NULL,
	`totalAnalyses` int NOT NULL DEFAULT 1,
	`uniqueUsers` int NOT NULL DEFAULT 1,
	`lastAnalyzed` timestamp NOT NULL DEFAULT (now()),
	`toolsUsed` json,
	`avgSeoScore` int,
	`commonIssues` json,
	`dailyCount` int NOT NULL DEFAULT 0,
	`weeklyCount` int NOT NULL DEFAULT 0,
	`monthlyCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `popular_urls_id` PRIMARY KEY(`id`),
	CONSTRAINT `url_hash_idx` UNIQUE(`urlHash`)
);
--> statement-breakpoint
CREATE TABLE `realtime_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`eventType` varchar(50) NOT NULL,
	`toolType` varchar(50),
	`targetUrl` varchar(2048),
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	`country` varchar(2),
	`city` varchar(100),
	`referrer` text,
	`responseTime` int,
	`success` boolean DEFAULT true,
	`errorMessage` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `realtime_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_behavior` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`page` varchar(100) NOT NULL,
	`action` varchar(50) NOT NULL,
	`timeOnPage` int,
	`scrollDepth` int,
	`clicksCount` int NOT NULL DEFAULT 0,
	`toolCompleted` boolean DEFAULT false,
	`exportedResults` boolean DEFAULT false,
	`sharedResults` boolean DEFAULT false,
	`previousPage` varchar(100),
	`nextPage` varchar(100),
	`sessionDuration` int,
	`deviceType` varchar(20),
	`browserName` varchar(50),
	`screenResolution` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_behavior_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analysis_results` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `http_headers` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `links` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `meta_tags` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `opengraph_data` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `rate_limits` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `serp_rankings` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `technologies` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
CREATE INDEX `perf_timestamp_idx` ON `performance_metrics` (`timestamp`);--> statement-breakpoint
CREATE INDEX `perf_period_idx` ON `performance_metrics` (`period`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `popular_urls` (`domain`);--> statement-breakpoint
CREATE INDEX `total_analyses_idx` ON `popular_urls` (`totalAnalyses`);--> statement-breakpoint
CREATE INDEX `last_analyzed_idx` ON `popular_urls` (`lastAnalyzed`);--> statement-breakpoint
CREATE INDEX `session_idx` ON `realtime_analytics` (`sessionId`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `realtime_analytics` (`eventType`);--> statement-breakpoint
CREATE INDEX `tool_type_idx` ON `realtime_analytics` (`toolType`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `realtime_analytics` (`createdAt`);--> statement-breakpoint
CREATE INDEX `country_idx` ON `realtime_analytics` (`country`);--> statement-breakpoint
CREATE INDEX `behavior_session_idx` ON `user_behavior` (`sessionId`);--> statement-breakpoint
CREATE INDEX `behavior_page_idx` ON `user_behavior` (`page`);--> statement-breakpoint
CREATE INDEX `behavior_action_idx` ON `user_behavior` (`action`);--> statement-breakpoint
CREATE INDEX `behavior_created_at_idx` ON `user_behavior` (`createdAt`);