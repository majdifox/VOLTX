import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, Users, Compass, Award, FileText, Database, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useNotification } from '../contexts/NotificationContext';

interface ExportStatus {
  availableFormats: string[];
  availableDataTypes: string[];
  maxBatchSize: number;
  supportedFilters: Record<string, string[]>;
  exportLimitations: Record<string, string[]>;
}

interface ExportFilters {
  status?: string;
  category?: string;
  difficulty?: string;
  rarity?: string;
  level?: number;
  dateFrom?: string;
  dateTo?: string;
  activeOnly?: boolean;
}

interface DataExportProps {
  className?: string;
  userRole?: 'USER' | 'MODERATOR' | 'ADMIN';
}

export const DataExport: React.FC<DataExportProps> = ({
  className = '',
  userRole = 'USER'
}) => {
  const [selectedDataType, setSelectedDataType] = useState<string>('USERS');
  const [selectedFormat, setSelectedFormat] = useState<string>('CSV');
  const [filters, setFilters] = useState<ExportFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const { data: statusData, loading: statusLoading, execute: fetchStatus } = useApi();
  const { execute: executeExport } = useApi();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchStatus({ url: '/api/export/status' });
  }, []);

  useEffect(() => {
    if (statusData?.data) {
      setExportStatus(statusData.data);
    }
  }, [statusData]);

  const getAvailableDataTypes = () => {
    if (!exportStatus) return [];

    const allTypes = [
      { value: 'USERS', label: 'Users', icon: Users, description: 'User profiles and statistics' },
      { value: 'ACTIVITIES', label: 'Activities', icon: Compass, description: 'Activity data and schedules' },
      { value: 'ACHIEVEMENTS', label: 'Achievements', icon: Award, description: 'Achievement definitions and progress' },
      { value: 'ALL', label: 'All Data', icon: Database, description: 'Complete platform export' },
      { value: 'ANALYTICS', label: 'Analytics', icon: FileText, description: 'Comprehensive analytics report' }
    ];

    // Filter based on user permissions
    if (userRole === 'USER') {
      return allTypes.filter(type => type.value === 'USERS'); // Users can only export their own data
    } else if (userRole === 'MODERATOR') {
      return allTypes.filter(type => !['ALL', 'ANALYTICS'].includes(type.value));
    } else {
      return allTypes; // Admin can export everything
    }
  };

  const getAvailableFormats = () => [
    { value: 'CSV', label: 'CSV', description: 'Comma-separated values for spreadsheets' },
    { value: 'EXCEL', label: 'Excel', description: 'Excel workbook with formatting' },
    { value: 'JSON', label: 'JSON', description: 'JSON format for API integration' }
  ];

  const getSupportedFilters = () => {
    if (!exportStatus) return [];
    return exportStatus.supportedFilters[selectedDataType.toLowerCase()] || [];
  };

  const handleFilterChange = (key: keyof ExportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        format: selectedFormat,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const endpoint = selectedDataType === 'ALL'
        ? '/api/export/all'
        : selectedDataType === 'ANALYTICS'
        ? '/api/export/analytics'
        : `/api/export/${selectedDataType.toLowerCase()}`;

      const response = await executeExport({
        url: `${endpoint}?${params}`,
        method: 'GET',
        responseType: 'blob'
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      if (response.data) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Generate filename based on export type and current date
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const extension = selectedFormat.toLowerCase() === 'excel' ? 'xlsx' : selectedFormat.toLowerCase();
        link.download = `${selectedDataType.toLowerCase()}_export_${timestamp}.${extension}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        addNotification({
          type: 'success',
          title: 'Export Completed',
          message: `${selectedDataType} data exported successfully`,
          duration: 5000
        });
      }

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export data',
        duration: 7000
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    const supportedFilters = getSupportedFilters();

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Export Filters</h4>
          <button
            onClick={() => setShowFilters(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          {supportedFilters.includes('status') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          )}

          {/* Category Filter */}
          {supportedFilters.includes('category') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="EXTREME_SPORTS">Extreme Sports</option>
                <option value="ADVENTURE">Adventure</option>
                <option value="WATER_SPORTS">Water Sports</option>
                <option value="MOUNTAIN_SPORTS">Mountain Sports</option>
                <option value="AERIAL_SPORTS">Aerial Sports</option>
              </select>
            </div>
          )}

          {/* Difficulty Filter */}
          {supportedFilters.includes('difficulty') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Difficulties</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
          )}

          {/* Rarity Filter */}
          {supportedFilters.includes('rarity') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rarity</label>
              <select
                value={filters.rarity || ''}
                onChange={(e) => handleFilterChange('rarity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Rarities</option>
                <option value="COMMON">Common</option>
                <option value="RARE">Rare</option>
                <option value="EPIC">Epic</option>
                <option value="LEGENDARY">Legendary</option>
                <option value="MYTHIC">Mythic</option>
              </select>
            </div>
          )}

          {/* Level Filter */}
          {supportedFilters.includes('level') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Level</label>
              <input
                type="number"
                value={filters.level || ''}
                onChange={(e) => handleFilterChange('level', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter level"
                min="1"
                max="100"
              />
            </div>
          )}

          {/* Date Range Filter */}
          {supportedFilters.includes('dateRange') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Active Only Filter */}
          {supportedFilters.includes('isActive') && (
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.activeOnly || false}
                  onChange={(e) => handleFilterChange('activeOnly', e.target.checked)}
                  className="mr-2 rounded border-gray-300 focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Active only</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 mr-4"
          >
            Clear Filters
          </button>
        </div>
      </div>
    );
  };

  if (statusLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
          <span>Loading export options...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <Download className="w-6 h-6 text-orange-500 mr-3" />
        <h3 className="text-xl font-semibold text-gray-900">Data Export</h3>
      </div>

      {/* Data Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Select Data Type</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {getAvailableDataTypes().map(({ value, label, icon: Icon, description }) => (
            <div
              key={value}
              onClick={() => setSelectedDataType(value)}
              className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                selectedDataType === value
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`w-6 h-6 ${selectedDataType === value ? 'text-orange-600' : 'text-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium ${selectedDataType === value ? 'text-orange-900' : 'text-gray-900'}`}>
                    {label}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
        <div className="flex space-x-4">
          {getAvailableFormats().map(({ value, label, description }) => (
            <label key={value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="format"
                value={value}
                checked={selectedFormat === value}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="mr-2 focus:ring-orange-500 text-orange-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Filters Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm text-orange-600 hover:text-orange-700"
        >
          <Filter className="w-4 h-4 mr-1" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {Object.keys(filters).length > 0 && (
            <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
              {Object.keys(filters).length} active
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {renderFilters()}

      {/* Export Progress */}
      {isExporting && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Exporting data...</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <p className="text-xs text-blue-700 mt-1">{exportProgress}% complete</p>
        </div>
      )}

      {/* Export Information */}
      {exportStatus && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Export Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Maximum batch size: {exportStatus.maxBatchSize.toLocaleString()} records</p>
            <p>• Supported formats: {exportStatus.availableFormats.join(', ')}</p>
            <p>• Your access level: {userRole}</p>
            {selectedDataType && getSupportedFilters().length > 0 && (
              <p>• Available filters: {getSupportedFilters().join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || !selectedDataType}
        className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Exporting...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Download className="w-5 h-5 mr-2" />
            Export {getAvailableDataTypes().find(t => t.value === selectedDataType)?.label}
          </div>
        )}
      </button>
    </div>
  );
};