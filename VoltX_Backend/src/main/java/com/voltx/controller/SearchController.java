package com.voltx.controller;

import com.voltx.dto.ApiResponse;
import com.voltx.entity.User;
import com.voltx.entity.Activity;
import com.voltx.entity.Achievement;
import com.voltx.service.SearchService;
import com.voltx.service.SearchService.SearchResult;
import com.voltx.service.SearchService.GlobalSearchResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;

/**
 * REST controller for search operations
 */
@RestController
@RequestMapping("/api/search")
@Tag(name = "Search", description = "Search and filter operations")
public class SearchController {

    private final SearchService searchService;

    @Autowired
    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * Search users with advanced filtering
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Search users", description = "Search users with query and filters")
    public ResponseEntity<ApiResponse<SearchResult<User>>> searchUsers(
            @Parameter(description = "Search query") @RequestParam(required = false) String q,
            @Parameter(description = "Status filter") @RequestParam(required = false) String status,
            @Parameter(description = "Minimum level") @RequestParam(required = false) Integer levelMin,
            @Parameter(description = "Maximum level") @RequestParam(required = false) Integer levelMax,
            @Parameter(description = "Minimum points") @RequestParam(required = false) Integer pointsMin,
            @Parameter(description = "Maximum points") @RequestParam(required = false) Integer pointsMax,
            @Parameter(description = "Created after date") @RequestParam(required = false) String createdAfter,
            @Parameter(description = "Created before date") @RequestParam(required = false) String createdBefore,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Map<String, Object> filters = buildFiltersMap(
            status, levelMin, levelMax, pointsMin, pointsMax, createdAfter, createdBefore, null, null, null, null, null, null, null
        );

        SearchResult<User> result = searchService.searchUsers(q, filters, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", result));
    }

    /**
     * Search activities with advanced filtering
     */
    @GetMapping("/activities")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Search activities", description = "Search activities with query and filters")
    public ResponseEntity<ApiResponse<SearchResult<Activity>>> searchActivities(
            @Parameter(description = "Search query") @RequestParam(required = false) String q,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Difficulty filter") @RequestParam(required = false) String difficulty,
            @Parameter(description = "Minimum points") @RequestParam(required = false) Integer pointsMin,
            @Parameter(description = "Maximum points") @RequestParam(required = false) Integer pointsMax,
            @Parameter(description = "Date from") @RequestParam(required = false) String dateFrom,
            @Parameter(description = "Date to") @RequestParam(required = false) String dateTo,
            @Parameter(description = "Location filter") @RequestParam(required = false) String location,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Map<String, Object> filters = buildFiltersMap(
            null, null, null, pointsMin, pointsMax, null, null, category, difficulty, dateFrom, dateTo, location, null, null
        );

        SearchResult<Activity> result = searchService.searchActivities(q, filters, pageable);
        return ResponseEntity.ok(ApiResponse.success("Activities retrieved successfully", result));
    }

    /**
     * Search achievements with advanced filtering
     */
    @GetMapping("/achievements")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Search achievements", description = "Search achievements with query and filters")
    public ResponseEntity<ApiResponse<SearchResult<Achievement>>> searchAchievements(
            @Parameter(description = "Search query") @RequestParam(required = false) String q,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Rarity filter") @RequestParam(required = false) String rarity,
            @Parameter(description = "Minimum points") @RequestParam(required = false) Integer pointsMin,
            @Parameter(description = "Maximum points") @RequestParam(required = false) Integer pointsMax,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Map<String, Object> filters = buildFiltersMap(
            null, null, null, pointsMin, pointsMax, null, null, category, null, null, null, null, rarity, null
        );

        SearchResult<Achievement> result = searchService.searchAchievements(q, filters, pageable);
        return ResponseEntity.ok(ApiResponse.success("Achievements retrieved successfully", result));
    }

    /**
     * Global search across all entity types
     */
    @GetMapping("/global")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Global search", description = "Search across users, activities, and achievements")
    public ResponseEntity<ApiResponse<GlobalSearchResult>> globalSearch(
            @Parameter(description = "Search query", required = true)
            @RequestParam @Size(min = 2, max = 100, message = "Query must be between 2 and 100 characters") String q,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        GlobalSearchResult result = searchService.globalSearch(q, Map.of(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Global search completed", result));
    }

    /**
     * Get search suggestions
     */
    @GetMapping("/suggestions")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get search suggestions", description = "Get autocomplete suggestions for search query")
    public ResponseEntity<ApiResponse<List<String>>> getSearchSuggestions(
            @Parameter(description = "Partial search query", required = true)
            @RequestParam @Size(min = 1, max = 50, message = "Query must be between 1 and 50 characters") String q,
            @Parameter(description = "Maximum suggestions") @RequestParam(defaultValue = "10") int limit
    ) {
        List<String> suggestions = searchService.getSearchSuggestions(q, Math.min(limit, 20));
        return ResponseEntity.ok(ApiResponse.success("Suggestions retrieved successfully", suggestions));
    }

    /**
     * Advanced search with complex query syntax
     */
    @PostMapping("/advanced")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Advanced search", description = "Advanced search with complex criteria")
    public ResponseEntity<ApiResponse<GlobalSearchResult>> advancedSearch(
            @RequestBody AdvancedSearchRequest request,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Map<String, Object> filters = Map.of(
            "categories", request.getCategories(),
            "dateRange", request.getDateRange(),
            "pointsRange", request.getPointsRange(),
            "tags", request.getTags()
        );

        GlobalSearchResult result = searchService.globalSearch(request.getQuery(), filters, pageable);
        return ResponseEntity.ok(ApiResponse.success("Advanced search completed", result));
    }

    private Map<String, Object> buildFiltersMap(String status, Integer levelMin, Integer levelMax,
                                              Integer pointsMin, Integer pointsMax, String createdAfter, String createdBefore,
                                              String category, String difficulty, String dateFrom, String dateTo,
                                              String location, String rarity, String tags) {
        Map<String, Object> filters = new java.util.HashMap<>();

        if (status != null && !status.trim().isEmpty()) filters.put("status", status);
        if (levelMin != null) filters.put("level_min", levelMin);
        if (levelMax != null) filters.put("level_max", levelMax);
        if (pointsMin != null) filters.put("points_min", pointsMin);
        if (pointsMax != null) filters.put("points_max", pointsMax);
        if (createdAfter != null && !createdAfter.trim().isEmpty()) filters.put("created_after", createdAfter);
        if (createdBefore != null && !createdBefore.trim().isEmpty()) filters.put("created_before", createdBefore);
        if (category != null && !category.trim().isEmpty()) filters.put("category", category);
        if (difficulty != null && !difficulty.trim().isEmpty()) filters.put("difficulty", difficulty);
        if (dateFrom != null && !dateFrom.trim().isEmpty()) filters.put("date_from", dateFrom);
        if (dateTo != null && !dateTo.trim().isEmpty()) filters.put("date_to", dateTo);
        if (location != null && !location.trim().isEmpty()) filters.put("location", location);
        if (rarity != null && !rarity.trim().isEmpty()) filters.put("rarity", rarity);
        if (tags != null && !tags.trim().isEmpty()) filters.put("tags", tags);

        return filters;
    }

    /**
     * Advanced search request DTO
     */
    public static class AdvancedSearchRequest {
        private String query;
        private List<String> categories;
        private DateRange dateRange;
        private PointsRange pointsRange;
        private List<String> tags;

        // Getters and Setters
        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }

        public List<String> getCategories() { return categories; }
        public void setCategories(List<String> categories) { this.categories = categories; }

        public DateRange getDateRange() { return dateRange; }
        public void setDateRange(DateRange dateRange) { this.dateRange = dateRange; }

        public PointsRange getPointsRange() { return pointsRange; }
        public void setPointsRange(PointsRange pointsRange) { this.pointsRange = pointsRange; }

        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }

        public static class DateRange {
            private String from;
            private String to;

            public String getFrom() { return from; }
            public void setFrom(String from) { this.from = from; }

            public String getTo() { return to; }
            public void setTo(String to) { this.to = to; }
        }

        public static class PointsRange {
            private Integer min;
            private Integer max;

            public Integer getMin() { return min; }
            public void setMin(Integer min) { this.min = min; }

            public Integer getMax() { return max; }
            public void setMax(Integer max) { this.max = max; }
        }
    }
}