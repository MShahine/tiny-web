# Manual Database Reset Commands

If the automated script doesn't work, run these commands manually:

## 1. Drop Database (Force)
```bash
# Connect to your MySQL database and run:
SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS tinyweb_db;
CREATE DATABASE tinyweb_db;
SET FOREIGN_KEY_CHECKS = 1;
```

## 2. Or use Drizzle commands:
```bash
# Drop existing schema
npx drizzle-kit drop --config=drizzle.config.ts

# Generate new migrations
npx drizzle-kit generate --config=drizzle.config.ts

# Push to database
npx drizzle-kit push --config=drizzle.config.ts
```

## 3. Alternative approach:
```bash
# If you have issues, try these one by one:

# 1. Generate schema
npx drizzle-kit generate

# 2. Push schema
npx drizzle-kit push

# 3. Check studio
npx drizzle-kit studio
```

## 4. Verify tables created:
```sql
SHOW TABLES;

-- Should show:
-- analysis_results
-- daily_analytics
-- performance_metrics
-- popular_urls
-- realtime_analytics
-- serp_rankings
-- user_behavior
-- users
```

## 5. Test analytics system:
```bash
# Start dev server
npm run dev

# Visit analytics dashboard
http://localhost:3000/admin/analytics
```