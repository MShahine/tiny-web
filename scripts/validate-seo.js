#!/usr/bin/env node

/**
 * TinyWeb SEO Validation Script
 * 
 * This script validates your SEO configuration and provides recommendations.
 * Run with: node scripts/validate-seo.js
 */

const fs = require('fs')
const https = require('https')
const { URL } = require('url')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  googleAnalytics: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  bingVerification: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
}

function validateUrl(url) {
  try {
    new URL(url)
    return url.startsWith('https://')
  } catch {
    return false
  }
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

async function checkSiteAccessibility(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      resolve({
        accessible: response.statusCode === 200,
        statusCode: response.statusCode,
        headers: response.headers
      })
    })
    
    request.on('error', () => {
      resolve({ accessible: false, error: 'Connection failed' })
    })
    
    request.setTimeout(5000, () => {
      request.destroy()
      resolve({ accessible: false, error: 'Timeout' })
    })
  })
}

async function validateSEO() {
  console.log('🔍 TinyWeb SEO Validation')
  console.log('=========================\n')
  
  const issues = []
  const warnings = []
  const successes = []
  
  // Validate site URL
  if (!config.siteUrl) {
    issues.push('❌ NEXT_PUBLIC_SITE_URL is not set')
  } else if (!validateUrl(config.siteUrl)) {
    issues.push('❌ NEXT_PUBLIC_SITE_URL must be a valid HTTPS URL')
  } else {
    successes.push('✅ Site URL is valid')
    
    // Check site accessibility
    console.log('🌐 Checking site accessibility...')
    const siteCheck = await checkSiteAccessibility(config.siteUrl)
    if (siteCheck.accessible) {
      successes.push('✅ Site is accessible')
    } else {
      warnings.push(`⚠️  Site accessibility issue: ${siteCheck.error || 'HTTP ' + siteCheck.statusCode}`)
    }
  }
  
  // Validate Google Analytics
  if (!config.googleAnalytics) {
    warnings.push('⚠️  Google Analytics ID not set (recommended for tracking)')
  } else if (!config.googleAnalytics.startsWith('G-')) {
    issues.push('❌ Google Analytics ID should start with "G-"')
  } else {
    successes.push('✅ Google Analytics ID is valid')
  }
  
  // Validate verification codes
  if (!config.googleVerification || config.googleVerification === 'your-google-verification-code') {
    warnings.push('⚠️  Google Search Console verification not set')
  } else {
    successes.push('✅ Google verification code set')
  }
  
  if (!config.bingVerification || config.bingVerification === 'your-bing-verification-code') {
    warnings.push('⚠️  Bing Webmaster verification not set')
  } else {
    successes.push('✅ Bing verification code set')
  }
  
  // Validate social media
  if (!config.twitterHandle || !config.twitterHandle.startsWith('@')) {
    warnings.push('⚠️  Twitter handle not set or invalid format')
  } else {
    successes.push('✅ Twitter handle is valid')
  }
  
  // Validate contact email
  if (!config.contactEmail) {
    warnings.push('⚠️  Contact email not set')
  } else if (!validateEmail(config.contactEmail)) {
    issues.push('❌ Contact email format is invalid')
  } else {
    successes.push('✅ Contact email is valid')
  }
  
  // Check required files
  const requiredFiles = [
    'public/favicon.ico',
    'public/robots.txt',
    'src/app/sitemap.ts'
  ]
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      successes.push(`✅ ${file} exists`)
    } else {
      issues.push(`❌ Missing required file: ${file}`)
    }
  })
  
  // Display results
  console.log('\n📊 Validation Results:')
  console.log('======================\n')
  
  if (successes.length > 0) {
    console.log('✅ Successes:')
    successes.forEach(success => console.log(`   ${success}`))
    console.log('')
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:')
    warnings.forEach(warning => console.log(`   ${warning}`))
    console.log('')
  }
  
  if (issues.length > 0) {
    console.log('❌ Issues to Fix:')
    issues.forEach(issue => console.log(`   ${issue}`))
    console.log('')
  }
  
  // SEO Score
  const totalChecks = successes.length + warnings.length + issues.length
  const score = Math.round((successes.length / totalChecks) * 100)
  
  console.log(`🎯 SEO Configuration Score: ${score}%`)
  
  if (score >= 90) {
    console.log('🚀 Excellent! Your SEO configuration is ready for production.')
  } else if (score >= 70) {
    console.log('👍 Good configuration. Address warnings for optimal SEO.')
  } else {
    console.log('⚠️  Configuration needs improvement. Fix issues before deployment.')
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:')
  console.log('===================')
  console.log('1. Set up Google Search Console and submit your sitemap')
  console.log('2. Configure Google Analytics 4 for traffic tracking')
  console.log('3. Create social media accounts for your brand')
  console.log('4. Generate high-quality favicon and OG images')
  console.log('5. Set up monitoring for uptime and performance')
  console.log('6. Plan content marketing strategy for SEO authority')
  
  return { score, issues: issues.length, warnings: warnings.length }
}

// Run validation
validateSEO()
  .then(result => {
    process.exit(result.issues > 0 ? 1 : 0)
  })
  .catch(error => {
    console.error('❌ Validation failed:', error.message)
    process.exit(1)
  })