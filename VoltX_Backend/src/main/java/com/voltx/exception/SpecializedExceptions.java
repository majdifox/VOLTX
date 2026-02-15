package com.voltx.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception for rate limiting violations
 */
public class RateLimitExceededException extends VoltXException {

    private final long retryAfterSeconds;
    private final String limitType;

    public RateLimitExceededException(String message, long retryAfterSeconds, String limitType) {
        super(message, HttpStatus.TOO_MANY_REQUESTS);
        this.retryAfterSeconds = retryAfterSeconds;
        this.limitType = limitType;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }

    public String getLimitType() {
        return limitType;
    }

    public static RateLimitExceededException perMinute(long retryAfterSeconds) {
        return new RateLimitExceededException(
                "Rate limit exceeded. Too many requests per minute.",
                retryAfterSeconds,
                "per_minute"
        );
    }

    public static RateLimitExceededException perHour(long retryAfterSeconds) {
        return new RateLimitExceededException(
                "Rate limit exceeded. Too many requests per hour.",
                retryAfterSeconds,
                "per_hour"
        );
    }

    public static RateLimitExceededException concurrent(long retryAfterSeconds) {
        return new RateLimitExceededException(
                "Rate limit exceeded. Too many concurrent requests.",
                retryAfterSeconds,
                "concurrent"
        );
    }
}

/**
 * Exception for external service integration failures
 */
class ExternalServiceException extends VoltXException {

    private final String serviceName;
    private final String serviceEndpoint;
    private final int serviceStatusCode;

    public ExternalServiceException(String message, String serviceName, String serviceEndpoint) {
        super(message, HttpStatus.BAD_GATEWAY);
        this.serviceName = serviceName;
        this.serviceEndpoint = serviceEndpoint;
        this.serviceStatusCode = 0;
    }

    public ExternalServiceException(String message, String serviceName, String serviceEndpoint, int serviceStatusCode) {
        super(message, HttpStatus.BAD_GATEWAY);
        this.serviceName = serviceName;
        this.serviceEndpoint = serviceEndpoint;
        this.serviceStatusCode = serviceStatusCode;
    }

    public ExternalServiceException(String message, Throwable cause, String serviceName, String serviceEndpoint) {
        super(message, cause, HttpStatus.BAD_GATEWAY);
        this.serviceName = serviceName;
        this.serviceEndpoint = serviceEndpoint;
        this.serviceStatusCode = 0;
    }

    public String getServiceName() {
        return serviceName;
    }

    public String getServiceEndpoint() {
        return serviceEndpoint;
    }

    public int getServiceStatusCode() {
        return serviceStatusCode;
    }

    public static ExternalServiceException serviceUnavailable(String serviceName, String endpoint) {
        return new ExternalServiceException(
                String.format("External service '%s' is currently unavailable", serviceName),
                serviceName,
                endpoint,
                503
        );
    }

    public static ExternalServiceException timeout(String serviceName, String endpoint) {
        return new ExternalServiceException(
                String.format("External service '%s' request timed out", serviceName),
                serviceName,
                endpoint,
                408
        );
    }

    public static ExternalServiceException invalidResponse(String serviceName, String endpoint, String details) {
        return new ExternalServiceException(
                String.format("External service '%s' returned invalid response: %s", serviceName, details),
                serviceName,
                endpoint,
                502
        );
    }
}

/**
 * Exception for business rule violations
 */
class BusinessRuleException extends VoltXException {

    private final String ruleCode;
    private final String ruleName;

    public BusinessRuleException(String message, String ruleCode, String ruleName) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
        this.ruleCode = ruleCode;
        this.ruleName = ruleName;
    }

    public BusinessRuleException(String message, Throwable cause, String ruleCode, String ruleName) {
        super(message, cause, HttpStatus.UNPROCESSABLE_ENTITY);
        this.ruleCode = ruleCode;
        this.ruleName = ruleName;
    }

    public String getRuleCode() {
        return ruleCode;
    }

    public String getRuleName() {
        return ruleName;
    }

    public static BusinessRuleException insufficientPoints(int required, int available) {
        return new BusinessRuleException(
                String.format("Insufficient points. Required: %d, Available: %d", required, available),
                "INSUFFICIENT_POINTS",
                "Insufficient Points Rule"
        );
    }

    public static BusinessRuleException levelRequirement(int requiredLevel, int currentLevel, String action) {
        return new BusinessRuleException(
                String.format("Level %d required for '%s'. Current level: %d", requiredLevel, action, currentLevel),
                "LEVEL_REQUIREMENT",
                "Level Requirement Rule"
        );
    }

    public static BusinessRuleException achievementAlreadyEarned(String achievementName) {
        return new BusinessRuleException(
                String.format("Achievement '%s' has already been earned", achievementName),
                "ACHIEVEMENT_ALREADY_EARNED",
                "Achievement Uniqueness Rule"
        );
    }
}