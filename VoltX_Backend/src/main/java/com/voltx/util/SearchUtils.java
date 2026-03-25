package com.voltx.util;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Advanced search and filter utilities for building dynamic queries
 */
public class SearchUtils {

    /**
     * Search criteria class for building dynamic specifications
     */
    public static class SearchCriteria {
        private String key;
        private String operation;
        private Object value;
        private List<Object> values;

        public SearchCriteria() {}

        public SearchCriteria(String key, String operation, Object value) {
            this.key = key;
            this.operation = operation;
            this.value = value;
        }

        public SearchCriteria(String key, String operation, List<Object> values) {
            this.key = key;
            this.operation = operation;
            this.values = values;
        }

        // Getters and Setters
        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
        public String getOperation() { return operation; }
        public void setOperation(String operation) { this.operation = operation; }
        public Object getValue() { return value; }
        public void setValue(Object value) { this.value = value; }
        public List<Object> getValues() { return values; }
        public void setValues(List<Object> values) { this.values = values; }
    }

    /**
     * Generic specification builder for dynamic queries
     */
    public static class GenericSpecification<T> implements Specification<T> {
        private SearchCriteria criteria;

        public GenericSpecification(SearchCriteria criteria) {
            this.criteria = criteria;
        }

        @Override
        public Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder builder) {
            return buildPredicate(root, builder, criteria);
        }

        private Predicate buildPredicate(Root<T> root, CriteriaBuilder builder, SearchCriteria criteria) {
            Path<Object> path = getNestedPath(root, criteria.getKey());

            switch (criteria.getOperation().toLowerCase()) {
                case "eq":
                case "equal":
                    return builder.equal(path, criteria.getValue());

                case "ne":
                case "not_equal":
                    return builder.notEqual(path, criteria.getValue());

                case "gt":
                case "greater_than":
                    return builder.greaterThan(path.as(Comparable.class), (Comparable) criteria.getValue());

                case "gte":
                case "greater_than_equal":
                    return builder.greaterThanOrEqualTo(path.as(Comparable.class), (Comparable) criteria.getValue());

                case "lt":
                case "less_than":
                    return builder.lessThan(path.as(Comparable.class), (Comparable) criteria.getValue());

                case "lte":
                case "less_than_equal":
                    return builder.lessThanOrEqualTo(path.as(Comparable.class), (Comparable) criteria.getValue());

                case "like":
                case "contains":
                    return builder.like(
                            builder.lower(path.as(String.class)),
                            "%" + criteria.getValue().toString().toLowerCase() + "%"
                    );

                case "starts_with":
                    return builder.like(
                            builder.lower(path.as(String.class)),
                            criteria.getValue().toString().toLowerCase() + "%"
                    );

                case "ends_with":
                    return builder.like(
                            builder.lower(path.as(String.class)),
                            "%" + criteria.getValue().toString().toLowerCase()
                    );

                case "in":
                    return path.in(criteria.getValues());

                case "not_in":
                    return builder.not(path.in(criteria.getValues()));

                case "is_null":
                    return builder.isNull(path);

                case "is_not_null":
                    return builder.isNotNull(path);

                case "between":
                    if (criteria.getValues() != null && criteria.getValues().size() == 2) {
                        return builder.between(
                                path.as(Comparable.class),
                                (Comparable) criteria.getValues().get(0),
                                (Comparable) criteria.getValues().get(1)
                        );
                    }
                    break;

                case "date_range":
                    if (criteria.getValues() != null && criteria.getValues().size() == 2) {
                        LocalDateTime start = (LocalDateTime) criteria.getValues().get(0);
                        LocalDateTime end = (LocalDateTime) criteria.getValues().get(1);
                        return builder.between(path.as(LocalDateTime.class), start, end);
                    }
                    break;
            }

            return builder.conjunction();
        }

        private Path<Object> getNestedPath(Root<T> root, String key) {
            String[] parts = key.split("\\.");
            Path<Object> path = root.get(parts[0]);

            for (int i = 1; i < parts.length; i++) {
                if (path instanceof Join) {
                    path = ((Join<?, ?>) path).get(parts[i]);
                } else {
                    path = path.get(parts[i]);
                }
            }

            return path;
        }
    }

    /**
     * Specification builder for complex queries
     */
    public static class SpecificationBuilder<T> {
        private List<SearchCriteria> criteriaList;
        private String logicalOperator = "AND";

        public SpecificationBuilder() {
            this.criteriaList = new ArrayList<>();
        }

        public SpecificationBuilder<T> with(String key, String operation, Object value) {
            criteriaList.add(new SearchCriteria(key, operation, value));
            return this;
        }

        public SpecificationBuilder<T> with(SearchCriteria criteria) {
            criteriaList.add(criteria);
            return this;
        }

        public SpecificationBuilder<T> and() {
            this.logicalOperator = "AND";
            return this;
        }

        public SpecificationBuilder<T> or() {
            this.logicalOperator = "OR";
            return this;
        }

        public Specification<T> build() {
            if (criteriaList.isEmpty()) {
                return null;
            }

            List<Specification<T>> specs = criteriaList.stream()
                    .map(GenericSpecification<T>::new)
                    .collect(Collectors.toList());

            Specification<T> result = specs.get(0);

            for (int i = 1; i < specs.size(); i++) {
                result = logicalOperator.equals("AND")
                    ? Specification.where(result).and(specs.get(i))
                    : Specification.where(result).or(specs.get(i));
            }

            return result;
        }
    }

    /**
     * Parse search parameters from query string
     */
    public static Map<String, Object> parseSearchParams(String searchQuery) {
        Map<String, Object> params = new HashMap<>();

        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return params;
        }

        // Parse key-value pairs from search query
        // Example: "name:john AND email:@gmail.com OR status:active"
        String[] parts = searchQuery.split("\\s+(AND|OR)\\s+");

        for (String part : parts) {
            String[] keyValue = part.split(":", 2);
            if (keyValue.length == 2) {
                String key = keyValue[0].trim();
                String value = keyValue[1].trim();

                // Remove quotes if present
                if (value.startsWith("\"") && value.endsWith("\"")) {
                    value = value.substring(1, value.length() - 1);
                }

                params.put(key, value);
            }
        }

        return params;
    }

    /**
     * Create pageable with default sorting
     */
    public static Pageable createPageable(int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        return PageRequest.of(page, size, sort);
    }

    /**
     * Create pageable with multiple sort fields
     */
    public static Pageable createPageable(int page, int size, List<String> sortFields, List<String> sortDirections) {
        List<Sort.Order> orders = new ArrayList<>();

        for (int i = 0; i < sortFields.size(); i++) {
            String field = sortFields.get(i);
            String direction = i < sortDirections.size() ? sortDirections.get(i) : "ASC";
            orders.add(new Sort.Order(Sort.Direction.fromString(direction), field));
        }

        Sort sort = Sort.by(orders);
        return PageRequest.of(page, size, sort);
    }

    /**
     * Filter results based on search criteria
     */
    public static <T> List<T> filterResults(List<T> results, Map<String, Object> filters) {
        if (filters == null || filters.isEmpty()) {
            return results;
        }

        return results.stream()
                .filter(item -> matchesFilters(item, filters))
                .collect(Collectors.toList());
    }

    /**
     * Check if an object matches the given filters
     */
    private static <T> boolean matchesFilters(T item, Map<String, Object> filters) {
        // This is a simplified implementation
        // In practice, you'd use reflection or specific field matching
        return true; // Placeholder implementation
    }

    /**
     * Highlight search terms in text
     */
    public static String highlightSearchTerms(String text, List<String> searchTerms) {
        if (text == null || searchTerms == null || searchTerms.isEmpty()) {
            return text;
        }

        String result = text;
        for (String term : searchTerms) {
            if (term != null && !term.trim().isEmpty()) {
                String regex = "(?i)" + Pattern.quote(term.trim());
                result = result.replaceAll(regex, "<mark>$0</mark>");
            }
        }

        return result;
    }

    /**
     * Extract search terms from query
     */
    public static List<String> extractSearchTerms(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        return Arrays.stream(query.trim().split("\\s+"))
                .filter(term -> !term.isEmpty())
                .map(String::toLowerCase)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Calculate search relevance score
     */
    public static double calculateRelevanceScore(String text, List<String> searchTerms) {
        if (text == null || searchTerms == null || searchTerms.isEmpty()) {
            return 0.0;
        }

        String lowerText = text.toLowerCase();
        double score = 0.0;

        for (String term : searchTerms) {
            String lowerTerm = term.toLowerCase();

            // Exact match gets higher score
            if (lowerText.equals(lowerTerm)) {
                score += 10.0;
            }
            // Starts with gets medium score
            else if (lowerText.startsWith(lowerTerm)) {
                score += 5.0;
            }
            // Contains gets lower score
            else if (lowerText.contains(lowerTerm)) {
                score += 1.0;
            }
        }

        return score;
    }

    /**
     * Normalize search query
     */
    public static String normalizeQuery(String query) {
        if (query == null) {
            return "";
        }

        return query.trim()
                .toLowerCase()
                .replaceAll("\\s+", " ")
                .replaceAll("[^a-zA-Z0-9\\s]", "");
    }
}