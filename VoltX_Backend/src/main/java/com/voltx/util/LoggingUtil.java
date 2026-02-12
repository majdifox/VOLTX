package com.voltx.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Enhanced logging utility for consistent application logging
 * Provides structured logging methods for different event types
 */
@Component
public class LoggingUtil {

    private static final Logger logger = LoggerFactory.getLogger(LoggingUtil.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Log user authentication events
     */
    public static void logAuthEvent(String event, String username, String ipAddress) {
        logger.info("AUTH_EVENT | {} | User: {} | IP: {} | Time: {}",
            event, username, ipAddress, LocalDateTime.now().format(formatter));
    }

    /**
     * Log gamification events (level ups, points earned, achievements)
     */
    public static void logGamificationEvent(String username, String event, Object data) {
        logger.info("GAMIFICATION_EVENT | User: {} | Event: {} | Data: {} | Time: {}",
            username, event, data, LocalDateTime.now().format(formatter));
    }

    /**
     * Log API endpoint access
     */
    public static void logApiAccess(String endpoint, String method, String username, long duration) {
        logger.info("API_ACCESS | {} {} | User: {} | Duration: {}ms | Time: {}",
            method, endpoint, username, duration, LocalDateTime.now().format(formatter));
    }

    /**
     * Log security events (failed login attempts, suspicious activity)
     */
    public static void logSecurityEvent(String event, String details, String ipAddress) {
        logger.warn("SECURITY_EVENT | {} | Details: {} | IP: {} | Time: {}",
            event, details, ipAddress, LocalDateTime.now().format(formatter));
    }

    /**
     * Log database operations
     */
    public static void logDatabaseOperation(String operation, String table, String user, Object data) {
        logger.debug("DB_OPERATION | {} | Table: {} | User: {} | Data: {} | Time: {}",
            operation, table, user, data, LocalDateTime.now().format(formatter));
    }

    /**
     * Log performance metrics
     */
    public static void logPerformance(String operation, long duration, Object metadata) {
        if (duration > 1000) { // Log slow operations
            logger.warn("PERFORMANCE | Operation: {} | Duration: {}ms | Metadata: {} | Time: {}",
                operation, duration, metadata, LocalDateTime.now().format(formatter));
        } else {
            logger.debug("PERFORMANCE | Operation: {} | Duration: {}ms | Time: {}",
                operation, duration, LocalDateTime.now().format(formatter));
        }
    }

    /**
     * Log business logic errors
     */
    public static void logBusinessError(String operation, String error, String username) {
        logger.error("BUSINESS_ERROR | Operation: {} | Error: {} | User: {} | Time: {}",
            operation, error, username, LocalDateTime.now().format(formatter));
    }

    /**
     * Log system events (startup, configuration changes)
     */
    public static void logSystemEvent(String event, String details) {
        logger.info("SYSTEM_EVENT | {} | Details: {} | Time: {}",
            event, details, LocalDateTime.now().format(formatter));
    }

    /**
     * Log WebSocket events
     */
    public static void logWebSocketEvent(String event, String username, String sessionId) {
        logger.info("WEBSOCKET_EVENT | {} | User: {} | Session: {} | Time: {}",
            event, username, sessionId, LocalDateTime.now().format(formatter));
    }

    /**
     * Log validation errors
     */
    public static void logValidationError(String field, String error, Object value, String username) {
        logger.warn("VALIDATION_ERROR | Field: {} | Error: {} | Value: {} | User: {} | Time: {}",
            field, error, value, username, LocalDateTime.now().format(formatter));
    }

    /**
     * Log external service calls
     */
    public static void logExternalServiceCall(String service, String operation, long duration, boolean success) {
        String status = success ? "SUCCESS" : "FAILURE";
        logger.info("EXTERNAL_SERVICE | Service: {} | Operation: {} | Status: {} | Duration: {}ms | Time: {}",
            service, operation, status, duration, LocalDateTime.now().format(formatter));
    }

    /**
     * Structured logging for audit trail
     */
    public static void logAuditEvent(String action, String resource, String username, Object oldValue, Object newValue) {
        logger.info("AUDIT | Action: {} | Resource: {} | User: {} | Old: {} | New: {} | Time: {}",
            action, resource, username, oldValue, newValue, LocalDateTime.now().format(formatter));
    }
}
