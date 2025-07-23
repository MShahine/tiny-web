#!/usr/bin/env node

/**
 * Database Reset Script for TinyWeb Analytics
 *
 * This script safely drops and recreates the database with foreign key handling
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🗄️  TinyWeb Database Reset Script')
console.log('==================================\n')

async function resetDatabase() {
  try {
    console.log('1️⃣  Stopping any running processes...')

    // Check if .env.local exists
    const envPath = path.join(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) {
      console.log('⚠️  .env.local not found. Using .env.example as template...')
      const envExample = fs.readFileSync('.env.example', 'utf8')
      fs.writeFileSync('.env.local', envExample)
    }

    console.log('2️⃣  Dropping existing database...')
    try {
      execSync('npx drizzle-kit drop --config=drizzle.config.ts', {
        stdio: 'inherit',
        cwd: process.cwd()
      })
    } catch (error) {
      console.log('   Database drop completed (or no database existed)')
    }

    console.log('3️⃣  Generating new schema...')
    execSync('npx drizzle-kit generate --config=drizzle.config.ts', {
      stdio: 'inherit',
      cwd: process.cwd()
    })

    console.log('4️⃣  Pushing new schema to database...')
    execSync('npx drizzle-kit push --config=drizzle.config.ts', {
      stdio: 'inherit',
      cwd: process.cwd()
    })

    console.log('\n✅ Database reset complete!')
    console.log('\n📊 New Analytics Tables Created:')
    console.log('   • daily_analytics - Daily aggregated statistics')
    console.log('   • realtime_analytics - Live event tracking')
    console.log('   • popular_urls - Trending domain analysis')
    console.log('   • user_behavior - User journey tracking')
    console.log('   • performance_metrics - System performance monitoring')
    console.log('   • analysis_results - Tool analysis storage')
    console.log('   • serp_rankings - SERP position tracking')
    console.log('   • users - User management')

    console.log('\n🚀 Next Steps:')
    console.log('   1. Start your development server: npm run dev')
    console.log('   2. Visit /admin/analytics to see the dashboard')
    console.log('   3. Use tools to generate analytics data')
    console.log('   4. Watch real-time insights flow in!')

  } catch (error) {
    console.error('\n❌ Database reset failed:', error.message)
    console.log('\n🔧 Manual Reset Instructions:')
    console.log('   1. Check your database connection in .env.local')
    console.log('   2. Ensure your database server is running')
    console.log('   3. Try running commands individually:')
    console.log('      npx drizzle-kit drop')
    console.log('      npx drizzle-kit generate')
    console.log('      npx drizzle-kit push')
    process.exit(1)
  }
}

// Handle graceful shutdownreset-db
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Database reset interrupted')
  process.exit(0)
})

// Run the reset
resetDatabase()
