package com.voltx.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Enhanced error response with comprehensive error information,
 * request context, and debugging capabilities
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    /**
     * Timestamp when the error occurred
     */
    private LocalDateTime timestamp;

    /**
     * HTTP status code
     */
    private int status;

    /**
     * HTTP status reason phrase
     */
    private String error;

    /**
     * Human-readable error message
     */
    private String message;

    /**
     * Request path where the error occurred
     */
    private String path;

    /**
     * Exception class name for debugging
     */
    private String exception;

    /**
     * Unique trace ID for request tracking
     */
    private String traceId;

    /**
     * Additional error details for debugging (only in development)
     */
    private Map<String, Object> details;

    /**
     * Error category for classification
     */
    private String category;

    /**
     * Error code for client-side handling
     */
    private String errorCode;

    /**
     * Suggested actions for resolving the error
     */
    private String suggestion;

    /**
     * Support information for users
     */
    private SupportInfo support;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupportInfo {
        /**
         * Support contact email
         */
        private String email;

        /**
         * Support documentation URL
         */
        private String documentation;

        /**
         * Support ticket URL
         */
        private String ticketUrl;
    }

    /**
     * Create a basic error response
     */
    public static ErrorResponse basic(int status, String error, String message, String path) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .build();
    }

    /**
     * Create an error response with trace ID
     */
    public static ErrorResponse withTrace(int status, String error, String message, String path, String traceId) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .traceId(traceId)
                .build();
    }

    /**
     * Create a detailed error response
     */
    public static ErrorResponse detailed(int status, String error, String message, String path,
                                       String exception, String traceId, String errorCode) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .exception(exception)
                .traceId(traceId)
                .errorCode(errorCode)
                .build();
    }
}