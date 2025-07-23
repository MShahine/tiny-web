'use client';

import { useState } from 'react';

interface ExportButtonProps {
  data: any;
  filename: string;
  toolName: string;
}

export default function ExportButton({ data, filename, toolName }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const exportAsJSON = () => {
    setIsExporting(true);
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };

  const exportAsCSV = () => {
    setIsExporting(true);
    try {
      let csvContent = '';
      
      if (toolName === 'Meta Tags Checker' && data.metaTags?.allTags) {
        csvContent = 'Type,Attribute,Content\n';
        data.metaTags.allTags.forEach((tag: any) => {
          const type = tag.name ? 'name' : tag.property ? 'property' : tag.httpEquiv ? 'http-equiv' : 'other';
          const attribute = tag.name || tag.property || tag.httpEquiv || tag.charset || 'N/A';
          const content = (tag.content || tag.charset || 'N/A').replace(/"/g, '""');
          csvContent += `"${type}","${attribute}","${content}"\n`;
        });
      } else if (toolName === 'OpenGraph Preview' && data.openGraph) {
        csvContent = 'Property,Content\n';
        Object.entries(data.openGraph).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            csvContent += `"${key}","${value.replace(/"/g, '""')}"\n`;
          }
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };

  const generateReport = () => {
    setIsExporting(true);
    try {
      let reportContent = `# ${toolName} Report\n\n`;
      reportContent += `**URL:** ${data.url}\n`;
      reportContent += `**Analyzed:** ${new Date().toLocaleString()}\n`;
      reportContent += `**Response Time:** ${data.responseTime}ms\n\n`;

      if (toolName === 'Meta Tags Checker') {
        reportContent += `## SEO Score: ${data.seoScore}/100\n\n`;
        reportContent += `### Issues Found (${data.metaTags.seoAnalysis.issues.length})\n`;
        data.metaTags.seoAnalysis.issues.forEach((issue: string, index: number) => {
          reportContent += `${index + 1}. ${issue}\n`;
        });
        reportContent += `\n### Recommendations (${data.metaTags.seoAnalysis.recommendations.length})\n`;
        data.metaTags.seoAnalysis.recommendations.forEach((rec: string, index: number) => {
          reportContent += `${index + 1}. ${rec}\n`;
        });
        reportContent += `\n### Key Meta Tags\n`;
        reportContent += `- **Title:** ${data.metaTags.title || 'Not found'}\n`;
        reportContent += `- **Description:** ${data.metaTags.description || 'Not found'}\n`;
        reportContent += `- **Viewport:** ${data.metaTags.viewport || 'Not found'}\n`;
        reportContent += `- **Canonical:** ${data.metaTags.canonical || 'Not found'}\n`;
      } else if (toolName === 'OpenGraph Preview') {
        reportContent += `### OpenGraph Data\n`;
        reportContent += `- **Title:** ${data.openGraph.title || 'Not found'}\n`;
        reportContent += `- **Description:** ${data.openGraph.description || 'Not found'}\n`;
        reportContent += `- **Image:** ${data.openGraph.image || 'Not found'}\n`;
        reportContent += `- **Site Name:** ${data.openGraph.siteName || 'Not found'}\n`;
      }

      const blob = new Blob([reportContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-report-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Results
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={exportAsJSON}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <span className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3 text-xs font-bold text-blue-600">
                JSON
              </span>
              Export as JSON
            </button>
            <button
              onClick={exportAsCSV}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <span className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3 text-xs font-bold text-green-600">
                CSV
              </span>
              Export as CSV
            </button>
            <button
              onClick={generateReport}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <span className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-3 text-xs font-bold text-purple-600">
                MD
              </span>
              Generate Report
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
}