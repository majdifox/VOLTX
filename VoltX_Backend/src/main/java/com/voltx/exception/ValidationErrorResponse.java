package com.voltx.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Specialized error response for validation failures
 * with detailed field-level error information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ValidationErrorResponse {

    /**
     * Timestamp when the validation error occurred
     */
    private LocalDateTime timestamp;

    /**
     * HTTP status code (usually 400 for validation errors)
     */
    private int status;

    /**
     * HTTP status reason phrase
     */
    private String error;

    /**
     * General validation error message
     */
    private String message;

    /**
     * Request path where the validation failed
     */
    private String path;

    /**
     * Exception class name
     */
    private String exception;

    /**
     * Unique trace ID for request tracking
     */
    private String traceId;

    /**
     * Field-level validation errors
     */
    private Map<String, String> fieldErrors;

    /**
     * Global validation errors (not field-specific)
     */
    private List<String> globalErrors;

    /**
     * Total number of validation errors
     */
    private int errorCount;

    /**
     * Validation context information
     */
    private ValidationContext context;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationContext {
        /**
         * Object type being validated
         */
        private String objectType;

        /**
         * Validation groups that were applied
         */
        private List<String> validationGroups;

        /**
         * Locale used for validation messages
         */
        private String locale;

        /**
         * Additional validation metadata
         */
        private Map<String, Object> metadata;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldErrorDetail {
        /**
         * Field name
         */
        private String field;

        /**
         * Rejected value
         */
        private Object rejectedValue;

        /**
         * Error message
         */
        private String message;

        /**
         * Error code for programmatic handling
         */
        private String code;

        /**
         * Error severity level
         */
        private ErrorSeverity severity;

        /**
         * Suggested fix for the error
         */
        private String suggestion;
    }

    public enum ErrorSeverity {
        ERROR,
        WARNING,
        INFO
    }

    /**
     * Calculate total error count
     */
    public int getTotalErrorCount() {
        int count = 0;
        if (fieldErrors != null) {
            count += fieldErrors.size();
        }
        if (globalErrors != null) {
            count += globalErrors.size();
        }
        return count;
    }

    /**
     * Check if there are any field errors
     */
    public boolean hasFieldErrors() {
        return fieldErrors != null && !fieldErrors.isEmpty();
    }

    /**
     * Check if there are any global errors
     */
    public boolean hasGlobalErrors() {
        return globalErrors != null && !globalErrors.isEmpty();
    }

    /**
     * Create a simple validation error response
     */
    public static ValidationErrorResponse simple(int status, String message, String path, Map<String, String> fieldErrors) {
        return ValidationErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error("Validation Failed")
                .message(message)
                .path(path)
                .fieldErrors(fieldErrors)
                .errorCount(fieldErrors != null ? fieldErrors.size() : 0)
                .build();
    }

    /**
     * Create a detailed validation error response
     */
    public static ValidationErrorResponse detailed(int status, String message, String path,
                                                 Map<String, String> fieldErrors, List<String> globalErrors,
                                                 String traceId, ValidationContext context) {
        int totalErrors = 0;
        if (fieldErrors != null) totalErrors += fieldErrors.size();
        if (globalErrors != null) totalErrors += globalErrors.size();

        return ValidationErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error("Validation Failed")
                .message(message)
                .path(path)
                .fieldErrors(fieldErrors)
                .globalErrors(globalErrors)
                .errorCount(totalErrors)
                .traceId(traceId)
                .context(context)
                .build();
    }
}