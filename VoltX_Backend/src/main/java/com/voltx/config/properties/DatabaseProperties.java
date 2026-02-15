package com.voltx.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.Duration;

/**
 * Database-specific configuration properties
 */
@Component
@ConfigurationProperties(prefix = "app.database")
@Validated
public class DatabaseProperties {

    private boolean seedData = false;
    private boolean recreateSchema = false;

    @Valid
    @NotNull
    private Backup backup = new Backup();

    @Valid
    @NotNull
    private Health health = new Health();

    @Valid
    @NotNull
    private Performance performance = new Performance();

    // Getters and Setters
    public boolean isSeedData() { return seedData; }
    public void setSeedData(boolean seedData) { this.seedData = seedData; }

    public boolean isRecreateSchema() { return recreateSchema; }
    public void setRecreateSchema(boolean recreateSchema) { this.recreateSchema = recreateSchema; }

    public Backup getBackup() { return backup; }
    public void setBackup(Backup backup) { this.backup = backup; }

    public Health getHealth() { return health; }
    public void setHealth(Health health) { this.health = health; }

    public Performance getPerformance() { return performance; }
    public void setPerformance(Performance performance) { this.performance = performance; }

    public static class Backup {
        private boolean enabled = true;
        private String schedule = "0 2 * * *"; // Daily at 2 AM

        @Min(1)
        @Max(365)
        private int retentionDays = 30;

        @Valid
        @NotNull
        private S3 s3 = new S3();

        // Getters and Setters
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }

        public String getSchedule() { return schedule; }
        public void setSchedule(String schedule) { this.schedule = schedule; }

        public int getRetentionDays() { return retentionDays; }
        public void setRetentionDays(int retentionDays) { this.retentionDays = retentionDays; }

        public S3 getS3() { return s3; }
        public void setS3(S3 s3) { this.s3 = s3; }

        public static class S3 {
            private String bucket;
            private String region;
            private String accessKey;
            private String secretKey;

            public String getBucket() { return bucket; }
            public void setBucket(String bucket) { this.bucket = bucket; }

            public String getRegion() { return region; }
            public void setRegion(String region) { this.region = region; }

            public String getAccessKey() { return accessKey; }
            public void setAccessKey(String accessKey) { this.accessKey = accessKey; }

            public String getSecretKey() { return secretKey; }
            public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
        }
    }

    public static class Health {
        @NotNull
        private String diskSpaceThreshold = "1GB";

        @NotNull
        private Duration timeout = Duration.ofSeconds(5);

        // Getters and Setters
        public String getDiskSpaceThreshold() { return diskSpaceThreshold; }
        public void setDiskSpaceThreshold(String diskSpaceThreshold) { this.diskSpaceThreshold = diskSpaceThreshold; }

        public Duration getTimeout() { return timeout; }
        public void setTimeout(Duration timeout) { this.timeout = timeout; }
    }

    public static class Performance {
        @Valid
        @NotNull
        private ConnectionPool connectionPool = new ConnectionPool();

        @Valid
        @NotNull
        private Query query = new Query();

        public ConnectionPool getConnectionPool() { return connectionPool; }
        public void setConnectionPool(ConnectionPool connectionPool) { this.connectionPool = connectionPool; }

        public Query getQuery() { return query; }
        public void setQuery(Query query) { this.query = query; }

        public static class ConnectionPool {
            @Min(1)
            @Max(100)
            private int minimumIdle = 5;

            @Min(1)
            @Max(200)
            private int maximumPoolSize = 20;

            @NotNull
            private Duration connectionTimeout = Duration.ofSeconds(20);

            @NotNull
            private Duration idleTimeout = Duration.ofMinutes(10);

            @NotNull
            private Duration maxLifetime = Duration.ofMinutes(20);

            @NotNull
            private Duration leakDetectionThreshold = Duration.ofMinutes(1);

            // Getters and Setters
            public int getMinimumIdle() { return minimumIdle; }
            public void setMinimumIdle(int minimumIdle) { this.minimumIdle = minimumIdle; }

            public int getMaximumPoolSize() { return maximumPoolSize; }
            public void setMaximumPoolSize(int maximumPoolSize) { this.maximumPoolSize = maximumPoolSize; }

            public Duration getConnectionTimeout() { return connectionTimeout; }
            public void setConnectionTimeout(Duration connectionTimeout) { this.connectionTimeout = connectionTimeout; }

            public Duration getIdleTimeout() { return idleTimeout; }
            public void setIdleTimeout(Duration idleTimeout) { this.idleTimeout = idleTimeout; }

            public Duration getMaxLifetime() { return maxLifetime; }
            public void setMaxLifetime(Duration maxLifetime) { this.maxLifetime = maxLifetime; }

            public Duration getLeakDetectionThreshold() { return leakDetectionThreshold; }
            public void setLeakDetectionThreshold(Duration leakDetectionThreshold) { this.leakDetectionThreshold = leakDetectionThreshold; }
        }

        public static class Query {
            @Min(1)
            @Max(100)
            private int batchSize = 20;

            private boolean orderInserts = true;
            private boolean orderUpdates = true;
            private boolean enableStatistics = false;
            private boolean enableSecondLevelCache = true;

            // Getters and Setters
            public int getBatchSize() { return batchSize; }
            public void setBatchSize(int batchSize) { this.batchSize = batchSize; }

            public boolean isOrderInserts() { return orderInserts; }
            public void setOrderInserts(boolean orderInserts) { this.orderInserts = orderInserts; }

            public boolean isOrderUpdates() { return orderUpdates; }
            public void setOrderUpdates(boolean orderUpdates) { this.orderUpdates = orderUpdates; }

            public boolean isEnableStatistics() { return enableStatistics; }
            public void setEnableStatistics(boolean enableStatistics) { this.enableStatistics = enableStatistics; }

            public boolean isEnableSecondLevelCache() { return enableSecondLevelCache; }
            public void setEnableSecondLevelCache(boolean enableSecondLevelCache) { this.enableSecondLevelCache = enableSecondLevelCache; }
        }
    }
}