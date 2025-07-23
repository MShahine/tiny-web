import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { WebsiteSchema, SoftwareApplicationSchema } from "@/components/StructuredData";
import { envConfig } from "@/lib/env-config";

export const metadata: Metadata = {
  metadataBase: new URL(envConfig.site.url),
  title: {
    default: envConfig.site.name + " | Professional SEO Toolkit",
    template: "%s | " + envConfig.site.name
  },
  description: envConfig.site.description,
  keywords: [
    "SEO tools",
    "meta tags checker",
    "OpenGraph checker",
    "HTTP headers analyzer",
    "sitemap checker",
    "robots.txt tester",
    "SERP checker",
    "page speed test",
    "link analyzer",
    "website crawler",
    "free SEO tools",
    "SEO analysis",
    "website optimization",
    "search engine optimization",
    "technical SEO",
    "on-page SEO",
    "SEO audit",
    "website performance",
    "social media preview",
    "schema markup"
  ],
  authors: [{ name: "TinyWeb Team" }],
  creator: "TinyWeb",
  publisher: "TinyWeb",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: envConfig.site.url,
    siteName: envConfig.site.name,
    title: envConfig.site.name + ' - Professional SEO Analysis Tools for Free',
    description: envConfig.site.description,
    images: [
      {
        url: envConfig.assets.ogImage,
        width: 1200,
        height: 630,
        alt: envConfig.site.name + ' Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: envConfig.social.twitter,
    creator: envConfig.social.twitter,
    title: envConfig.site.name + ' - Professional SEO Tools for Free',
    description: envConfig.site.description,
    images: [envConfig.assets.twitterImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: envConfig.seo.googleVerification,
    yandex: envConfig.seo.yandexVerification,
    yahoo: envConfig.seo.yahooVerification,
    other: {
      bing: envConfig.seo.bingVerification,
    },
  },
  category: 'technology',
  classification: 'SEO Tools',
  referrer: 'origin-when-cross-origin',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <WebsiteSchema />
        <SoftwareApplicationSchema />
        <link rel="canonical" href={envConfig.site.url} />
        <meta name="google-site-verification" content={envConfig.seo.googleVerification} />
        <meta name="msvalidate.01" content={envConfig.seo.bingVerification} />
        <meta name="yandex-verification" content={envConfig.seo.yandexVerification} />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
