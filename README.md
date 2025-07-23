# 🚀 TinyWeb - Free Professional SEO Tools

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green)](https://orm.drizzle.team/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Professional-grade SEO analysis tools for free. Complete toolkit with 14+ tools for meta tags, OpenGraph, headers, sitemaps, SERP tracking, and more.**

## 🌟 Overview

TinyWeb is a comprehensive, free-to-use SEO toolkit designed to help developers, marketers, and website owners optimize their sites for better search engine performance. Built with modern web technologies, it provides instant analysis and actionable insights for technical SEO, content optimization, and performance improvements.

**🔗 Live Demo:** [https://tiny-web-nine.vercel.app/](https://tiny-web-nine.vercel.app/)

## ✨ Features

### 🔍 **SEO Analysis Tools (14 Tools)**

- **Meta Tags Analyzer** - Comprehensive meta tag analysis with SEO scoring
- **OpenGraph Checker** - Social media preview optimization
- **Schema Markup Validator** - Structured data validation for rich snippets
- **Image SEO Analyzer** - Alt text, compression, and format optimization
- **HTTP Headers Checker** - Security and performance header analysis
- **Keyword Density Checker** - Content optimization and keyword analysis

### 🛠️ **Technical SEO Tools**

- **Sitemap Finder** - XML sitemap discovery and analysis
- **Robots.txt Tester** - URL accessibility and crawl directive testing
- **Website Crawl Test** - Crawlability and indexability analysis
- **Website Technology Checker** - Tech stack detection and analysis

### 📊 **Performance & Monitoring**

- **Page Speed Insights** - Core Web Vitals and performance analysis
- **SERP Checker** - Search engine ranking position tracking
- **Link Extractor** - Internal and external link analysis
- **Social Media Preview** - Multi-platform sharing optimization

### 🎯 **Key Features**

- ⚡ **Instant Analysis** - Real-time SEO auditing
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🌙 **Dark/Light Mode** - Customizable user interface
- 📊 **Detailed Reports** - Comprehensive analysis with actionable insights
- 💾 **Export Functionality** - Download reports in multiple formats
- 🔄 **Rate Limiting** - Fair usage policies for optimal performance
- 📈 **Analytics Dashboard** - Usage tracking and insights

## 🏗️ Tech Stack

### **Frontend**

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful and accessible UI components
- **Lucide React** - Modern icon library

### **Backend**

- **Next.js API Routes** - Serverless API endpoints
- **Drizzle ORM** - Type-safe database operations
- **MySQL2** - Database connectivity
- **Rate Limiting** - Request throttling and protection

### **Analytics & Monitoring**

- **Vercel Analytics** - Real-time user analytics and insights
- **Vercel Speed Insights** - Core Web Vitals monitoring
- **Internal Analytics** - Custom tool usage tracking
- **Performance Monitoring** - Response time and error tracking

### **Development & Deployment**

- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **Bun** - Fast package manager and runtime

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- MySQL database
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/MShahine/tiny-web.git
   cd tiny-web
   ```

2. **Install dependencies**

   ```bash
   # Using bun (recommended)
   bun install

   # Or using npm
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables:

   ```env
   # Database
   DATABASE_URL="mysql://user:password@localhost:3306/tinyweb"

   # Site Configuration
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   NEXT_PUBLIC_SITE_NAME="TinyWeb - Free SEO Tools"

   # API Keys (optional)
   PAGESPEED_API_KEY="your-pagespeed-api-key"
   SERP_API_KEY="your-serp-api-key"

   # Analytics (automatically enabled in production)
   NEXT_PUBLIC_VERCEL_ANALYTICS="true"
   NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS="true"
   ```

4. **Database Setup**

   ```bash
   # Run database migrations
   bun run db:migrate

   # Or using npm
   npm run db:migrate
   ```

5. **Start Development Server**

   ```bash
   bun dev
   # Or: npm run dev
   ```

6. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   └── tools/         # SEO tool APIs
│   ├── tools/             # Tool pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── analytics/        # Analytics components
├── db/                   # Database schema and config
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
└── middleware/           # Next.js middleware
```

## 🛠️ Available Scripts

```bash
# Development
bun dev                   # Start development server
bun build                 # Build for production
bun start                 # Start production server

# Database
bun run db:migrate        # Run database migrations
bun run db:studio         # Open Drizzle Studio
bun run db:reset          # Reset database (development)

# Code Quality
bun run lint              # Run ESLint
bun run type-check        # TypeScript type checking
```

## 🔧 Configuration

### **Environment Variables**

| Variable               | Description              | Required |
| ---------------------- | ------------------------ | -------- |
| `DATABASE_URL`         | MySQL connection string  | ✅       |
| `NEXT_PUBLIC_SITE_URL` | Your site's URL          | ✅       |
| `PAGESPEED_API_KEY`    | Google PageSpeed API key | ❌       |
| `SERP_API_KEY`         | SERP tracking API key    | ❌       |

### **Rate Limiting**

Each tool has specific rate limits to ensure fair usage:

- Most tools: 20 requests/minute
- Heavy analysis tools: 10 requests/minute
- Quick tools: 30 requests/minute

## 📊 Analytics & Monitoring

TinyWeb includes built-in analytics to track:

- Tool usage statistics
- Performance metrics
- User engagement
- Error monitoring

Access the analytics dashboard at `/admin/analytics` (requires authentication).

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea? Please open an issue on GitHub with:

- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

## 📈 Roadmap

### **Completed Tools (14/14)**

- ✅ Meta Tags Analyzer
- ✅ OpenGraph Checker
- ✅ Schema Markup Validator
- ✅ Image SEO Analyzer
- ✅ HTTP Headers Checker
- ✅ Sitemap Finder
- ✅ Robots.txt Tester
- ✅ SERP Checker
- ✅ Page Speed Insights
- ✅ Website Crawl Test
- ✅ Website Technology Checker
- ✅ Link Extractor
- ✅ Social Media Preview
- ✅ Keyword Density Checker

### **Upcoming Features**

- 🔄 Internal Linking Analyzer
- 🔄 Domain Authority Checker
- 🔄 Local SEO Checker
- 🔄 Redirect Chain Checker
- 🔄 Log File Analyzer

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### **Special Thanks**

- **Rovo Dev (ATLASSIAN AI )** - AI assistant who provided invaluable help in developing this project, from architecture decisions to implementation details. This toolkit wouldn't be what it is today without the collaborative development process and technical expertise provided throughout the journey.

### **Technologies & Libraries**

- [Next.js](https://nextjs.org/) - The React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Lucide](https://lucide.dev/) - Beautiful icon library

### **Inspiration**

- SEO community feedback and feature requests
- Modern web development best practices
- Accessibility and performance standards

## 📞 Support

- **Documentation**: [https://tiny-web-nine.vercel.app//docs](https://tiny-web-nine.vercel.app/docs)
- **Email**: falconsoufiane@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/MShahine/tinyweb/issues)

---

<div align="center">

**Built with ❤️ for the SEO community**

[Website](https://tiny-web-nine.vercel.app/) • [Documentation](https://tiny-web-nine.vercel.app/docs) • [GitHub](https://github.com/MShahine/tiny-web)

</div>
