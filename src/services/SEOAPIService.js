/**
 * SEO API Service
 * Handles communication between React frontend and PHP backend
 */

class SEOAPIService {
  constructor() {
    this.baseURL = '/php/seo_api.php'; // Use the new API router
    this.defaultParams = new URLSearchParams();
  }
  /**
   * Make HTTP request to PHP backend
   */
  async makeRequest(action, method = 'GET', data = null, params = {}) {
    try {
      const url = new URL(this.baseURL, window.location.origin);
      url.searchParams.set('action', action);
      
      // Add additional parameters
      Object.keys(params).forEach(key => {
        url.searchParams.set(key, params[key]);
      });

      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url.toString(), config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success === false) {
        throw new Error(result.message || 'API request failed');
      }

      return result;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * Process CSV reports
   */
  async processCSVReports() {
    return await this.makeRequest('process', 'POST');
  }

  /**
   * Get current status
   */
  async getStatus() {
    return await this.makeRequest('status');
  }

  /**
   * Get dashboard data
   */
  async getDashboardData() {
    return await this.makeRequest('dashboard');
  }

  /**
   * Get SEO optimizations
   */
  async getOptimizations(limit = 20, offset = 0) {
    return await this.makeRequest('optimizations', 'GET', null, { limit, offset });
  }

  /**
   * Upload CSV file
   */
  async uploadCSVFile(file, fileType) {
    const formData = new FormData();
    formData.append('csvFile', file);
    formData.append('fileType', fileType);

    try {
      const url = new URL(this.baseURL, window.location.origin);
      url.searchParams.set('action', 'upload');

      const response = await fetch(url.toString(), {
        method: 'POST',
        body: formData, // Don't set Content-Type header for FormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success === false) {
        throw new Error(result.message || 'File upload failed');
      }

      return result;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  /**
   * Get SEO insights
   */
  async getInsights(timeframe = '7d') {
    return await this.makeRequest('insights', 'GET', null, { timeframe });
  }

  /**
   * Update SEO settings
   */
  async updateSettings(settings) {
    return await this.makeRequest('settings', 'POST', settings);
  }

  /**
   * Export SEO data
   */
  async exportData(format = 'json', filters = {}) {
    return await this.makeRequest('export', 'GET', null, { format, ...filters });
  }

  /**
   * Get keyword performance data
   */
  async getKeywordPerformance(limit = 50, sortBy = 'clicks', order = 'DESC') {
    return await this.makeRequest('keywords', 'GET', null, { limit, sort: sortBy, order });
  }

  /**
   * Get page performance data
   */
  async getPagePerformance(limit = 50, sortBy = 'clicks', order = 'DESC') {
    return await this.makeRequest('pages', 'GET', null, { limit, sort: sortBy, order });
  }

  /**
   * Get content gaps
   */
  async getContentGaps() {
    return await this.makeRequest('content_gaps');
  }

  /**
   * Get international opportunities
   */
  async getInternationalOpportunities() {
    return await this.makeRequest('international');
  }

  /**
   * Get device performance data
   */
  async getDevicePerformance() {
    return await this.makeRequest('devices');
  }

  /**
   * Start automated monitoring
   */
  async startMonitoring(intervalMinutes = 30) {
    return await this.makeRequest('start_monitoring', 'POST', { interval: intervalMinutes });
  }

  /**
   * Stop automated monitoring
   */
  async stopMonitoring() {
    return await this.makeRequest('stop_monitoring', 'POST');
  }

  /**
   * Get processing logs
   */
  async getProcessingLogs(limit = 100) {
    return await this.makeRequest('logs', 'GET', null, { limit });
  }

  /**
   * Force process all pending CSV files
   */
  async forceProcessCSV() {
    return await this.makeRequest('force_process', 'POST');
  }
}

export default SEOAPIService;
