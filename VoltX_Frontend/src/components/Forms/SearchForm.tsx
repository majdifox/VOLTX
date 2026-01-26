import React, { useState, useEffect } from "react";
import { Input, Button, Badge } from "../UI";
import { THEME } from "../../config/theme";

export interface SearchFilters {
  query: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  filters: Record<string, any>;
}

interface SearchFormProps {
  placeholder?: string;
  initialFilters?: Partial<SearchFilters>;
  sortOptions?: { value: string; label: string }[];
  filterOptions?: {
    key: string;
    label: string;
    type: 'select' | 'checkbox' | 'range';
    options?: { value: string; label: string }[];
    min?: number;
    max?: number;
  }[];
  onSearch: (filters: SearchFilters) => void;
  onReset?: () => void;
  showSortBy?: boolean;
  showFilters?: boolean;
  className?: string;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  placeholder = "Search...",
  initialFilters = {},
  sortOptions = [
    { value: "name", label: "Name" },
    { value: "date", label: "Date" },
    { value: "relevance", label: "Relevance" }
  ],
  filterOptions = [],
  onSearch,
  onReset,
  showSortBy = true,
  showFilters = true,
  className = ""
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialFilters.query || "",
    sortBy: initialFilters.sortBy || sortOptions[0]?.value || "",
    sortDirection: initialFilters.sortDirection || 'asc',
    filters: initialFilters.filters || {}
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Check if there are active filters
  useEffect(() => {
    const hasQuery = filters.query.length > 0;
    const hasCustomFilters = Object.values(filters.filters).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.length > 0;
      if (typeof value === 'boolean') return value;
      return false;
    });

    setHasActiveFilters(hasQuery || hasCustomFilters);
  }, [filters]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, query: e.target.value };
    setFilters(newFilters);

    // Debounced search
    const timeoutId = setTimeout(() => {
      onSearch(newFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSortChange = (field: 'sortBy' | 'sortDirection', value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = {
      ...filters,
      filters: { ...filters.filters, [key]: value }
    };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      query: "",
      sortBy: sortOptions[0]?.value || "",
      sortDirection: 'asc',
      filters: {}
    };

    setFilters(resetFilters);
    onSearch(resetFilters);

    if (onReset) {
      onReset();
    }
  };

  const getActiveFilterCount = (): number => {
    return Object.values(filters.filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.length > 0;
      if (typeof value === 'boolean') return value;
      return false;
    }).length;
  };

  const renderFilterOption = (option: SearchFormProps['filterOptions'][0]) => {
    const value = filters.filters[option.key];

    switch (option.type) {
      case 'select':
        return (
          <div key={option.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {option.label}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleFilterChange(option.key, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All {option.label}</option>
              {option.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={option.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {option.label}
            </label>
            <div className="space-y-2">
              {option.options?.map(opt => (
                <label key={opt.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(value || []).includes(opt.value)}
                    onChange={(e) => {
                      const currentValues = value || [];
                      const newValues = e.target.checked
                        ? [...currentValues, opt.value]
                        : currentValues.filter((v: string) => v !== opt.value);
                      handleFilterChange(option.key, newValues);
                    }}
                    className={`rounded border-gray-300 text-[${THEME.colors.primary}]`}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'range':
        return (
          <div key={option.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {option.label}
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                min={option.min}
                max={option.max}
                value={value?.min || ''}
                onChange={(e) => handleFilterChange(option.key, {
                  ...value,
                  min: e.target.value ? parseInt(e.target.value) : undefined
                })}
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                min={option.min}
                max={option.max}
                value={value?.max || ''}
                onChange={(e) => handleFilterChange(option.key, {
                  ...value,
                  max: e.target.value ? parseInt(e.target.value) : undefined
                })}
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <Input
            placeholder={placeholder}
            value={filters.query}
            onChange={handleQueryChange}
            startIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            fullWidth
          />
        </div>

        {(showSortBy || showFilters) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <Badge variant="primary" size="sm" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sort Options */}
            {showSortBy && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <div className="flex space-x-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange('sortBy', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleSortChange('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {filters.sortDirection === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            )}

            {/* Custom Filters */}
            {showFilters && filterOptions?.map(renderFilterOption)}
          </div>
        </div>
      )}
    </div>
  );
};