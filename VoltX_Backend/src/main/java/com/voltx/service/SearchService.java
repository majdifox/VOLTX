package com.voltx.service;

import com.voltx.entity.User;
import com.voltx.entity.Activity;
import com.voltx.entity.Achievement;
import com.voltx.repository.UserRepository;
import com.voltx.repository.ActivityRepository;
import com.voltx.repository.AchievementRepository;
import com.voltx.util.SearchUtils;
import com.voltx.util.SearchUtils.SpecificationBuilder;
import com.voltx.util.SearchUtils.SearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Advanced search service with full-text search, filtering, and ranking capabilities
 */
@Service
@Transactional(readOnly = true)
public class SearchService {

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final AchievementRepository achievementRepository;

    @Autowired
    public SearchService(UserRepository userRepository,
                        ActivityRepository activityRepository,
                        AchievementRepository achievementRepository) {
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
        this.achievementRepository = achievementRepository;
    }

    /**
     * Search users with advanced filtering and ranking
     */
    @Cacheable(value = "searchResults", key = "'users:' + #query + ':' + #filters.hashCode() + ':' + #pageable.hashCode()")
    public SearchResult<User> searchUsers(String query, Map<String, Object> filters, Pageable pageable) {
        SpecificationBuilder<User> specBuilder = new SpecificationBuilder<>();

        // Add text search criteria
        if (query != null && !query.trim().isEmpty()) {
            String normalizedQuery = SearchUtils.normalizeQuery(query);
            List<String> searchTerms = SearchUtils.extractSearchTerms(normalizedQuery);

            // Search in multiple fields
            specBuilder
                .with("username", "like", normalizedQuery)
                .or()
                .with("email", "like", normalizedQuery)
                .or()
                .with("firstName", "like", normalizedQuery)
                .or()
                .with("lastName", "like", normalizedQuery);
        }

        // Add filters
        if (filters != null && !filters.isEmpty()) {
            addUserFilters(specBuilder, filters);
        }

        Specification<User> spec = specBuilder.build();
        Page<User> page = userRepository.findAll(spec, pageable);

        // Calculate relevance scores and rank results
        List<User> rankedUsers = rankUserResults(page.getContent(), query);

        return new SearchResult<>(
            rankedUsers,
            page.getTotalElements(),
            page.getNumber(),
            page.getSize(),
            page.getTotalPages(),
            SearchUtils.extractSearchTerms(query)
        );
    }

    /**
     * Search activities with date range and category filtering
     */
    @Cacheable(value = "searchResults", key = "'activities:' + #query + ':' + #filters.hashCode() + ':' + #pageable.hashCode()")
    public SearchResult<Activity> searchActivities(String query, Map<String, Object> filters, Pageable pageable) {
        SpecificationBuilder<Activity> specBuilder = new SpecificationBuilder<>();

        // Add text search criteria
        if (query != null && !query.trim().isEmpty()) {
            String normalizedQuery = SearchUtils.normalizeQuery(query);

            specBuilder
                .with("title", "like", normalizedQuery)
                .or()
                .with("description", "like", normalizedQuery)
                .or()
                .with("location", "like", normalizedQuery);
        }

        // Add filters
        if (filters != null && !filters.isEmpty()) {
            addActivityFilters(specBuilder, filters);
        }

        Specification<Activity> spec = specBuilder.build();
        Page<Activity> page = activityRepository.findAll(spec, pageable);

        // Rank results by relevance and recency
        List<Activity> rankedActivities = rankActivityResults(page.getContent(), query);

        return new SearchResult<>(
            rankedActivities,
            page.getTotalElements(),
            page.getNumber(),
            page.getSize(),
            page.getTotalPages(),
            SearchUtils.extractSearchTerms(query)
        );
    }

    /**
     * Search achievements with category and difficulty filtering
     */
    @Cacheable(value = "searchResults", key = "'achievements:' + #query + ':' + #filters.hashCode() + ':' + #pageable.hashCode()")
    public SearchResult<Achievement> searchAchievements(String query, Map<String, Object> filters, Pageable pageable) {
        SpecificationBuilder<Achievement> specBuilder = new SpecificationBuilder<>();

        // Add text search criteria
        if (query != null && !query.trim().isEmpty()) {
            String normalizedQuery = SearchUtils.normalizeQuery(query);

            specBuilder
                .with("name", "like", normalizedQuery)
                .or()
                .with("description", "like", normalizedQuery);
        }

        // Add filters
        if (filters != null && !filters.isEmpty()) {
            addAchievementFilters(specBuilder, filters);
        }

        Specification<Achievement> spec = specBuilder.build();
        Page<Achievement> page = achievementRepository.findAll(spec, pageable);

        List<Achievement> rankedAchievements = rankAchievementResults(page.getContent(), query);

        return new SearchResult<>(
            rankedAchievements,
            page.getTotalElements(),
            page.getNumber(),
            page.getSize(),
            page.getTotalPages(),
            SearchUtils.extractSearchTerms(query)
        );
    }

    /**
     * Global search across multiple entity types
     */
    public GlobalSearchResult globalSearch(String query, Map<String, Object> filters, Pageable pageable) {
        List<String> searchTerms = SearchUtils.extractSearchTerms(query);

        // Search in parallel (simplified - in production you might use CompletableFuture)
        SearchResult<User> userResults = searchUsers(query, filters, pageable);
        SearchResult<Activity> activityResults = searchActivities(query, filters, pageable);
        SearchResult<Achievement> achievementResults = searchAchievements(query, filters, pageable);

        return new GlobalSearchResult(
            query,
            searchTerms,
            userResults,
            activityResults,
            achievementResults
        );
    }

    /**
     * Get search suggestions based on query
     */
    @Cacheable(value = "searchSuggestions", key = "#query")
    public List<String> getSearchSuggestions(String query, int limit) {
        if (query == null || query.length() < 2) {
            return Collections.emptyList();
        }

        String normalizedQuery = SearchUtils.normalizeQuery(query);
        Set<String> suggestions = new LinkedHashSet<>();

        // Get suggestions from usernames
        List<String> userSuggestions = userRepository.findUsernamesSuggestions(normalizedQuery, limit);
        suggestions.addAll(userSuggestions);

        // Get suggestions from activity titles
        List<String> activitySuggestions = activityRepository.findTitleSuggestions(normalizedQuery, limit);
        suggestions.addAll(activitySuggestions);

        // Get suggestions from achievement names
        List<String> achievementSuggestions = achievementRepository.findNameSuggestions(normalizedQuery, limit);
        suggestions.addAll(achievementSuggestions);

        return suggestions.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    // Private helper methods for adding filters

    private void addUserFilters(SpecificationBuilder<User> specBuilder, Map<String, Object> filters) {
        if (filters.containsKey("status")) {
            specBuilder.and().with("status", "eq", filters.get("status"));
        }
        if (filters.containsKey("level_min")) {
            specBuilder.and().with("level", "gte", filters.get("level_min"));
        }
        if (filters.containsKey("level_max")) {
            specBuilder.and().with("level", "lte", filters.get("level_max"));
        }
        if (filters.containsKey("points_min")) {
            specBuilder.and().with("adrenalinePoints", "gte", filters.get("points_min"));
        }
        if (filters.containsKey("points_max")) {
            specBuilder.and().with("adrenalinePoints", "lte", filters.get("points_max"));
        }
        if (filters.containsKey("created_after")) {
            specBuilder.and().with("createdAt", "gte", filters.get("created_after"));
        }
        if (filters.containsKey("created_before")) {
            specBuilder.and().with("createdAt", "lte", filters.get("created_before"));
        }
    }

    private void addActivityFilters(SpecificationBuilder<Activity> specBuilder, Map<String, Object> filters) {
        if (filters.containsKey("category")) {
            specBuilder.and().with("category", "eq", filters.get("category"));
        }
        if (filters.containsKey("difficulty")) {
            specBuilder.and().with("difficulty", "eq", filters.get("difficulty"));
        }
        if (filters.containsKey("points_min")) {
            specBuilder.and().with("adrenalinePoints", "gte", filters.get("points_min"));
        }
        if (filters.containsKey("points_max")) {
            specBuilder.and().with("adrenalinePoints", "lte", filters.get("points_max"));
        }
        if (filters.containsKey("date_from")) {
            specBuilder.and().with("activityDate", "gte", filters.get("date_from"));
        }
        if (filters.containsKey("date_to")) {
            specBuilder.and().with("activityDate", "lte", filters.get("date_to"));
        }
        if (filters.containsKey("location")) {
            specBuilder.and().with("location", "like", filters.get("location"));
        }
    }

    private void addAchievementFilters(SpecificationBuilder<Achievement> specBuilder, Map<String, Object> filters) {
        if (filters.containsKey("category")) {
            specBuilder.and().with("category", "eq", filters.get("category"));
        }
        if (filters.containsKey("rarity")) {
            specBuilder.and().with("rarity", "eq", filters.get("rarity"));
        }
        if (filters.containsKey("points_min")) {
            specBuilder.and().with("points", "gte", filters.get("points_min"));
        }
        if (filters.containsKey("points_max")) {
            specBuilder.and().with("points", "lte", filters.get("points_max"));
        }
    }

    // Private helper methods for ranking results

    private List<User> rankUserResults(List<User> users, String query) {
        if (query == null || query.trim().isEmpty()) {
            return users;
        }

        List<String> searchTerms = SearchUtils.extractSearchTerms(query);

        return users.stream()
                .sorted((u1, u2) -> {
                    double score1 = calculateUserRelevanceScore(u1, searchTerms);
                    double score2 = calculateUserRelevanceScore(u2, searchTerms);
                    return Double.compare(score2, score1); // Descending order
                })
                .collect(Collectors.toList());
    }

    private List<Activity> rankActivityResults(List<Activity> activities, String query) {
        if (query == null || query.trim().isEmpty()) {
            return activities;
        }

        List<String> searchTerms = SearchUtils.extractSearchTerms(query);

        return activities.stream()
                .sorted((a1, a2) -> {
                    double score1 = calculateActivityRelevanceScore(a1, searchTerms);
                    double score2 = calculateActivityRelevanceScore(a2, searchTerms);
                    return Double.compare(score2, score1); // Descending order
                })
                .collect(Collectors.toList());
    }

    private List<Achievement> rankAchievementResults(List<Achievement> achievements, String query) {
        if (query == null || query.trim().isEmpty()) {
            return achievements;
        }

        List<String> searchTerms = SearchUtils.extractSearchTerms(query);

        return achievements.stream()
                .sorted((a1, a2) -> {
                    double score1 = calculateAchievementRelevanceScore(a1, searchTerms);
                    double score2 = calculateAchievementRelevanceScore(a2, searchTerms);
                    return Double.compare(score2, score1); // Descending order
                })
                .collect(Collectors.toList());
    }

    private double calculateUserRelevanceScore(User user, List<String> searchTerms) {
        double score = 0.0;

        score += SearchUtils.calculateRelevanceScore(user.getUsername(), searchTerms) * 3.0;
        score += SearchUtils.calculateRelevanceScore(user.getFirstName() + " " + user.getLastName(), searchTerms) * 2.0;
        score += SearchUtils.calculateRelevanceScore(user.getEmail(), searchTerms);

        // Boost score for active users
        if ("ACTIVE".equals(user.getStatus())) {
            score *= 1.2;
        }

        return score;
    }

    private double calculateActivityRelevanceScore(Activity activity, List<String> searchTerms) {
        double score = 0.0;

        score += SearchUtils.calculateRelevanceScore(activity.getTitle(), searchTerms) * 3.0;
        score += SearchUtils.calculateRelevanceScore(activity.getDescription(), searchTerms) * 2.0;
        score += SearchUtils.calculateRelevanceScore(activity.getLocation(), searchTerms);

        // Boost score for recent activities
        if (activity.getActivityDate() != null) {
            long daysAgo = java.time.temporal.ChronoUnit.DAYS.between(activity.getActivityDate(), LocalDateTime.now());
            if (daysAgo <= 7) {
                score *= 1.3;
            } else if (daysAgo <= 30) {
                score *= 1.1;
            }
        }

        return score;
    }

    private double calculateAchievementRelevanceScore(Achievement achievement, List<String> searchTerms) {
        double score = 0.0;

        score += SearchUtils.calculateRelevanceScore(achievement.getName(), searchTerms) * 3.0;
        score += SearchUtils.calculateRelevanceScore(achievement.getDescription(), searchTerms) * 2.0;

        // Boost score for higher rarity achievements
        switch (achievement.getRarity()) {
            case MYTHIC:
                score *= 2.0;
                break;
            case LEGENDARY:
                score *= 1.8;
                break;
            case EPIC:
                score *= 1.5;
                break;
            case RARE:
                score *= 1.2;
                break;
        }

        return score;
    }

    // Result classes

    public static class SearchResult<T> {
        private final List<T> content;
        private final long totalElements;
        private final int page;
        private final int size;
        private final int totalPages;
        private final List<String> searchTerms;

        public SearchResult(List<T> content, long totalElements, int page, int size, int totalPages, List<String> searchTerms) {
            this.content = content;
            this.totalElements = totalElements;
            this.page = page;
            this.size = size;
            this.totalPages = totalPages;
            this.searchTerms = searchTerms;
        }

        // Getters
        public List<T> getContent() { return content; }
        public long getTotalElements() { return totalElements; }
        public int getPage() { return page; }
        public int getSize() { return size; }
        public int getTotalPages() { return totalPages; }
        public List<String> getSearchTerms() { return searchTerms; }
        public boolean hasNext() { return page < totalPages - 1; }
        public boolean hasPrevious() { return page > 0; }
    }

    public static class GlobalSearchResult {
        private final String query;
        private final List<String> searchTerms;
        private final SearchResult<User> users;
        private final SearchResult<Activity> activities;
        private final SearchResult<Achievement> achievements;

        public GlobalSearchResult(String query, List<String> searchTerms,
                                SearchResult<User> users, SearchResult<Activity> activities,
                                SearchResult<Achievement> achievements) {
            this.query = query;
            this.searchTerms = searchTerms;
            this.users = users;
            this.activities = activities;
            this.achievements = achievements;
        }

        // Getters
        public String getQuery() { return query; }
        public List<String> getSearchTerms() { return searchTerms; }
        public SearchResult<User> getUsers() { return users; }
        public SearchResult<Activity> getActivities() { return activities; }
        public SearchResult<Achievement> getAchievements() { return achievements; }

        public long getTotalResults() {
            return users.getTotalElements() + activities.getTotalElements() + achievements.getTotalElements();
        }
    }
}