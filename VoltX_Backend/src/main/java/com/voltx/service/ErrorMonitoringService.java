package com.voltx.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service for monitoring, alerting, and analyzing application errors
 */
@Service
public class ErrorMonitoringService {

    private static final Logger logger = LoggerFactory.getLogger(ErrorMonitoringService.class);

    private final MeterRegistry meterRegistry;
    private final Counter totalErrorsCounter;
    private final Counter criticalErrorsCounter;
    private final Timer errorProcessingTimer;

    // Error tracking
    private final Map<String, ErrorStatistics> errorStats = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger> errorFrequency = new ConcurrentHashMap<>();
    private final AtomicLong lastAlertTime = new AtomicLong(0);

    // Configuration
    @Value("${app.monitoring.error.alert-threshold:10}")
    private int errorAlertThreshold;

    @Value("${app.monitoring.error.alert-interval-minutes:5}")
    private int alertIntervalMinutes;

    @Value("${app.monitoring.error.critical-threshold:5}")
    private int criticalErrorThreshold;

    @Autowired
    public ErrorMonitoringService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.totalErrorsCounter = Counter.builder("voltx.errors.total")
                .description("Total number of errors")
                .register(meterRegistry);
        this.criticalErrorsCounter = Counter.builder("voltx.errors.critical")
                .description("Total number of critical errors")
                .register(meterRegistry);
        this.errorProcessingTimer = Timer.builder("voltx.error.processing.time")
                .description("Time spent processing errors")
                .register(meterRegistry);
    }

    /**
     * Record an error occurrence
     */
    @Async
    public void recordError(Exception exception, String context, String userId, ErrorSeverity severity) {
        Timer.Sample sample = Timer.start(meterRegistry);

        try {
            String errorType = exception.getClass().getSimpleName();
            String errorKey = generateErrorKey(errorType, context);

            // Update statistics
            ErrorStatistics stats = errorStats.computeIfAbsent(errorKey, k -> new ErrorStatistics());
            stats.incrementCount();
            stats.setLastOccurrence(LocalDateTime.now());
            stats.setLastMessage(exception.getMessage());
            stats.setLastUserId(userId);

            // Update frequency tracking
            errorFrequency.computeIfAbsent(errorType, k -> new AtomicInteger(0)).incrementAndGet();

            // Record metrics
            totalErrorsCounter.increment("type", errorType, "severity", severity.name().toLowerCase());

            if (severity == ErrorSeverity.CRITICAL || severity == ErrorSeverity.HIGH) {
                criticalErrorsCounter.increment("type", errorType);
            }

            // Check for alert conditions
            checkAlertConditions(errorType, stats, severity);

            // Log structured error information
            logStructuredError(exception, context, userId, severity, stats);

        } finally {
            sample.stop(errorProcessingTimer);
        }
    }

    /**
     * Record error with additional metadata
     */
    @Async
    public void recordErrorWithMetadata(Exception exception, String context, String userId,
                                      ErrorSeverity severity, Map<String, Object> metadata) {
        recordError(exception, context, userId, severity);

        // Log metadata for debugging
        if (metadata != null && !metadata.isEmpty()) {
            logger.debug("Error metadata for {}: {}", exception.getClass().getSimpleName(), metadata);
        }
    }

    /**
     * Get error statistics for a specific error type
     */
    public ErrorStatistics getErrorStatistics(String errorType, String context) {
        String errorKey = generateErrorKey(errorType, context);
        return errorStats.getOrDefault(errorKey, new ErrorStatistics());
    }

    /**
     * Get error frequency for the last hour
     */
    public int getErrorFrequency(String errorType) {
        return errorFrequency.getOrDefault(errorType, new AtomicInteger(0)).get();
    }

    /**
     * Get all error statistics
     */
    public Map<String, ErrorStatistics> getAllErrorStatistics() {
        return Map.copyOf(errorStats);
    }

    /**
     * Clear old error statistics (cleanup)
     */
    public void cleanupOldStatistics(int daysOld) {
        LocalDateTime cutoff = LocalDateTime.now().minus(daysOld, ChronoUnit.DAYS);
        errorStats.entrySet().removeIf(entry ->
                entry.getValue().getLastOccurrence().isBefore(cutoff)
        );
    }

    /**
     * Reset error frequency counters
     */
    public void resetFrequencyCounters() {
        errorFrequency.clear();
    }

    private void checkAlertConditions(String errorType, ErrorStatistics stats, ErrorSeverity severity) {
        long currentTime = System.currentTimeMillis();
        long lastAlert = lastAlertTime.get();

        // Check if enough time has passed since last alert
        if (currentTime - lastAlert < alertIntervalMinutes * 60 * 1000) {
            return;
        }

        boolean shouldAlert = false;

        // Alert on critical errors
        if (severity == ErrorSeverity.CRITICAL) {
            shouldAlert = true;
        }
        // Alert on high frequency of errors
        else if (stats.getCount() >= errorAlertThreshold) {
            shouldAlert = true;
        }
        // Alert on repeated critical error types
        else if (getErrorFrequency(errorType) >= criticalErrorThreshold) {
            shouldAlert = true;
        }

        if (shouldAlert && lastAlertTime.compareAndSet(lastAlert, currentTime)) {
            sendErrorAlert(errorType, stats, severity);
        }
    }

    @Async
    protected void sendErrorAlert(String errorType, ErrorStatistics stats, ErrorSeverity severity) {
        logger.error("ERROR ALERT: {} - Count: {}, Last occurrence: {}, Severity: {}",
                errorType, stats.getCount(), stats.getLastOccurrence(), severity);

        // Here you would integrate with alerting systems like:
        // - Slack notifications
        // - Email alerts
        // - PagerDuty
        // - Custom webhook

        // Example: Send to external monitoring service
        // alertingService.sendAlert(errorType, stats, severity);
    }

    private void logStructuredError(Exception exception, String context, String userId,
                                  ErrorSeverity severity, ErrorStatistics stats) {
        logger.error("Structured error log - Type: {}, Context: {}, User: {}, Severity: {}, " +
                     "Occurrences: {}, Message: {}",
                exception.getClass().getSimpleName(),
                context,
                userId,
                severity,
                stats.getCount(),
                exception.getMessage(),
                exception);
    }

    private String generateErrorKey(String errorType, String context) {
        return errorType + ":" + (context != null ? context : "unknown");
    }

    /**
     * Error severity levels
     */
    public enum ErrorSeverity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    /**
     * Error statistics tracking
     */
    public static class ErrorStatistics {
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile LocalDateTime firstOccurrence;
        private volatile LocalDateTime lastOccurrence;
        private volatile String lastMessage;
        private volatile String lastUserId;

        public ErrorStatistics() {
            this.firstOccurrence = LocalDateTime.now();
            this.lastOccurrence = LocalDateTime.now();
        }

        public void incrementCount() {
            count.incrementAndGet();
        }

        public int getCount() {
            return count.get();
        }

        public LocalDateTime getFirstOccurrence() {
            return firstOccurrence;
        }

        public LocalDateTime getLastOccurrence() {
            return lastOccurrence;
        }

        public void setLastOccurrence(LocalDateTime lastOccurrence) {
            this.lastOccurrence = lastOccurrence;
        }

        public String getLastMessage() {
            return lastMessage;
        }

        public void setLastMessage(String lastMessage) {
            this.lastMessage = lastMessage;
        }

        public String getLastUserId() {
            return lastUserId;
        }

        public void setLastUserId(String lastUserId) {
            this.lastUserId = lastUserId;
        }

        public long getMinutesSinceFirst() {
            return ChronoUnit.MINUTES.between(firstOccurrence, LocalDateTime.now());
        }

        public long getMinutesSinceLast() {
            return ChronoUnit.MINUTES.between(lastOccurrence, LocalDateTime.now());
        }
    }
}