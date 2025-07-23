import { URL } from 'url';

/**
 * Security utilities for URL validation and SSRF prevention
 */

// Blocked IP ranges for SSRF prevention
const BLOCKED_IP_RANGES = [
  // Localhost
  /^127\./,
  /^::1$/,
  /^localhost$/i,
  
  // Private networks (RFC 1918)
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  
  // Link-local
  /^169\.254\./,
  /^fe80:/i,
  
  // Multicast
  /^224\./,
  /^ff00:/i,
  
  // Reserved ranges
  /^0\./,
  /^255\./,
];

// Allowed protocols
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

// Maximum URL length
const MAX_URL_LENGTH = 2048;

/**
 * Validates and sanitizes a URL for security
 */
export function validateUrl(urlString: string): { isValid: boolean; url?: URL; error?: string } {
  try {
    // Basic length check
    if (urlString.length > MAX_URL_LENGTH) {
      return { isValid: false, error: 'URL too long' };
    }

    // Parse URL
    const url = new URL(urlString.trim());

    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }

    // Check for suspicious patterns
    if (url.hostname.includes('..') || url.hostname.includes('%')) {
      return { isValid: false, error: 'Invalid hostname format' };
    }

    // Check for blocked IP ranges
    const hostname = url.hostname.toLowerCase();
    for (const blockedRange of BLOCKED_IP_RANGES) {
      if (blockedRange.test(hostname)) {
        return { isValid: false, error: 'Access to private/local networks is not allowed' };
      }
    }

    // Check for IP addresses (basic check)
    const ipv4Regex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
      // Additional IP validation could go here
      const parts = hostname.split('.').map(Number);
      if (parts.some(part => part > 255)) {
        return { isValid: false, error: 'Invalid IP address' };
      }
    }

    return { isValid: true, url };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Creates a hash of a URL for caching purposes
 */
export function createUrlHash(url: string): string {
  // Normalize URL for consistent hashing
  try {
    const parsedUrl = new URL(url);
    // Remove trailing slash and normalize
    let pathname = parsedUrl.pathname;
    if (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }
    const normalizedUrl = `${parsedUrl.protocol}//${parsedUrl.hostname.toLowerCase()}${pathname}${parsedUrl.search}`;
    
    console.log('Creating hash for normalized URL:', normalizedUrl);
    
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < normalizedUrl.length; i++) {
      const char = normalizedUrl.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const hashResult = Math.abs(hash).toString(36);
    console.log('Generated hash:', hashResult);
    return hashResult;
  } catch (error) {
    console.error('Error creating URL hash:', error);
    return '';
  }
}

/**
 * Rate limiting key generator
 */
export function getRateLimitKey(identifier: string, toolType: string): string {
  return `${identifier}:${toolType}`;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().slice(0, MAX_URL_LENGTH);
}