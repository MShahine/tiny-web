CREATE TABLE `keyword_density` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`keyword` varchar(255) NOT NULL,
	`frequency` int NOT NULL,
	`density` int NOT NULL,
	`tfIdfScore` int,
	`keywordType` varchar(20) NOT NULL,
	`position` varchar(20),
	`isStopWord` boolean DEFAULT false,
	`stemmedForm` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `keyword_density_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `keyword_suggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`originalKeyword` varchar(255) NOT NULL,
	`suggestedKeyword` varchar(255) NOT NULL,
	`suggestionType` varchar(30) NOT NULL,
	`relevanceScore` int NOT NULL,
	`searchVolume` int,
	`competition` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `keyword_suggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `daily_analytics` ADD `keywordDensityUsage` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `keyword_density` ADD CONSTRAINT `keyword_density_analysisId_analysis_results_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `analysis_results`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `keyword_suggestions` ADD CONSTRAINT `keyword_suggestions_analysisId_analysis_results_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `analysis_results`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `kd_analysis_idx` ON `keyword_density` (`analysisId`);--> statement-breakpoint
CREATE INDEX `kd_keyword_idx` ON `keyword_density` (`keyword`);--> statement-breakpoint
CREATE INDEX `kd_density_idx` ON `keyword_density` (`density`);--> statement-breakpoint
CREATE INDEX `kd_type_idx` ON `keyword_density` (`keywordType`);--> statement-breakpoint
CREATE INDEX `ks_analysis_idx` ON `keyword_suggestions` (`analysisId`);--> statement-breakpoint
CREATE INDEX `ks_original_idx` ON `keyword_suggestions` (`originalKeyword`);--> statement-breakpoint
CREATE INDEX `ks_type_idx` ON `keyword_suggestions` (`suggestionType`);