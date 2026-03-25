import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { Search, Filter, X, ChevronDown, Loader2, SortAsc, SortDesc } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface SearchResult<T = any> {
  content: T[];
  totalElements: number;
  page: number;
  size: number;
  totalPages: number;
  searchTerms: string[];
  hasNext: boolean;
  hasPrevious: boolean;
}

interface GlobalSearchResult {
  query: string;
  searchTerms: string[];
  users: SearchResult;
  activities: SearchResult;
  achievements: SearchResult;
  totalResults: number;
}

interface SearchFilters {
  category?: string;
  difficulty?: string;
  status?: string;
  rarity?: string;
  levelMin?: number;
  levelMax?: number;
  pointsMin?: number;
  pointsMax?: number;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
}

interface AdvancedSearchProps {
  searchType?: 'users' | 'activities' | 'achievements' | 'global';
  onResults?: (results: SearchResult | GlobalSearchResult) => void;
  placeholder?: string;
  showFilters?: boolean;
  initialQuery?: string;
  className?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  searchType = 'global',
  onResults,
  placeholder = 'Search...',
  showFilters = true,
  initialQuery = '',
  className = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: searchResults, loading: searchLoading, execute: executeSearch } = useApi();
  const { data: suggestionsData, loading: suggestionsLoading, execute: fetchSuggestions } = useApi();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, searchFilters: SearchFilters, currentPage: number) => {
      if (!searchQuery.trim() && Object.keys(searchFilters).length === 0) return;

      const params = new URLSearchParams({
        q: searchQuery,
        page: currentPage.toString(),
        size: '20',
        sort: sortBy,
        sortDir: sortDir,
        ...Object.fromEntries(
          Object.entries(searchFilters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      const endpoint = searchType === 'global'
        ? `/api/search/global?${params}`
        : `/api/search/${searchType}?${params}`;

      executeSearch({ url: endpoint });
    }, 300),
    [searchType, sortBy, sortDir, executeSearch]
  );

  // Debounced suggestions fetch
  const debouncedFetchSuggestions = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.length >= 2) {
        fetchSuggestions({ url: `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8` });
      } else {
        setSuggestions([]);
      }
    }, 200),
    [fetchSuggestions]
  );

  // Effect for search execution
  useEffect(() => {
    debouncedSearch(query, filters, page);
  }, [query, filters, page, debouncedSearch]);

  // Effect for suggestions
  useEffect(() => {
    if (query.length >= 2) {
      debouncedFetchSuggestions(query);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, debouncedFetchSuggestions]);

  // Update suggestions when data arrives
  useEffect(() => {
    if (suggestionsData?.data) {
      setSuggestions(suggestionsData.data);
      setShowSuggestions(true);
    }
  }, [suggestionsData]);

  // Pass results to parent
  useEffect(() => {
    if (searchResults?.data && onResults) {
      onResults(searchResults.data);
    }
  }, [searchResults, onResults]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(0);
  };

  const handleFilterChange = (filterKey: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== undefined && value !== '').length;
  }, [filters]);

  const renderFilterPanel = () => {
    if (!showFilterPanel) return null;

    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Category Filter */}
          {(searchType === 'activities' || searchType === 'achievements' || searchType === 'global') && (
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
          {(searchType === 'activities' || searchType === 'global') && (
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
          {(searchType === 'achievements' || searchType === 'global') && (
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

          {/* Points Range */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Points Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.pointsMin || ''}
                onChange={(e) => handleFilterChange('pointsMin', e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.pointsMax || ''}
                onChange={(e) => handleFilterChange('pointsMax', e.target.value ? parseInt(e.target.value) : undefined)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range */}
          {(searchType === 'activities' || searchType === 'global') && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Location Filter */}
          {(searchType === 'activities' || searchType === 'global') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="Enter location"
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear All Filters
          </button>
          <button
            onClick={() => setShowFilterPanel(false)}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {(searchLoading || suggestionsLoading) && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <Search className="inline w-4 h-4 mr-2 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Toggle */}
        {showFilters && (
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
              showFilterPanel || activeFiltersCount > 0
                ? 'border-orange-500 bg-orange-50 text-orange-600'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Sort Controls */}
        <div className="flex items-center space-x-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="points">Points</option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
            className="p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            {sortDir === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {renderFilterPanel()}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-sm text-gray-600">Active filters:</span>
          {Object.entries(filters).map(([key, value]) => {
            if (value === undefined || value === '') return null;
            return (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
              >
                {key}: {value}
                <button
                  onClick={() => handleFilterChange(key as keyof SearchFilters, undefined)}
                  className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};