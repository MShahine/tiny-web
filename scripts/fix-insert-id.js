#!/usr/bin/env node

/**
 * Fix insertId issues across all API routes
 * 
 * This script fixes the common MySQL insertId issue in Drizzle ORM
 */

const fs = require('fs')
const path = require('path')

const toolsDir = 'src/app/api/tools'
const tools = [
  'meta-tags',
  'opengraph', 
  'http-headers',
  'serp-checker',
  'sitemap-finder',
  'robots-txt-tester',
  'link-extractor',
  'page-speed-insights',
  'website-technology-checker',
  'social-media-preview',
  'website-crawl-test'
]

console.log('🔧 Fixing insertId issues in API routes...')

const fixPattern = `      // @ts-ignore - Drizzle MySQL insertId access
      if (analysisRecord.insertId) {
        // @ts-ignore
        analysisId = Number(analysisRecord.insertId);
      } else {
        throw new Error('Failed to get insert ID from database');
      }`

const fixReplacement = `      // @ts-ignore - Drizzle MySQL insertId access
      if (analysisRecord.insertId) {
        // @ts-ignore
        analysisId = Number(analysisRecord.insertId);
      } else {
        // Fallback: Query the database to get the ID of the record we just inserted
        const insertedRecord = await db
          .select()
          .from(analysisResultsTable)
          .where(eq(analysisResultsTable.urlHash, hash))
          .orderBy(desc(analysisResultsTable.createdAt))
          .limit(1);
        
        if (insertedRecord.length > 0) {
          analysisId = insertedRecord[0].id;
          console.log('Retrieved analysis ID via fallback query:', analysisId);
        } else {
          throw new Error('Failed to get insert ID from database');
        }
      }`

let fixedCount = 0

tools.forEach(tool => {
  const filePath = path.join(toolsDir, tool, 'route.ts')
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8')
    
    if (content.includes('Failed to get insert ID from database')) {
      content = content.replace(fixPattern, fixReplacement)
      fs.writeFileSync(filePath, content)
      console.log(`✅ Fixed ${tool}/route.ts`)
      fixedCount++
    } else {
      console.log(`⏭️  ${tool}/route.ts - no fix needed`)
    }
  } else {
    console.log(`⚠️  ${tool}/route.ts - file not found`)
  }
})

console.log(`\n🎉 Fixed ${fixedCount} API routes!`)
console.log('\n📝 The fix adds a fallback query to get the insert ID when Drizzle fails to return it.')
console.log('This is a common issue with MySQL and Drizzle ORM.')