package com.voltx.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditService {

    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

    // Simple in-memory audit logging for now (in production, use database)
    private final Map<String, Object> auditContext = new HashMap<>();

    public void logUserAction(Long userId, String action, String resource) {
        logUserAction(userId, action, resource, null, null);
    }

    public void logUserAction(Long userId, String action, String resource, String details) {
        logUserAction(userId, action, resource, details, null);
    }

    public void logUserAction(Long userId, String action, String resource, String details, Map<String, Object> metadata) {
        try {
            Map<String, Object> auditEntry = new HashMap<>();
            auditEntry.put("userId", userId);
            auditEntry.put("action", action);
            auditEntry.put("resource", resource);
            auditEntry.put("timestamp", java.time.Instant.now().toString());
            auditEntry.put("ipAddress", getCurrentIpAddress());
            auditEntry.put("userAgent", getCurrentUserAgent());

            if (details != null) {
                auditEntry.put("details", details);
            }

            if (metadata != null) {
                auditEntry.put("metadata", metadata);
            }

            // Log the audit entry
            logger.info("AUDIT: {}", auditEntry);

            // In production, save to database
            // auditRepository.save(new AuditEntry(auditEntry));

        } catch (Exception e) {
            logger.error("Failed to log audit entry", e);
        }
    }

    public void logSecurityEvent(String eventType, String userId, String details) {
        logSecurityEvent(eventType, userId, details, null);
    }

    public void logSecurityEvent(String eventType, String userId, String details, Map<String, Object> context) {
        try {
            Map<String, Object> securityEntry = new HashMap<>();
            securityEntry.put("eventType", eventType);
            securityEntry.put("userId", userId);
            securityEntry.put("details", details);
            securityEntry.put("timestamp", java.time.Instant.now().toString());
            securityEntry.put("severity", getSeverityLevel(eventType));
            securityEntry.put("ipAddress", getCurrentIpAddress());

            if (context != null) {
                securityEntry.put("context", context);
            }

            // Log security events with higher priority
            logger.warn("SECURITY_EVENT: {}", securityEntry);

            // In critical cases, you might want to send alerts
            if (isCriticalSecurityEvent(eventType)) {
                // sendSecurityAlert(securityEntry);
            }

        } catch (Exception e) {
            logger.error("Failed to log security event", e);
        }
    }

    public void logSystemEvent(String eventType, String component, String message) {
        logSystemEvent(eventType, component, message, null);
    }

    public void logSystemEvent(String eventType, String component, String message, Map<String, Object> data) {
        try {
            Map<String, Object> systemEntry = new HashMap<>();
            systemEntry.put("eventType", eventType);
            systemEntry.put("component", component);
            systemEntry.put("message", message);
            systemEntry.put("timestamp", java.time.Instant.now().toString());
            systemEntry.put("serverInfo", getServerInfo());

            if (data != null) {
                systemEntry.put("data", data);
            }

            logger.info("SYSTEM_EVENT: {}", systemEntry);

        } catch (Exception e) {
            logger.error("Failed to log system event", e);
        }
    }

    // Common audit actions
    public static class AuditActions {
        public static final String LOGIN = "LOGIN";
        public static final String LOGOUT = "LOGOUT";
        public static final String REGISTER = "REGISTER";
        public static final String PROFILE_UPDATE = "PROFILE_UPDATE";
        public static final String PASSWORD_CHANGE = "PASSWORD_CHANGE";
        public static final String ROLE_CHANGE = "ROLE_CHANGE";
        public static final String STATUS_CHANGE = "STATUS_CHANGE";
        public static final String POINTS_ADDED = "POINTS_ADDED";
        public static final String LEVEL_UP = "LEVEL_UP";
        public static final String DATA_EXPORT = "DATA_EXPORT";
        public static final String ADMIN_ACTION = "ADMIN_ACTION";
    }

    // Common security events
    public static class SecurityEvents {
        public static final String FAILED_LOGIN = "FAILED_LOGIN";
        public static final String ACCOUNT_LOCKED = "ACCOUNT_LOCKED";
        public static final String SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY";
        public static final String UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS";
        public static final String DATA_BREACH_ATTEMPT = "DATA_BREACH_ATTEMPT";
        public static final String PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION";
    }

    // Common system events
    public static class SystemEvents {
        public static final String APPLICATION_START = "APPLICATION_START";
        public static final String APPLICATION_SHUTDOWN = "APPLICATION_SHUTDOWN";
        public static final String DATABASE_CONNECTION = "DATABASE_CONNECTION";
        public static final String CACHE_CLEAR = "CACHE_CLEAR";
        public static final String CONFIGURATION_CHANGE = "CONFIGURATION_CHANGE";
    }

    // Helper methods
    private String getSeverityLevel(String eventType) {
        List<String> highSeverity = Arrays.asList(
            SecurityEvents.DATA_BREACH_ATTEMPT,
            SecurityEvents.PRIVILEGE_ESCALATION,
            SecurityEvents.UNAUTHORIZED_ACCESS
        );

        List<String> mediumSeverity = Arrays.asList(
            SecurityEvents.FAILED_LOGIN,
            SecurityEvents.ACCOUNT_LOCKED,
            SecurityEvents.SUSPICIOUS_ACTIVITY
        );

        if (highSeverity.contains(eventType)) {
            return "HIGH";
        } else if (mediumSeverity.contains(eventType)) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private boolean isCriticalSecurityEvent(String eventType) {
        return Arrays.asList(
            SecurityEvents.DATA_BREACH_ATTEMPT,
            SecurityEvents.PRIVILEGE_ESCALATION
        ).contains(eventType);
    }

    private String getCurrentIpAddress() {
        // In a real application, extract from HTTP request
        // return RequestContextHolder.currentRequestAttributes()...
        return "127.0.0.1"; // Placeholder
    }

    private String getCurrentUserAgent() {
        // In a real application, extract from HTTP request
        return "VoltX-Client/1.0"; // Placeholder
    }

    private Map<String, Object> getServerInfo() {
        Map<String, Object> serverInfo = new HashMap<>();
        serverInfo.put("hostname", System.getProperty("java.vm.name"));
        serverInfo.put("javaVersion", System.getProperty("java.version"));
        serverInfo.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        return serverInfo;
    }
}