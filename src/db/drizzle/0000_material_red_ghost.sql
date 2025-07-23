CREATE TABLE `analysis_results` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`userId` int,
	`toolType` varchar(50) NOT NULL,
	`targetUrl` varchar(2048) NOT NULL,
	`urlHash` varchar(64) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`results` json,
	`errorMessage` text,
	`processingTimeMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `analysis_results_id` PRIMARY KEY(`id`),
	CONSTRAINT `tool_url_idx` UNIQUE(`toolType`,`urlHash`)
);
--> statement-breakpoint
CREATE TABLE `http_headers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`headerName` varchar(255) NOT NULL,
	`headerValue` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `http_headers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`url` varchar(2048) NOT NULL,
	`anchorText` text,
	`linkType` varchar(20) NOT NULL,
	`isNoFollow` boolean DEFAULT false,
	`isNoIndex` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meta_tags` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`name` varchar(255),
	`property` varchar(255),
	`content` text,
	`httpEquiv` varchar(255),
	`charset` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meta_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opengraph_data` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`title` text,
	`description` text,
	`image` varchar(2048),
	`imageAlt` text,
	`url` varchar(2048),
	`siteName` varchar(255),
	`type` varchar(50),
	`locale` varchar(10),
	`twitterCard` varchar(50),
	`twitterSite` varchar(255),
	`twitterCreator` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `opengraph_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`toolType` varchar(50) NOT NULL,
	`requestCount` int NOT NULL DEFAULT 1,
	`windowStart` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rate_limits_id` PRIMARY KEY(`id`),
	CONSTRAINT `identifier_tool_idx` UNIQUE(`identifier`,`toolType`,`windowStart`)
);
--> statement-breakpoint
CREATE TABLE `serp_rankings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`keyword` varchar(500) NOT NULL,
	`searchEngine` varchar(50) NOT NULL DEFAULT 'google',
	`country` varchar(2) DEFAULT 'US',
	`language` varchar(5) DEFAULT 'en',
	`position` int,
	`title` text,
	`snippet` text,
	`displayUrl` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `serp_rankings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technologies` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`version` varchar(100),
	`confidence` int,
	`evidence` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `technologies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastActiveAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
ALTER TABLE `analysis_results` ADD CONSTRAINT `analysis_results_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `http_headers` ADD CONSTRAINT `http_headers_analysisId_analysis_results_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `analysis_results`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `links` ADD CONSTRAINT `links_analysisId_analysis_results_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `analysis_results`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meta_tags` ADD CONSTRAINT `meta_tags_analysisId_analysis_results_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `analysis_results`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `opengraph_data` ADD CONSTRAINT `opengraph_data_analysisId_analysis_results_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `analysis_results`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serp_rankings` ADD CONSTRAINT `serp_rankings_analysisId_analysis_results_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `analysis_results`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `technologies` ADD CONSTRAINT `technologies_analysisId_analysis_results_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `analysis_results`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_idx` ON `analysis_results` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `analysis_results` (`status`);--> statement-breakpoint
CREATE INDEX `expires_idx` ON `analysis_results` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `analysis_idx` ON `http_headers` (`analysisId`);--> statement-breakpoint
CREATE INDEX `header_idx` ON `http_headers` (`headerName`);--> statement-breakpoint
CREATE INDEX `analysis_idx` ON `links` (`analysisId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `links` (`linkType`);--> statement-breakpoint
CREATE INDEX `analysis_idx` ON `meta_tags` (`analysisId`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `meta_tags` (`name`);--> statement-breakpoint
CREATE INDEX `analysis_idx` ON `opengraph_data` (`analysisId`);--> statement-breakpoint
CREATE INDEX `analysis_idx` ON `serp_rankings` (`analysisId`);--> statement-breakpoint
CREATE INDEX `keyword_idx` ON `serp_rankings` (`keyword`);--> statement-breakpoint
CREATE INDEX `analysis_idx` ON `technologies` (`analysisId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `technologies` (`category`);--> statement-breakpoint
CREATE INDEX `session_idx` ON `users` (`sessionId`);--> statement-breakpoint
CREATE INDEX `ip_idx` ON `users` (`ipAddress`);