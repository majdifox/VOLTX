package com.voltx.service;

import com.voltx.util.LoggingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.List;
import java.util.ArrayList;

/**
 * Service for monitoring application performance and health metrics
 */
@Service
public class PerformanceMonitoringService {

    private final Map<String, AtomicLong> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> errorCounts = new ConcurrentHashMap<>();
    private final Map<String, List<Long>> responseTimes = new ConcurrentHashMap<>();
    private final Map<String, Long> lastRequestTimes = new ConcurrentHashMap<>();

    @Autowired
    private UserService userService;

    /**
     * Record API endpoint access metrics
     */
    public void recordApiAccess(String endpoint, String method, String username, long duration) {
        String key = method + " " + endpoint;

        // Increment request count
        requestCounts.computeIfAbsent(key, k -> new AtomicLong(0)).incrementAndGet();

        // Record response time
        responseTimes.computeIfAbsent(key, k -> new ArrayList<>()).add(duration);

        // Keep only last 100 response times to prevent memory issues
        List<Long> times = responseTimes.get(key);
        if (times.size() > 100) {
            times.remove(0);
        }

        // Update last request time
        lastRequestTimes.put(key, System.currentTimeMillis());

        // Log the access
        LoggingUtil.logApiAccess(endpoint, method, username, duration);

        // Alert on slow requests
        if (duration > 5000) { // 5 seconds
            LoggingUtil.logPerformance("SLOW_REQUEST", duration,
                Map.of("endpoint", endpoint, "method", method, "user", username));
        }
    }

    /**
     * Record error occurrence
     */
    public void recordError(String endpoint, String method, String errorType, String username) {
        String key = method + " " + endpoint;
        String errorKey = key + "_ERROR";

        errorCounts.computeIfAbsent(errorKey, k -> new AtomicLong(0)).incrementAndGet();

        LoggingUtil.logBusinessError("API_ERROR",
            String.format("%s on %s: %s", method, endpoint, errorType), username);
    }

    /**
     * Get performance metrics for specific endpoint
     */
    public Map<String, Object> getEndpointMetrics(String endpoint, String method) {
        String key = method + " " + endpoint;

        long requestCount = requestCounts.getOrDefault(key, new AtomicLong(0)).get();
        long errorCount = errorCounts.getOrDefault(key + "_ERROR", new AtomicLong(0)).get();
        List<Long> times = responseTimes.getOrDefault(key, new ArrayList<>());

        double errorRate = requestCount > 0 ? (double) errorCount / requestCount * 100 : 0.0;
        double avgResponseTime = times.isEmpty() ? 0.0 : times.stream().mapToLong(Long::longValue).average().orElse(0.0);
        long maxResponseTime = times.isEmpty() ? 0 : times.stream().mapToLong(Long::longValue).max().orElse(0);
        long minResponseTime = times.isEmpty() ? 0 : times.stream().mapToLong(Long::longValue).min().orElse(0);

        return Map.of(
            "endpoint", endpoint,
            "method", method,
            "requestCount", requestCount,
            "errorCount", errorCount,
            "errorRate", errorRate,
            "avgResponseTime", avgResponseTime,
            "maxResponseTime", maxResponseTime,
            "minResponseTime", minResponseTime,
            "lastAccess", lastRequestTimes.get(key),
            "responseTimeSamples", times.size()
        );
    }

    /**
     * Get overall application health metrics
     */
    public Map<String, Object> getHealthMetrics() {
        Runtime runtime = Runtime.getRuntime();

        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        long maxMemory = runtime.maxMemory();

        double memoryUsagePercent = (double) usedMemory / maxMemory * 100;

        // Count active users (logged in within last hour)
        long activeUsers = userService.countActiveUsersInLastHour();

        // Calculate total requests and errors
        long totalRequests = requestCounts.values().stream().mapToLong(AtomicLong::get).sum();
        long totalErrors = errorCounts.values().stream().mapToLong(AtomicLong::get).sum();
        double overallErrorRate = totalRequests > 0 ? (double) totalErrors / totalRequests * 100 : 0.0;

        return Map.of(
            "timestamp", LocalDateTime.now(),
            "uptime", getApplicationUptime(),
            "memory", Map.of(
                "used", usedMemory,
                "free", freeMemory,
                "total", totalMemory,
                "max", maxMemory,
                "usagePercent", memoryUsagePercent
            ),
            "requests", Map.of(
                "total", totalRequests,
                "errors", totalErrors,
                "errorRate", overallErrorRate
            ),
            "users", Map.of(
                "active", activeUsers,
                "total", userService.getTotalUserCount()
            ),
            "system", Map.of(
                "availableProcessors", runtime.availableProcessors(),
                "javaVersion", System.getProperty("java.version"),
                "osName", System.getProperty("os.name")
            )
        );
    }

    /**
     * Get top performing and problematic endpoints
     */
    public Map<String, Object> getEndpointAnalysis() {
        Map<String, Long> endpointRequests = new java.util.HashMap<>();
        Map<String, Double> endpointErrorRates = new java.util.HashMap<>();
        Map<String, Double> endpointAvgTimes = new java.util.HashMap<>();

        // Calculate metrics for each endpoint
        requestCounts.forEach((key, count) -> {
            if (!key.endsWith("_ERROR")) {
                long requests = count.get();
                long errors = errorCounts.getOrDefault(key + "_ERROR", new AtomicLong(0)).get();
                List<Long> times = responseTimes.getOrDefault(key, new ArrayList<>());

                endpointRequests.put(key, requests);
                endpointErrorRates.put(key, requests > 0 ? (double) errors / requests * 100 : 0.0);
                endpointAvgTimes.put(key, times.isEmpty() ? 0.0 :
                    times.stream().mapToLong(Long::longValue).average().orElse(0.0));
            }
        });

        // Find top endpoints by request count
        List<Map<String, Object>> topEndpoints = endpointRequests.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(10)
            .map(entry -> Map.<String, Object>of(
                "endpoint", entry.getKey(),
                "requests", entry.getValue(),
                "errorRate", endpointErrorRates.getOrDefault(entry.getKey(), 0.0),
                "avgResponseTime", endpointAvgTimes.getOrDefault(entry.getKey(), 0.0)
            ))
            .toList();

        // Find slowest endpoints
        List<Map<String, Object>> slowestEndpoints = endpointAvgTimes.entrySet().stream()
            .filter(entry -> entry.getValue() > 0)
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(10)
            .map(entry -> Map.<String, Object>of(
                "endpoint", entry.getKey(),
                "avgResponseTime", entry.getValue(),
                "requests", endpointRequests.getOrDefault(entry.getKey(), 0L),
                "errorRate", endpointErrorRates.getOrDefault(entry.getKey(), 0.0)
            ))
            .toList();

        // Find endpoints with highest error rates
        List<Map<String, Object>> problematicEndpoints = endpointErrorRates.entrySet().stream()
            .filter(entry -> entry.getValue() > 0)
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(10)
            .map(entry -> Map.<String, Object>of(
                "endpoint", entry.getKey(),
                "errorRate", entry.getValue(),
                "requests", endpointRequests.getOrDefault(entry.getKey(), 0L),
                "avgResponseTime", endpointAvgTimes.getOrDefault(entry.getKey(), 0.0)
            ))
            .toList();

        return Map.of(
            "topEndpoints", topEndpoints,
            "slowestEndpoints", slowestEndpoints,
            "problematicEndpoints", problematicEndpoints,
            "totalEndpoints", requestCounts.size(),
            "analyzedAt", LocalDateTime.now()
        );
    }

    /**
     * Reset metrics (for testing or periodic cleanup)
     */
    public void resetMetrics() {
        requestCounts.clear();
        errorCounts.clear();
        responseTimes.clear();
        lastRequestTimes.clear();

        LoggingUtil.logSystemEvent("METRICS_RESET", "Performance metrics cleared");
    }

    /**
     * Get application uptime in milliseconds
     */
    private long getApplicationUptime() {
        return java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime();
    }

    /**
     * Check if system is under load
     */
    public boolean isSystemUnderLoad() {
        Map<String, Object> health = getHealthMetrics();
        Map<String, Object> memory = (Map<String, Object>) health.get("memory");
        double memoryUsage = (Double) memory.get("usagePercent");

        // Consider system under load if memory usage > 80%
        return memoryUsage > 80.0;
    }

    /**
     * Get performance recommendations based on current metrics
     */
    public List<String> getPerformanceRecommendations() {
        List<String> recommendations = new ArrayList<>();

        Map<String, Object> health = getHealthMetrics();
        Map<String, Object> memory = (Map<String, Object>) health.get("memory");
        Map<String, Object> requests = (Map<String, Object>) health.get("requests");

        double memoryUsage = (Double) memory.get("usagePercent");
        double errorRate = (Double) requests.get("errorRate");

        if (memoryUsage > 80) {
            recommendations.add("Memory usage is high (" + String.format("%.1f", memoryUsage) + "%). Consider increasing heap size or optimizing memory usage.");
        }

        if (errorRate > 5.0) {
            recommendations.add("Error rate is elevated (" + String.format("%.1f", errorRate) + "%). Review recent error logs and fix critical issues.");
        }

        Map<String, Object> analysis = getEndpointAnalysis();
        List<Map<String, Object>> slowEndpoints = (List<Map<String, Object>>) analysis.get("slowestEndpoints");

        if (!slowEndpoints.isEmpty()) {
            Map<String, Object> slowest = slowEndpoints.get(0);
            double avgTime = (Double) slowest.get("avgResponseTime");
            if (avgTime > 2000) {
                recommendations.add("Endpoint '" + slowest.get("endpoint") + "' is slow (" +
                    String.format("%.0f", avgTime) + "ms avg). Consider optimization or caching.");
            }
        }

        if (recommendations.isEmpty()) {
            recommendations.add("System is performing well. No immediate recommendations.");
        }

        return recommendations;
    }
}