package com.voltx.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;

@Configuration
@Getter
public class VoltXConfiguration {

    // Application settings
    @Value("${voltx.app.name:VoltX}")
    private String applicationName;

    @Value("${voltx.app.version:1.0.0}")
    private String applicationVersion;

    @Value("${voltx.app.environment:development}")
    private String environment;

    // Security settings
    @Value("${voltx.security.jwt.expiration:86400000}")
    private Long jwtExpirationTime; // 24 hours in milliseconds

    @Value("${voltx.security.jwt.refresh-expiration:604800000}")
    private Long jwtRefreshExpirationTime; // 7 days in milliseconds

    @Value("${voltx.security.password.min-length:8}")
    private Integer passwordMinLength;

    @Value("${voltx.security.max-login-attempts:5}")
    private Integer maxLoginAttempts;

    @Value("${voltx.security.account-lockout-duration:3600000}")
    private Long accountLockoutDuration; // 1 hour in milliseconds

    // Gamification settings
    @Value("${voltx.gamification.max-level:15}")
    private Integer maxLevel;

    @Value("${voltx.gamification.max-points:100000}")
    private Integer maxAdrenalinePoints;

    @Value("${voltx.gamification.daily-bonus:10}")
    private Integer dailyLoginBonus;

    @Value("${voltx.gamification.level-up-bonus:50}")
    private Integer levelUpBonus;

    // API settings
    @Value("${voltx.api.rate-limit.requests-per-minute:60}")
    private Integer rateLimitRequestsPerMinute;

    @Value("${voltx.api.pagination.default-size:20}")
    private Integer defaultPageSize;

    @Value("${voltx.api.pagination.max-size:100}")
    private Integer maxPageSize;

    // File upload settings
    @Value("${voltx.upload.max-file-size:10485760}")
    private Long maxFileSize; // 10MB in bytes

    @Value("${voltx.upload.allowed-extensions:jpg,jpeg,png,gif}")
    private String allowedFileExtensions;

    @Value("${voltx.upload.directory:uploads}")
    private String uploadDirectory;

    // Email settings (for future implementation)
    @Value("${voltx.email.enabled:false}")
    private Boolean emailEnabled;

    @Value("${voltx.email.from-address:noreply@voltx.com}")
    private String emailFromAddress;

    @Value("${voltx.email.from-name:VoltX Team}")
    private String emailFromName;

    // Cache settings
    @Value("${voltx.cache.user-cache-duration:3600}")
    private Integer userCacheDurationSeconds; // 1 hour

    @Value("${voltx.cache.level-cache-duration:86400}")
    private Integer levelCacheDurationSeconds; // 24 hours

    // Feature flags
    @Value("${voltx.features.registration-enabled:true}")
    private Boolean registrationEnabled;

    @Value("${voltx.features.email-verification-required:false}")
    private Boolean emailVerificationRequired;

    @Value("${voltx.features.social-login-enabled:false}")
    private Boolean socialLoginEnabled;

    @Value("${voltx.features.audit-logging-enabled:true}")
    private Boolean auditLoggingEnabled;

    @Value("${voltx.features.real-time-notifications:false}")
    private Boolean realTimeNotificationsEnabled;

    // Database settings
    @Value("${voltx.database.connection-timeout:30000}")
    private Integer databaseConnectionTimeout; // 30 seconds

    @Value("${voltx.database.max-pool-size:20}")
    private Integer databaseMaxPoolSize;

    // Monitoring settings
    @Value("${voltx.monitoring.health-check-interval:60000}")
    private Long healthCheckInterval; // 1 minute

    @Value("${voltx.monitoring.metrics-enabled:true}")
    private Boolean metricsEnabled;

    // Helper methods
    public boolean isDevelopment() {
        return "development".equalsIgnoreCase(environment);
    }

    public boolean isProduction() {
        return "production".equalsIgnoreCase(environment);
    }

    public boolean isTestEnvironment() {
        return "test".equalsIgnoreCase(environment);
    }

    public String[] getAllowedFileExtensionsArray() {
        return allowedFileExtensions.split(",");
    }

    public long getMaxFileSizeInMB() {
        return maxFileSize / (1024 * 1024);
    }

    public long getJwtExpirationTimeSeconds() {
        return jwtExpirationTime / 1000;
    }

    public long getJwtRefreshExpirationTimeSeconds() {
        return jwtRefreshExpirationTime / 1000;
    }

    public long getAccountLockoutDurationMinutes() {
        return accountLockoutDuration / (1000 * 60);
    }

    // Validation methods
    public void validateConfiguration() {
        if (jwtExpirationTime <= 0) {
            throw new IllegalArgumentException("JWT expiration time must be positive");
        }

        if (passwordMinLength < 6) {
            throw new IllegalArgumentException("Password minimum length must be at least 6");
        }

        if (maxLoginAttempts < 1) {
            throw new IllegalArgumentException("Max login attempts must be at least 1");
        }

        if (maxLevel < 1 || maxLevel > 50) {
            throw new IllegalArgumentException("Max level must be between 1 and 50");
        }

        if (maxAdrenalinePoints < 1000) {
            throw new IllegalArgumentException("Max adrenaline points must be at least 1000");
        }

        if (defaultPageSize < 1 || defaultPageSize > maxPageSize) {
            throw new IllegalArgumentException("Default page size must be between 1 and max page size");
        }
    }

    // Configuration info for health checks and admin endpoints
    public String getConfigurationSummary() {
        return String.format(
            "VoltX Configuration Summary:\n" +
            "Application: %s v%s (%s)\n" +
            "Environment: %s\n" +
            "Max Level: %d\n" +
            "Max Points: %d\n" +
            "JWT Expiration: %d hours\n" +
            "Registration Enabled: %s\n" +
            "Audit Logging: %s",
            applicationName, applicationVersion, environment,
            environment,
            maxLevel,
            maxAdrenalinePoints,
            jwtExpirationTime / (1000 * 60 * 60),
            registrationEnabled,
            auditLoggingEnabled
        );
    }
}