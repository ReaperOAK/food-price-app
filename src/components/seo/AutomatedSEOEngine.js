/**
 * Automated SEO Engine
 * Reads from CSV files in /reports directory and automatically applies SEO optimizations
 * This system processes Google Search Console data and dynamically optimizes content
 */

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

class AutomatedSEOEngine {
  constructor() {
    this.reports = {};
    this.optimizations = {};
    this.isInitialized = false;
  }

  /**
   * Initialize the SEO engine by loading all CSV reports
   */
  async initialize() {
    try {
      const reportFiles = [
        'Queries.csv',
        'Pages.csv',
        'Countries.csv',
        'Devices.csv',
        'Dates.csv',
        'Search appearance.csv',
        'Filters.csv'
      ];

      // Load all CSV reports
      for (const file of reportFiles) {
        await this.loadReport(file);
      }

      // Process reports and generate optimizations
      this.processReports();
      this.isInitialized = true;

      console.log('SEO Engine initialized with', Object.keys(this.reports).length, 'reports');
    } catch (error) {
      console.error('Failed to initialize SEO Engine:', error);
    }
  }

  /**
   * Load a specific CSV report
   */
  async loadReport(filename) {
    try {
      const response = await fetch(`/reports/${filename}`);
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const reportName = filename.replace('.csv', '').toLowerCase();
            this.reports[reportName] = results.data;
            resolve(results.data);
          },
          error: (error) => {
            console.error(`Error parsing ${filename}:`, error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error(`Failed to load ${filename}:`, error);
    }
  }

  /**
   * Process all reports and generate optimization strategies
   */
  processReports() {
    this.optimizations = {
      topKeywords: this.extractTopKeywords(),
      lowCTRPages: this.identifyLowCTRPages(),
      deviceOptimizations: this.analyzeDevicePerformance(),
      internationalOpportunities: this.findInternationalOpportunities(),
      emergingKeywords: this.findEmergingKeywords(),
      contentGaps: this.identifyContentGaps(),
      seasonalTrends: this.analyzeSeasonalTrends()
    };
  }

  /**
   * Extract top-performing keywords for optimization
   */
  extractTopKeywords() {
    if (!this.reports.queries) return [];

    return this.reports.queries
      .filter(row => parseFloat(row.Clicks) > 0)
      .sort((a, b) => parseFloat(b.Clicks) - parseFloat(a.Clicks))
      .slice(0, 50)
      .map(row => ({
        keyword: row.Top_queries,
        clicks: parseFloat(row.Clicks),
        impressions: parseFloat(row.Impressions),
        ctr: parseFloat(row.CTR),
        position: parseFloat(row.Position),
        priority: this.calculateKeywordPriority(row)
      }));
  }

  /**
   * Identify pages with low CTR but high impressions
   */
  identifyLowCTRPages() {
    if (!this.reports.pages) return [];

    return this.reports.pages
      .filter(row => parseFloat(row.Impressions) > 100 && parseFloat(row.CTR) < 1.0)
      .sort((a, b) => parseFloat(b.Impressions) - parseFloat(a.Impressions))
      .slice(0, 20)
      .map(row => ({
        page: row.Top_pages,
        impressions: parseFloat(row.Impressions),
        clicks: parseFloat(row.Clicks),
        ctr: parseFloat(row.CTR),
        position: parseFloat(row.Position),
        optimizationPotential: this.calculateOptimizationPotential(row)
      }));
  }

  /**
   * Analyze device performance for targeted optimizations
   */
  analyzeDevicePerformance() {
    if (!this.reports.devices) return {};

    const devices = {};
    this.reports.devices.forEach(row => {
      devices[row.Device] = {
        clicks: parseFloat(row.Clicks),
        impressions: parseFloat(row.Impressions),
        ctr: parseFloat(row.CTR),
        position: parseFloat(row.Position)
      };
    });

    return {
      devices,
      recommendations: this.generateDeviceRecommendations(devices)
    };
  }

  /**
   * Find international SEO opportunities
   */
  findInternationalOpportunities() {
    if (!this.reports.countries) return [];

    return this.reports.countries
      .filter(row => row.Country !== 'ind' && parseFloat(row.Impressions) > 10)
      .sort((a, b) => parseFloat(b.Clicks) - parseFloat(a.Clicks))
      .slice(0, 10)
      .map(row => ({
        country: row.Country,
        clicks: parseFloat(row.Clicks),
        impressions: parseFloat(row.Impressions),
        ctr: parseFloat(row.CTR),
        position: parseFloat(row.Position),
        marketPotential: this.calculateMarketPotential(row)
      }));
  }

  /**
   * Find emerging keywords (good impressions, improving position)
   */
  findEmergingKeywords() {
    if (!this.reports.queries) return [];

    return this.reports.queries
      .filter(row => 
        parseFloat(row.Impressions) > 50 && 
        parseFloat(row.Position) < 20 && 
        parseFloat(row.Position) > 5 &&
        parseFloat(row.CTR) > 0.5
      )
      .sort((a, b) => parseFloat(a.Position) - parseFloat(b.Position))
      .slice(0, 20)
      .map(row => ({
        keyword: row.Top_queries,
        impressions: parseFloat(row.Impressions),
        position: parseFloat(row.Position),
        ctr: parseFloat(row.CTR),
        growthPotential: this.calculateGrowthPotential(row)
      }));
  }

  /**
   * Identify content gaps based on search data
   */
  identifyContentGaps() {
    const queries = this.reports.queries || [];
    const pages = this.reports.pages || [];

    // Find high-impression keywords without dedicated pages
    const contentGaps = [];
    
    queries.forEach(query => {
      if (parseFloat(query.Impressions) > 100 && parseFloat(query.Position) > 10) {
        const keyword = query.Top_queries.toLowerCase();
        const hasMatchingPage = pages.some(page => 
          page.Top_pages.toLowerCase().includes(keyword.split(' ')[0])
        );

        if (!hasMatchingPage) {
          contentGaps.push({
            keyword: query.Top_queries,
            impressions: parseFloat(query.Impressions),
            position: parseFloat(query.Position),
            suggestedPage: this.suggestPageURL(keyword)
          });
        }
      }
    });

    return contentGaps.slice(0, 15);
  }

  /**
   * Analyze seasonal trends in search data
   */
  analyzeSeasonalTrends() {
    if (!this.reports.dates) return {};

    const trends = {};
    this.reports.dates.forEach(row => {
      const date = new Date(row.Date);
      const month = date.getMonth();
      const week = this.getWeekOfYear(date);

      if (!trends[month]) trends[month] = [];
      trends[month].push({
        week,
        clicks: parseFloat(row.Clicks),
        impressions: parseFloat(row.Impressions),
        ctr: parseFloat(row.CTR)
      });
    });

    return this.identifySeasonalPatterns(trends);
  }

  /**
   * Calculate keyword priority score
   */
  calculateKeywordPriority(row) {
    const clicks = parseFloat(row.Clicks);
    const impressions = parseFloat(row.Impressions);
    const position = parseFloat(row.Position);
    const ctr = parseFloat(row.CTR);

    // Higher score = higher priority
    return (clicks * 2 + impressions * 0.1 + (21 - position) * 0.5 + ctr * 10);
  }

  /**
   * Calculate optimization potential for pages
   */
  calculateOptimizationPotential(row) {
    const impressions = parseFloat(row.Impressions);
    const ctr = parseFloat(row.CTR);
    const position = parseFloat(row.Position);

    // High impressions + low CTR + decent position = high potential
    return impressions * (2 - ctr) * (21 - position);
  }

  /**
   * Generate device-specific recommendations
   */
  generateDeviceRecommendations(devices) {
    const recommendations = [];

    if (devices.DESKTOP && devices.MOBILE) {
      const desktopPos = devices.DESKTOP.position;
      const mobilePos = devices.MOBILE.position;

      if (desktopPos > mobilePos + 2) {
        recommendations.push({
          type: 'desktop_optimization',
          priority: 'high',
          message: 'Desktop rankings significantly lower than mobile',
          action: 'Implement desktop-specific optimizations'
        });
      }

      if (devices.DESKTOP.ctr < devices.MOBILE.ctr * 0.5) {
        recommendations.push({
          type: 'desktop_ctr',
          priority: 'medium',
          message: 'Desktop CTR much lower than mobile',
          action: 'Optimize desktop meta descriptions and titles'
        });
      }
    }

    return recommendations;
  }

  /**
   * Calculate market potential for international markets
   */
  calculateMarketPotential(row) {
    const clicks = parseFloat(row.Clicks);
    const impressions = parseFloat(row.Impressions);
    const ctr = parseFloat(row.CTR);

    return clicks + (impressions * ctr * 0.1);
  }

  /**
   * Calculate growth potential for emerging keywords
   */
  calculateGrowthPotential(row) {
    const impressions = parseFloat(row.Impressions);
    const position = parseFloat(row.Position);
    const ctr = parseFloat(row.CTR);

    // Better position potential = higher growth potential
    return impressions * (21 - position) * ctr;
  }

  /**
   * Suggest URL for content gap
   */
  suggestPageURL(keyword) {
    const cleanKeyword = keyword.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    if (keyword.includes('rate') || keyword.includes('price')) {
      return `/rates/${cleanKeyword}`;
    } else if (keyword.includes('today') || keyword.includes('latest')) {
      return `/latest/${cleanKeyword}`;
    }
    
    return `/${cleanKeyword}`;
  }

  /**
   * Get week number of year
   */
  getWeekOfYear(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Identify seasonal patterns in trends data
   */
  identifySeasonalPatterns(trends) {
    const patterns = {};

    Object.keys(trends).forEach(month => {
      const monthData = trends[month];
      const avgClicks = monthData.reduce((sum, week) => sum + week.clicks, 0) / monthData.length;
      const avgCTR = monthData.reduce((sum, week) => sum + week.ctr, 0) / monthData.length;

      patterns[month] = {
        avgClicks,
        avgCTR,
        pattern: avgClicks > 50 ? 'high' : avgClicks > 20 ? 'medium' : 'low'
      };
    });

    return patterns;
  }

  /**
   * Get current optimization recommendations
   */
  getOptimizations() {
    return this.optimizations;
  }

  /**
   * Get real-time SEO metrics
   */
  getMetrics() {
    if (!this.isInitialized) return null;

    const queries = this.reports.queries || [];
    const pages = this.reports.pages || [];

    return {
      totalKeywords: queries.length,
      totalPages: pages.length,
      topKeywordClicks: queries.reduce((sum, row) => sum + parseFloat(row.Clicks || 0), 0),
      averagePosition: queries.reduce((sum, row) => sum + parseFloat(row.Position || 0), 0) / queries.length,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate automated meta tags based on current data
   */
  generateMetaTags(pageType, location = null) {
    const topKeywords = this.optimizations.topKeywords || [];
    const primaryKeywords = topKeywords.slice(0, 3).map(k => k.keyword);

    let title, description;

    switch (pageType) {
      case 'home':
        title = `${primaryKeywords[0]} | Live Egg Prices Today in India`;
        description = `Get latest ${primaryKeywords[0]} and ${primaryKeywords[1]} across India. Real-time egg price updates for ${primaryKeywords[2]}.`;
        break;

      case 'city':
        title = `${location} Egg Rate Today | ${primaryKeywords[0]} - Live Updates`;
        description = `Current ${primaryKeywords[0]} in ${location}. Get today's egg rates, price trends, and ${primaryKeywords[1]} for ${location}.`;
        break;

      case 'rates':
        title = `Egg Rates Today | ${primaryKeywords[0]} Live Updates`;
        description = `Latest ${primaryKeywords[0]} across all cities. Compare ${primaryKeywords[1]} and track daily egg price movements.`;
        break;

      default:
        title = `Egg Prices India | ${primaryKeywords[0]}`;
        description = `Get latest egg prices and rates across India. ${primaryKeywords.join(', ')}.`;
    }

    return {
      title,
      description,
      keywords: primaryKeywords.join(', ')
    };
  }
}

// React Component for SEO Dashboard
const SEODashboard = () => {
  const [seoEngine] = useState(() => new AutomatedSEOEngine());
  const [isLoading, setIsLoading] = useState(true);
  const [optimizations, setOptimizations] = useState({});
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const initializeEngine = async () => {
      setIsLoading(true);
      await seoEngine.initialize();
      setOptimizations(seoEngine.getOptimizations());
      setMetrics(seoEngine.getMetrics());
      setIsLoading(false);
    };

    initializeEngine();
  }, [seoEngine]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        🤖 Automated SEO Engine Dashboard
      </h3>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalKeywords}</div>
            <div className="text-sm text-gray-600">Total Keywords</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{metrics.topKeywordClicks}</div>
            <div className="text-sm text-gray-600">Total Clicks</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{metrics.averagePosition?.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avg Position</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{metrics.totalPages}</div>
            <div className="text-sm text-gray-600">Total Pages</div>
          </div>
        </div>
      )}

      {/* Top Optimizations */}
      <div className="space-y-4">
        {optimizations.topKeywords && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">🔥 Top Keywords</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {optimizations.topKeywords.slice(0, 6).map((keyword, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                  <div className="font-medium">{keyword.keyword}</div>
                  <div className="text-gray-500">
                    {keyword.clicks} clicks, Pos: {keyword.position.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {optimizations.lowCTRPages && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">⚡ Pages Needing Optimization</h4>
            <div className="space-y-2">
              {optimizations.lowCTRPages.slice(0, 3).map((page, index) => (
                <div key={index} className="bg-red-50 p-3 rounded text-sm">
                  <div className="font-medium text-red-700">{page.page}</div>
                  <div className="text-red-600">
                    {page.impressions} impressions, {page.ctr.toFixed(2)}% CTR
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {optimizations.emergingKeywords && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">🚀 Emerging Opportunities</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {optimizations.emergingKeywords.slice(0, 4).map((keyword, index) => (
                <div key={index} className="bg-green-50 p-3 rounded text-sm">
                  <div className="font-medium text-green-700">{keyword.keyword}</div>
                  <div className="text-green-600">
                    Pos: {keyword.position.toFixed(1)}, {keyword.impressions} impressions
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Last updated: {metrics?.lastUpdated ? new Date(metrics.lastUpdated).toLocaleString() : 'Unknown'}
      </div>
    </div>
  );
};

export { AutomatedSEOEngine, SEODashboard };
export default AutomatedSEOEngine;
