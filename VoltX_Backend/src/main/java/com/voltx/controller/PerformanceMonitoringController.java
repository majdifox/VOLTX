package com.voltx.controller;

import com.voltx.service.PerformanceMonitoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for performance monitoring and system health
 */
@RestController
@RequestMapping("/api/monitoring")
@PreAuthorize("hasRole('ADMIN')")
public class PerformanceMonitoringController {

    @Autowired
    private PerformanceMonitoringService performanceMonitoringService;

    /**
     * Get overall system health metrics
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealthMetrics() {
        try {
            Map<String, Object> health = performanceMonitoringService.getHealthMetrics();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", health
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to retrieve health metrics: " + e.getMessage()
            ));
        }
    }

    /**
     * Get metrics for specific endpoint
     */
    @GetMapping("/endpoints/{method}/{endpoint}")
    public ResponseEntity<Map<String, Object>> getEndpointMetrics(
        @PathVariable String method,
        @PathVariable String endpoint
    ) {
        try {
            Map<String, Object> metrics = performanceMonitoringService.getEndpointMetrics(
                "/" + endpoint, method.toUpperCase()
            );
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", metrics
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to retrieve endpoint metrics: " + e.getMessage()
            ));
        }
    }

    /**
     * Get endpoint analysis (top, slowest, most problematic)
     */
    @GetMapping("/analysis")
    public ResponseEntity<Map<String, Object>> getEndpointAnalysis() {
        try {
            Map<String, Object> analysis = performanceMonitoringService.getEndpointAnalysis();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", analysis
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to retrieve endpoint analysis: " + e.getMessage()
            ));
        }
    }

    /**
     * Get performance recommendations
     */
    @GetMapping("/recommendations")
    public ResponseEntity<Map<String, Object>> getRecommendations() {
        try {
            List<String> recommendations = performanceMonitoringService.getPerformanceRecommendations();
            boolean systemUnderLoad = performanceMonitoringService.isSystemUnderLoad();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "recommendations", recommendations,
                    "systemUnderLoad", systemUnderLoad,
                    "priority", systemUnderLoad ? "high" : "normal"
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to retrieve recommendations: " + e.getMessage()
            ));
        }
    }

    /**
     * Reset performance metrics (admin only)
     */
    @PostMapping("/reset")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> resetMetrics() {
        try {
            performanceMonitoringService.resetMetrics();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Performance metrics have been reset"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to reset metrics: " + e.getMessage()
            ));
        }
    }

    /**
     * Get system status summary
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        try {
            Map<String, Object> health = performanceMonitoringService.getHealthMetrics();
            Map<String, Object> analysis = performanceMonitoringService.getEndpointAnalysis();
            List<String> recommendations = performanceMonitoringService.getPerformanceRecommendations();

            // Extract key metrics
            Map<String, Object> memory = (Map<String, Object>) health.get("memory");
            Map<String, Object> requests = (Map<String, Object>) health.get("requests");

            double memoryUsage = (Double) memory.get("usagePercent");
            double errorRate = (Double) requests.get("errorRate");
            boolean isUnderLoad = performanceMonitoringService.isSystemUnderLoad();

            // Determine overall status
            String status = "healthy";
            if (memoryUsage > 90 || errorRate > 10) {
                status = "critical";
            } else if (memoryUsage > 80 || errorRate > 5 || isUnderLoad) {
                status = "warning";
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "status", status,
                    "memoryUsage", memoryUsage,
                    "errorRate", errorRate,
                    "underLoad", isUnderLoad,
                    "uptime", health.get("uptime"),
                    "totalEndpoints", analysis.get("totalEndpoints"),
                    "recommendationCount", recommendations.size(),
                    "timestamp", health.get("timestamp")
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "status", "error",
                    "message", "Unable to determine system status: " + e.getMessage()
                )
            ));
        }
    }
}