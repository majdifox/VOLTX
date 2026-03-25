import React, { useState } from 'react';
import { User, Compass, Award, Star, MapPin, Calendar, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface SearchResultsDisplayProps {
  results?: SearchResult | GlobalSearchResult;
  loading?: boolean;
  searchType?: 'users' | 'activities' | 'achievements' | 'global';
  onPageChange?: (page: number) => void;
  onItemClick?: (item: any, type: string) => void;
  className?: string;
}

export const SearchResultsDisplay: React.FC<SearchResultsDisplayProps> = ({
  results,
  loading = false,
  searchType = 'global',
  onPageChange,
  onItemClick,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'activities' | 'achievements'>('users');

  const highlightSearchTerms = (text: string, searchTerms: string[]) => {
    if (!text || !searchTerms?.length) return text;

    let highlightedText = text;
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  const renderUserCard = (user: any, searchTerms: string[] = []) => (
    <div
      key={user.id}
      onClick={() => onItemClick?.(user, 'user')}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {highlightSearchTerms(user.username, searchTerms)}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Lv. {user.level}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {highlightSearchTerms(`${user.firstName} ${user.lastName}`, searchTerms)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {highlightSearchTerms(user.email, searchTerms)}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Award className="w-4 h-4 text-orange-500" />
                <span>{user.adrenalinePoints} pts</span>
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityCard = (activity: any, searchTerms: string[] = []) => (
    <div
      key={activity.id}
      onClick={() => onItemClick?.(activity, 'activity')}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {activity.imageUrl ? (
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Compass className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {highlightSearchTerms(activity.title, searchTerms)}
            </h3>
            <div className="flex items-center space-x-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activity.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                activity.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                activity.difficulty === 'ADVANCED' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {activity.difficulty}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {highlightSearchTerms(activity.description, searchTerms)}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {activity.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{highlightSearchTerms(activity.location, searchTerms)}</span>
                </span>
              )}
              {activity.activityDate && (
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{new Date(activity.activityDate).toLocaleDateString()}</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-sm text-orange-600">
              <Award className="w-4 h-4" />
              <span>{activity.adrenalinePoints} pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAchievementCard = (achievement: any, searchTerms: string[] = []) => (
    <div
      key={achievement.id}
      onClick={() => onItemClick?.(achievement, 'achievement')}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {achievement.iconUrl ? (
            <img
              src={achievement.iconUrl}
              alt={achievement.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              achievement.rarity === 'MYTHIC' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
              achievement.rarity === 'LEGENDARY' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
              achievement.rarity === 'EPIC' ? 'bg-gradient-to-br from-purple-400 to-blue-500' :
              achievement.rarity === 'RARE' ? 'bg-gradient-to-br from-blue-400 to-green-500' :
              'bg-gradient-to-br from-gray-400 to-gray-600'
            }`}>
              <Award className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {highlightSearchTerms(achievement.name, searchTerms)}
            </h3>
            <div className="flex items-center space-x-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                achievement.rarity === 'MYTHIC' ? 'bg-purple-100 text-purple-800' :
                achievement.rarity === 'LEGENDARY' ? 'bg-yellow-100 text-yellow-800' :
                achievement.rarity === 'EPIC' ? 'bg-blue-100 text-blue-800' :
                achievement.rarity === 'RARE' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {achievement.rarity}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {highlightSearchTerms(achievement.description, searchTerms)}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-500">
              Category: {achievement.category}
            </span>
            <div className="flex items-center space-x-1 text-sm text-orange-600">
              <Star className="w-4 h-4" />
              <span>{achievement.points} pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPagination = (result: SearchResult) => {
    if (result.totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(0, result.page - 2);
    const endPage = Math.min(result.totalPages - 1, result.page + 2);

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {result.page * result.size + 1} to {Math.min((result.page + 1) * result.size, result.totalElements)} of {result.totalElements} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange?.(result.page - 1)}
            disabled={!result.hasPrevious}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {startPage > 0 && (
            <>
              <button
                onClick={() => onPageChange?.(0)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                1
              </button>
              {startPage > 1 && <span className="px-2">...</span>}
            </>
          )}

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => onPageChange?.(pageNum)}
              className={`px-3 py-2 border rounded-lg ${
                pageNum === result.page
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNum + 1}
            </button>
          ))}

          {endPage < result.totalPages - 1 && (
            <>
              {endPage < result.totalPages - 2 && <span className="px-2">...</span>}
              <button
                onClick={() => onPageChange?.(result.totalPages - 1)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {result.totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => onPageChange?.(result.page + 1)}
            disabled={!result.hasNext}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <Compass className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Start searching to see results</p>
      </div>
    );
  }

  if (searchType === 'global' && 'totalResults' in results) {
    const globalResults = results as GlobalSearchResult;

    if (globalResults.totalResults === 0) {
      return (
        <div className={`text-center py-8 text-gray-500 ${className}`}>
          <Compass className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No results found for "{globalResults.query}"</p>
          <p className="text-sm mt-2">Try different keywords or adjust your filters</p>
        </div>
      );
    }

    return (
      <div className={className}>
        {/* Search Summary */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Search Results for "{globalResults.query}"
          </h2>
          <p className="text-gray-600">
            Found {globalResults.totalResults} results across all categories
          </p>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'users', label: 'Users', count: globalResults.users.totalElements, icon: User },
              { key: 'activities', label: 'Activities', count: globalResults.activities.totalElements, icon: Compass },
              { key: 'achievements', label: 'Achievements', count: globalResults.achievements.totalElements, icon: Award }
            ].map(({ key, label, count, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-1 text-xs">
                  {count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Results Content */}
        <div className="space-y-4">
          {activeTab === 'users' && globalResults.users.content.map(user =>
            renderUserCard(user, globalResults.searchTerms)
          )}
          {activeTab === 'activities' && globalResults.activities.content.map(activity =>
            renderActivityCard(activity, globalResults.searchTerms)
          )}
          {activeTab === 'achievements' && globalResults.achievements.content.map(achievement =>
            renderAchievementCard(achievement, globalResults.searchTerms)
          )}
        </div>

        {/* Pagination */}
        {activeTab === 'users' && renderPagination(globalResults.users)}
        {activeTab === 'activities' && renderPagination(globalResults.activities)}
        {activeTab === 'achievements' && renderPagination(globalResults.achievements)}
      </div>
    );
  } else {
    const singleResults = results as SearchResult;

    if (singleResults.totalElements === 0) {
      return (
        <div className={`text-center py-8 text-gray-500 ${className}`}>
          <Compass className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No results found</p>
          <p className="text-sm mt-2">Try different keywords or adjust your filters</p>
        </div>
      );
    }

    return (
      <div className={className}>
        <div className="mb-4">
          <p className="text-gray-600">
            Found {singleResults.totalElements} results
          </p>
        </div>

        <div className="space-y-4">
          {singleResults.content.map(item => {
            if (searchType === 'users') return renderUserCard(item, singleResults.searchTerms);
            if (searchType === 'activities') return renderActivityCard(item, singleResults.searchTerms);
            if (searchType === 'achievements') return renderAchievementCard(item, singleResults.searchTerms);
            return null;
          })}
        </div>

        {renderPagination(singleResults)}
      </div>
    );
  }
};