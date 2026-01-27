package com.voltx.controller;

import com.voltx.config.VoltXConfiguration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final VoltXConfiguration configuration;

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();

        // Basic health status
        health.put("status", "UP");
        health.put("timestamp", Instant.now().toString());
        health.put("version", configuration.getApplicationVersion());
        health.put("environment", configuration.getEnvironment());

        // Application info
        Map<String, Object> application = new HashMap<>();
        application.put("name", configuration.getApplicationName());
        application.put("version", configuration.getApplicationVersion());
        application.put("environment", configuration.getEnvironment());
        health.put("application", application);

        // System info
        Map<String, Object> system = new HashMap<>();
        Runtime runtime = Runtime.getRuntime();
        system.put("javaVersion", System.getProperty("java.version"));
        system.put("totalMemory", runtime.totalMemory());
        system.put("freeMemory", runtime.freeMemory());
        system.put("maxMemory", runtime.maxMemory());
        system.put("availableProcessors", runtime.availableProcessors());
        health.put("system", system);

        // Database status (mock)
        Map<String, Object> database = new HashMap<>();
        database.put("status", "UP");
        database.put("connectionPool", "HEALTHY");
        database.put("responseTime", "12ms");
        health.put("database", database);

        return ResponseEntity.ok(health);
    }

    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> readinessCheck() {
        Map<String, Object> ready = new HashMap<>();
        ready.put("status", "READY");
        ready.put("timestamp", Instant.now().toString());
        ready.put("checks", Map.of(
            "database", "READY",
            "configuration", "READY",
            "services", "READY"
        ));
        return ResponseEntity.ok(ready);
    }

    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> livenessCheck() {
        Map<String, Object> live = new HashMap<>();
        live.put("status", "ALIVE");
        live.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(live);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> applicationInfo() {
        Map<String, Object> info = new HashMap<>();

        // Application details
        info.put("name", configuration.getApplicationName());
        info.put("version", configuration.getApplicationVersion());
        info.put("environment", configuration.getEnvironment());
        info.put("description", "VoltX - Extreme Sports Adventure Platform");

        // Feature flags
        Map<String, Object> features = new HashMap<>();
        features.put("registrationEnabled", configuration.getRegistrationEnabled());
        features.put("emailVerificationRequired", configuration.getEmailVerificationRequired());
        features.put("socialLoginEnabled", configuration.getSocialLoginEnabled());
        features.put("auditLoggingEnabled", configuration.getAuditLoggingEnabled());
        features.put("realTimeNotifications", configuration.getRealTimeNotificationsEnabled());
        info.put("features", features);

        // Configuration summary
        Map<String, Object> config = new HashMap<>();
        config.put("maxLevel", configuration.getMaxLevel());
        config.put("maxAdrenalinePoints", configuration.getMaxAdrenalinePoints());
        config.put("defaultPageSize", configuration.getDefaultPageSize());
        config.put("maxPageSize", configuration.getMaxPageSize());
        config.put("maxFileSize", configuration.getMaxFileSizeInMB() + "MB");
        info.put("configuration", config);

        return ResponseEntity.ok(info);
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> basicMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // System metrics
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;

        Map<String, Object> memory = new HashMap<>();
        memory.put("total", totalMemory);
        memory.put("free", freeMemory);
        memory.put("used", usedMemory);
        memory.put("usagePercentage", Math.round((double) usedMemory / totalMemory * 100));
        metrics.put("memory", memory);

        // JVM metrics
        Map<String, Object> jvm = new HashMap<>();
        jvm.put("version", System.getProperty("java.version"));
        jvm.put("vendor", System.getProperty("java.vendor"));
        jvm.put("uptime", java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime());
        jvm.put("processors", runtime.availableProcessors());
        metrics.put("jvm", jvm);

        // Application metrics (mock data)
        Map<String, Object> application = new HashMap<>();
        application.put("totalUsers", 1250);
        application.put("activeUsers", 340);
        application.put("totalEvents", 89);
        application.put("totalPoints", 1500000);
        application.put("averageLevel", 4.2);
        metrics.put("application", application);

        metrics.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(metrics);
    }
}