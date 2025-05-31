/**
 * SEO Automation Dashboard
 * Main component that integrates automated SEO engine with the food price app
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SEODashboard } from './AutomatedSEOEngine';
import CSVReportProcessor from '../../services/CSVReportProcessor'; // Adjust the import path as needed

const SEOAutomationDashboard = () => {
  const [processor] = useState(() => new CSVReportProcessor());
  const [status, setStatus] = useState(null);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [lastProcessed, setLastProcessed] = useState(null);
  const [processingLogs, setProcessingLogs] = useState([]);

  const updateStatus = useCallback(() => {
    const currentStatus = processor.getStatus();
    setStatus(currentStatus);
    setLastProcessed(currentStatus.lastProcessedTime);
  }, [processor]);

  useEffect(() => {
    // Load initial status
    updateStatus();
      // Set up periodic status updates
    const statusInterval = setInterval(updateStatus, 30000); // Update every 30 seconds
    
    return () => clearInterval(statusInterval);
  }, [updateStatus]);

  const handleStartAutomation = async () => {
    try {
      addLog('🚀 Starting automated SEO monitoring...', 'info');
      await processor.startMonitoring(30); // Monitor every 30 minutes
      setIsAutoMode(true);
      addLog('✅ Automated SEO monitoring started successfully', 'success');
      updateStatus();
    } catch (error) {
      addLog(`❌ Failed to start automation: ${error.message}`, 'error');
    }
  };

  const handleStopAutomation = () => {
    try {
      processor.stopMonitoring();
      setIsAutoMode(false);
      addLog('🛑 Automated SEO monitoring stopped', 'info');
      updateStatus();
    } catch (error) {
      addLog(`❌ Failed to stop automation: ${error.message}`, 'error');
    }
  };

  const handleForceProcess = async () => {
    try {
      addLog('🔄 Force processing CSV reports...', 'info');
      await processor.forceProcess();
      addLog('✅ Force processing completed', 'success');
      updateStatus();
    } catch (error) {
      addLog(`❌ Force processing failed: ${error.message}`, 'error');
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setProcessingLogs(prev => [
      { timestamp, message, type },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  };

  const exportSEOData = async () => {
    try {      // This would integrate with your backend to export SEO data
      const data = {
        status: status,
        lastProcessed: lastProcessed,
        processingLogs: processingLogs.slice(0, 10), // Include recent logs
        exportTime: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      addLog('📊 SEO data exported successfully', 'success');
    } catch (error) {
      addLog(`❌ Export failed: ${error.message}`, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">🤖 Automated SEO System</h1>
        <p className="text-blue-100">
          Intelligent SEO optimization powered by Google Search Console data
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Control Panel</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Status Card */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">System Status</div>
            <div className={`text-lg font-semibold ${
              isAutoMode ? 'text-green-600' : 'text-gray-600'
            }`}>
              {isAutoMode ? '🟢 Active' : '⚪ Inactive'}
            </div>
          </div>

          {/* Processing Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Processing</div>
            <div className={`text-lg font-semibold ${
              status?.isProcessing ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {status?.isProcessing ? '⚡ Processing' : '💤 Idle'}
            </div>
          </div>

          {/* Queue Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Queue</div>
            <div className="text-lg font-semibold text-gray-800">
              {status?.queueLength || 0} items
            </div>
          </div>

          {/* Last Processed */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Last Update</div>
            <div className="text-lg font-semibold text-gray-800">
              {lastProcessed ? new Date(lastProcessed).toLocaleTimeString() : 'Never'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {!isAutoMode ? (
            <button
              onClick={handleStartAutomation}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              🚀 Start Automation
            </button>
          ) : (
            <button
              onClick={handleStopAutomation}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              🛑 Stop Automation
            </button>
          )}
          
          <button
            onClick={handleForceProcess}
            disabled={status?.isProcessing}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            🔄 Force Process
          </button>
          
          <button
            onClick={exportSEOData}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            📊 Export Data
          </button>
        </div>
      </div>

      {/* SEO Dashboard */}
      <SEODashboard />

      {/* Processing Logs */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Processing Logs</h3>
        
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-sm">
          {processingLogs.length === 0 ? (
            <div className="text-gray-400">No logs yet...</div>
          ) : (
            processingLogs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-400">[{log.timestamp}]</span>{' '}
                <span className={
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'warning' ? 'text-yellow-400' :
                  'text-gray-100'
                }>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">⚙️ Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monitoring Settings */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Monitoring Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Processing Interval (minutes)
                </label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option value="15">15 minutes</option>
                  <option value="30" selected>30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="180">3 hours</option>
                  <option value="360">6 hours</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Auto-optimization Level
                </label>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option value="conservative">Conservative</option>
                  <option value="moderate" selected>Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Notifications</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-700">
                  Email notifications for critical optimizations
                </span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm text-gray-700">
                  Daily performance summaries
                </span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">
                  Webhook notifications
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">📈 Performance Boost</h4>
          <div className="text-2xl font-bold text-blue-600">+23.5%</div>
          <div className="text-sm text-blue-600">Average CTR improvement</div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">🎯 Optimizations Applied</h4>
          <div className="text-2xl font-bold text-green-600">147</div>
          <div className="text-sm text-green-600">This month</div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">🔍 Keywords Tracked</h4>
          <div className="text-2xl font-bold text-purple-600">1,234</div>
          <div className="text-sm text-purple-600">Active monitoring</div>
        </div>
      </div>
    </div>
  );
};

export default SEOAutomationDashboard;
