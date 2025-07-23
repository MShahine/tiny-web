// Keyword Density Analyzer Library
// Analyzes keyword frequency, density, and provides SEO recommendations

interface KeywordData {
  keyword: string;
  frequency: number;
  density: number;
  tfIdfScore: number;
  keywordType: 'single' | 'phrase' | 'long_tail';
  positions: string[];
  isStopWord: boolean;
  stemmedForm: string;
}

interface KeywordSuggestion {
  originalKeyword: string;
  suggestedKeyword: string;
  suggestionType: 'related' | 'semantic' | 'long_tail' | 'lsi';
  relevanceScore: number;
  searchVolume?: number;
  competition?: 'low' | 'medium' | 'high';
}

interface KeywordAnalysisResult {
  url: string;
  totalWords: number;
  uniqueWords: number;
  readingTime: number;
  keywords: KeywordData[];
  suggestions: KeywordSuggestion[];
  seoAnalysis: {
    score: number;
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      issue: string;
      description: string;
      recommendation: string;
    }>;
    recommendations: string[];
  };
  contentStructure: {
    title?: string;
    metaDescription?: string;
    h1Tags: string[];
    h2Tags: string[];
    h3Tags: string[];
    paragraphs: number;
    images: number;
    links: number;
  };
}

// Common stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with',
  'the', 'this', 'but', 'they', 'have', 'had', 'what', 'said', 'each', 'which',
  'she', 'do', 'how', 'their', 'if', 'up', 'out', 'many', 'then', 'them', 'these',
  'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 'time', 'two',
  'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call',
  'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did', 'get', 'come',
  'made', 'may', 'part'
]);

// Simple stemmer for English words
function stemWord(word: string): string {
  word = word.toLowerCase();
  
  // Remove common suffixes
  const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 's', 'ies', 'ied', 'ying', 'tion', 'sion'];
  
  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      return word.slice(0, -suffix.length);
    }
  }
  
  return word;
}

// Extract text content from HTML
function extractTextContent(html: string): {
  title?: string;
  metaDescription?: string;
  h1Tags: string[];
  h2Tags: string[];
  h3Tags: string[];
  bodyText: string;
  paragraphs: number;
  images: number;
  links: number;
} {
  // Remove script and style tags
  const cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                       .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Extract title
  const titleMatch = cleanHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : undefined;

  // Extract meta description
  const metaMatch = cleanHtml.match(/<meta[^>]*name=['"]description['"][^>]*content=['"]([^'"]*)['"]/i);
  const metaDescription = metaMatch ? metaMatch[1].trim() : undefined;

  // Extract headings
  const h1Tags = Array.from(cleanHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi))
    .map(match => match[1].replace(/<[^>]*>/g, '').trim());
  
  const h2Tags = Array.from(cleanHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi))
    .map(match => match[1].replace(/<[^>]*>/g, '').trim());
  
  const h3Tags = Array.from(cleanHtml.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi))
    .map(match => match[1].replace(/<[^>]*>/g, '').trim());

  // Count elements
  const paragraphs = (cleanHtml.match(/<p[^>]*>/gi) || []).length;
  const images = (cleanHtml.match(/<img[^>]*>/gi) || []).length;
  const links = (cleanHtml.match(/<a[^>]*>/gi) || []).length;

  // Extract body text (remove all HTML tags)
  const bodyText = cleanHtml.replace(/<[^>]*>/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim();

  return {
    title,
    metaDescription,
    h1Tags,
    h2Tags,
    h3Tags,
    bodyText,
    paragraphs,
    images,
    links
  };
}

// Calculate TF-IDF score (simplified version)
function calculateTfIdf(frequency: number, totalWords: number, documentFreq: number, totalDocs: number = 1000): number {
  const tf = frequency / totalWords;
  const idf = Math.log(totalDocs / (1 + documentFreq));
  return tf * idf;
}

// Generate keyword suggestions based on content
function generateKeywordSuggestions(keywords: KeywordData[], content: string): KeywordSuggestion[] {
  const suggestions: KeywordSuggestion[] = [];
  
  // Get top keywords for suggestions
  const topKeywords = keywords
    .filter(k => !k.isStopWord && k.frequency > 1)
    .sort((a, b) => b.density - a.density)
    .slice(0, 10);

  topKeywords.forEach(keyword => {
    // Generate long-tail suggestions
    if (keyword.keywordType === 'single') {
      suggestions.push({
        originalKeyword: keyword.keyword,
        suggestedKeyword: `${keyword.keyword} guide`,
        suggestionType: 'long_tail',
        relevanceScore: 85
      });
      
      suggestions.push({
        originalKeyword: keyword.keyword,
        suggestedKeyword: `best ${keyword.keyword}`,
        suggestionType: 'long_tail',
        relevanceScore: 80
      });
    }

    // Generate related terms (simplified)
    const relatedTerms = generateRelatedTerms(keyword.keyword);
    relatedTerms.forEach(term => {
      suggestions.push({
        originalKeyword: keyword.keyword,
        suggestedKeyword: term,
        suggestionType: 'related',
        relevanceScore: 75
      });
    });
  });

  return suggestions.slice(0, 20); // Limit to top 20 suggestions
}

// Simple related terms generator
function generateRelatedTerms(keyword: string): string[] {
  const related: string[] = [];
  
  // Add common modifiers
  const modifiers = ['best', 'top', 'how to', 'guide', 'tips', 'review', 'comparison'];
  modifiers.forEach(modifier => {
    related.push(`${modifier} ${keyword}`);
  });

  // Add question formats
  related.push(`what is ${keyword}`);
  related.push(`how to use ${keyword}`);
  
  return related;
}

// Analyze keyword density and generate insights
export async function analyzeKeywordDensity(url: string, html: string): Promise<KeywordAnalysisResult> {
  const content = extractTextContent(html);
  const words = content.bodyText.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);

  const totalWords = words.length;
  const uniqueWords = new Set(words).size;
  const readingTime = Math.ceil(totalWords / 200); // Assuming 200 WPM

  // Count word frequencies
  const wordFreq = new Map<string, number>();
  const wordPositions = new Map<string, Set<string>>();

  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  // Analyze phrases (2-3 words)
  const phrases = new Map<string, number>();
  for (let i = 0; i < words.length - 1; i++) {
    const phrase2 = `${words[i]} ${words[i + 1]}`;
    phrases.set(phrase2, (phrases.get(phrase2) || 0) + 1);
    
    if (i < words.length - 2) {
      const phrase3 = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      phrases.set(phrase3, (phrases.get(phrase3) || 0) + 1);
    }
  }

  // Check keyword positions in different elements
  const checkPositions = (keyword: string): string[] => {
    const positions: string[] = [];
    
    if (content.title?.toLowerCase().includes(keyword)) positions.push('title');
    if (content.metaDescription?.toLowerCase().includes(keyword)) positions.push('meta');
    if (content.h1Tags.some(h1 => h1.toLowerCase().includes(keyword))) positions.push('h1');
    if (content.h2Tags.some(h2 => h2.toLowerCase().includes(keyword))) positions.push('h2');
    if (content.h3Tags.some(h3 => h3.toLowerCase().includes(keyword))) positions.push('h3');
    if (content.bodyText.toLowerCase().includes(keyword)) positions.push('body');
    
    return positions;
  };

  // Build keyword data
  const keywords: KeywordData[] = [];

  // Single words
  wordFreq.forEach((frequency, word) => {
    if (frequency > 1) { // Only include words that appear more than once
      const density = (frequency / totalWords) * 100;
      const tfIdfScore = calculateTfIdf(frequency, totalWords, 1);
      
      keywords.push({
        keyword: word,
        frequency,
        density: Math.round(density * 100) / 100,
        tfIdfScore: Math.round(tfIdfScore * 1000) / 1000,
        keywordType: 'single',
        positions: checkPositions(word),
        isStopWord: STOP_WORDS.has(word),
        stemmedForm: stemWord(word)
      });
    }
  });

  // Phrases
  phrases.forEach((frequency, phrase) => {
    if (frequency > 1 && phrase.split(' ').length <= 3) {
      const density = (frequency / totalWords) * 100;
      const tfIdfScore = calculateTfIdf(frequency, totalWords, 1);
      
      keywords.push({
        keyword: phrase,
        frequency,
        density: Math.round(density * 100) / 100,
        tfIdfScore: Math.round(tfIdfScore * 1000) / 1000,
        keywordType: phrase.split(' ').length > 2 ? 'long_tail' : 'phrase',
        positions: checkPositions(phrase),
        isStopWord: false,
        stemmedForm: phrase.split(' ').map(stemWord).join(' ')
      });
    }
  });

  // Sort keywords by density
  keywords.sort((a, b) => b.density - a.density);

  // Generate suggestions
  const suggestions = generateKeywordSuggestions(keywords, content.bodyText);

  // SEO Analysis
  const issues: Array<{
    type: 'error' | 'warning' | 'info';
    issue: string;
    description: string;
    recommendation: string;
  }> = [];

  const recommendations: string[] = [];

  // Check for keyword stuffing
  const highDensityKeywords = keywords.filter(k => !k.isStopWord && k.density > 3);
  if (highDensityKeywords.length > 0) {
    issues.push({
      type: 'warning',
      issue: 'Potential Keyword Stuffing',
      description: `${highDensityKeywords.length} keywords have density > 3%`,
      recommendation: 'Reduce keyword density to 1-3% for better SEO'
    });
  }

  // Check for missing focus keywords in important positions
  const topKeywords = keywords.filter(k => !k.isStopWord).slice(0, 5);
  topKeywords.forEach(keyword => {
    if (!keyword.positions.includes('title') && !keyword.positions.includes('h1')) {
      issues.push({
        type: 'info',
        issue: 'Keyword Not in Title/H1',
        description: `"${keyword.keyword}" appears ${keyword.frequency} times but not in title or H1`,
        recommendation: 'Consider adding important keywords to title and H1 tags'
      });
    }
  });

  // Check content length
  if (totalWords < 300) {
    issues.push({
      type: 'warning',
      issue: 'Content Too Short',
      description: `Content has only ${totalWords} words`,
      recommendation: 'Aim for at least 300 words for better SEO'
    });
  }

  // Generate recommendations
  if (keywords.filter(k => !k.isStopWord).length < 10) {
    recommendations.push('Consider expanding content with more relevant keywords');
  }
  
  recommendations.push('Focus on 1-3 primary keywords with 1-3% density');
  recommendations.push('Use long-tail keywords for better targeting');
  recommendations.push('Include keywords in title, headings, and naturally in content');

  // Calculate SEO score
  let score = 100;
  issues.forEach(issue => {
    if (issue.type === 'error') score -= 20;
    else if (issue.type === 'warning') score -= 10;
    else score -= 5;
  });
  score = Math.max(0, Math.min(100, score));

  return {
    url,
    totalWords,
    uniqueWords,
    readingTime,
    keywords: keywords.slice(0, 50), // Limit to top 50 keywords
    suggestions,
    seoAnalysis: {
      score,
      issues,
      recommendations
    },
    contentStructure: {
      title: content.title,
      metaDescription: content.metaDescription,
      h1Tags: content.h1Tags,
      h2Tags: content.h2Tags,
      h3Tags: content.h3Tags,
      paragraphs: content.paragraphs,
      images: content.images,
      links: content.links
    }
  };
}