#!/usr/bin/env node

/**
 * TinyWeb Environment Setup Script
 * 
 * This script helps you configure your environment variables for deployment.
 * Run with: node scripts/setup-env.js
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function setupEnvironment() {
  console.log('🚀 TinyWeb Environment Setup')
  console.log('============================\n')
  
  console.log('This script will help you configure your environment variables for deployment.\n')
  
  // Site Configuration
  console.log('📝 Site Configuration:')
  const siteUrl = await question('Enter your site URL (e.g., https://tinyweb.tools): ')
  const siteName = await question('Enter your site name (default: TinyWeb - Free SEO Tools): ') || 'TinyWeb - Free SEO Tools'
  
  // SEO Configuration
  console.log('\n🔍 SEO Configuration:')
  const googleAnalytics = await question('Google Analytics 4 Measurement ID (G-XXXXXXXXXX): ')
  const googleVerification = await question('Google Search Console verification code: ')
  const bingVerification = await question('Bing Webmaster verification code: ')
  
  // Social Media
  console.log('\n📱 Social Media:')
  const twitterHandle = await question('Twitter handle (e.g., @tinyweb_tools): ')
  const githubUrl = await question('GitHub URL (e.g., https://github.com/tinyweb-tools): ')
  
  // Contact Information
  console.log('\n📧 Contact Information:')
  const contactEmail = await question('Support email (e.g., support@tinyweb.tools): ')
  const businessEmail = await question('Business email (e.g., hello@tinyweb.tools): ')
  
  // Generate .env.local file
  const envContent = `# TinyWeb Environment Configuration
# Generated on ${new Date().toISOString()}

# Site Configuration
NEXT_PUBLIC_SITE_URL=${siteUrl}
NEXT_PUBLIC_SITE_NAME="${siteName}"
NEXT_PUBLIC_SITE_DESCRIPTION="Professional-grade SEO analysis tools for free. Complete toolkit with 11+ tools for meta tags, OpenGraph, headers, sitemaps, SERP tracking, and more. Trusted by 10,000+ SEO professionals worldwide."

# SEO & Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=${googleAnalytics}
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=${googleVerification}
NEXT_PUBLIC_BING_SITE_VERIFICATION=${bingVerification}
NEXT_PUBLIC_YANDEX_VERIFICATION=your-yandex-verification-code
NEXT_PUBLIC_YAHOO_VERIFICATION=your-yahoo-verification-code

# Social Media
NEXT_PUBLIC_TWITTER_HANDLE=${twitterHandle}
NEXT_PUBLIC_GITHUB_URL=${githubUrl}
NEXT_PUBLIC_FACEBOOK_PAGE=https://facebook.com/tinyweb.tools
NEXT_PUBLIC_LINKEDIN_PAGE=https://linkedin.com/company/tinyweb-tools
NEXT_PUBLIC_YOUTUBE_CHANNEL=https://youtube.com/@tinyweb-tools

# Contact Information
NEXT_PUBLIC_CONTACT_EMAIL=${contactEmail}
NEXT_PUBLIC_BUSINESS_EMAIL=${businessEmail}
NEXT_PUBLIC_SUPPORT_EMAIL=${contactEmail}

# Business Information
NEXT_PUBLIC_BUSINESS_NAME="TinyWeb SEO Tools"
NEXT_PUBLIC_BUSINESS_ADDRESS="123 SEO Street"
NEXT_PUBLIC_BUSINESS_CITY="Digital City"
NEXT_PUBLIC_BUSINESS_STATE="Tech State"
NEXT_PUBLIC_BUSINESS_ZIP="12345"
NEXT_PUBLIC_BUSINESS_COUNTRY="US"
NEXT_PUBLIC_BUSINESS_PHONE="+1-555-SEO-TOOL"
NEXT_PUBLIC_BUSINESS_LATITUDE=40.7128
NEXT_PUBLIC_BUSINESS_LONGITUDE=-74.0060

# Assets
NEXT_PUBLIC_LOGO_URL=/logo.png
NEXT_PUBLIC_FAVICON_URL=/favicon.ico
NEXT_PUBLIC_OG_IMAGE=/og-image.png
NEXT_PUBLIC_TWITTER_IMAGE=/twitter-image.png

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=true
NEXT_PUBLIC_ENABLE_LIVE_CHAT=false
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_API_DOCS=true

# API Configuration
NEXT_PUBLIC_RATE_LIMIT_REQUESTS=100
NEXT_PUBLIC_RATE_LIMIT_WINDOW=3600

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_VERSION=2.0.0
`

  // Write to .env.local
  fs.writeFileSync('.env.local', envContent)
  
  console.log('\n✅ Environment configuration complete!')
  console.log('📁 Created .env.local file with your settings')
  console.log('\n🚀 Next steps:')
  console.log('1. Review and update .env.local as needed')
  console.log('2. Add your domain verification codes to Google Search Console, Bing, etc.')
  console.log('3. Set up Google Analytics 4 if you haven\'t already')
  console.log('4. Deploy your site and update the NEXT_PUBLIC_SITE_URL if needed')
  console.log('5. Submit your sitemap to search engines')
  
  console.log('\n📊 SEO Checklist:')
  console.log('□ Verify domain ownership in Google Search Console')
  console.log('□ Submit sitemap.xml to Google Search Console')
  console.log('□ Verify domain in Bing Webmaster Tools')
  console.log('□ Set up Google Analytics 4 tracking')
  console.log('□ Create social media accounts')
  console.log('□ Generate and upload favicon and OG images')
  
  rl.close()
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Setup failed:', error.message)
  process.exit(1)
})

// Run setup
setupEnvironment().catch(console.error)