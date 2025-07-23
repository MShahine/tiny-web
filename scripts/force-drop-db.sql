-- Force drop database script for MySQL
-- This bypasses foreign key constraints and drops everything

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS sharing_metrics;
DROP TABLE IF EXISTS feature_usage;
DROP TABLE IF EXISTS performance_metrics;
DROP TABLE IF EXISTS user_behavior;
DROP TABLE IF EXISTS popular_urls;
DROP TABLE IF EXISTS realtime_analytics;
DROP TABLE IF EXISTS daily_analytics;
DROP TABLE IF EXISTS serp_rankings;
DROP TABLE IF EXISTS analysis_results;
DROP TABLE IF EXISTS users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Show remaining tables (should be empty)
SHOW TABLES;