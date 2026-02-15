package com.voltx.config;

import com.voltx.dto.ApiResponse;
import com.voltx.exception.*;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Comprehensive global exception handler with advanced error processing,
 * logging, monitoring, and error response standardization
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final Counter errorCounter;
    private final Counter validationErrorCounter;
    private final Counter authErrorCounter;
    private final Counter databaseErrorCounter;
    private final Counter systemErrorCounter;

    @Autowired
    public GlobalExceptionHandler(MeterRegistry meterRegistry) {
        this.errorCounter = Counter.builder("voltx.errors.total")
                .description("Total number of errors")
                .register(meterRegistry);
        this.validationErrorCounter = Counter.builder("voltx.errors.validation")
                .description("Total number of validation errors")
                .register(meterRegistry);
        this.authErrorCounter = Counter.builder("voltx.errors.authentication")
                .description("Total number of authentication errors")
                .register(meterRegistry);
        this.databaseErrorCounter = Counter.builder("voltx.errors.database")
                .description("Total number of database errors")
                .register(meterRegistry);
        this.systemErrorCounter = Counter.builder("voltx.errors.system")
                .description("Total number of system errors")
                .register(meterRegistry);
    }

    // VoltX Application Exceptions
    @ExceptionHandler(VoltXException.class)
    public ResponseEntity<ErrorResponse> handleVoltXException(VoltXException ex, HttpServletRequest request, WebRequest webRequest) {
        ErrorResponse errorResponse = createErrorResponse(
                ex.getStatus(),
                ex.getMessage(),
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "VoltX Application Exception");
        errorCounter.increment("type", "application");

        return new ResponseEntity<>(errorResponse, ex.getStatus());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Resource Not Found");
        errorCounter.increment("type", "not_found");

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequestException(BadRequestException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Bad Request");
        errorCounter.increment("type", "bad_request");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(UnauthorizedException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage(),
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Unauthorized Access");
        authErrorCounter.increment();

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    // Authentication & Authorization Exceptions
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "Authentication failed: Invalid credentials",
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Authentication Failed");
        authErrorCounter.increment();

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.FORBIDDEN,
                "Access denied: Insufficient privileges",
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Access Denied");
        authErrorCounter.increment();

        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    // Validation Exceptions
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value",
                        (existing, replacement) -> existing
                ));

        ValidationErrorResponse errorResponse = createValidationErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                request.getRequestURI(),
                fieldErrors,
                ex
        );

        logValidationError(ex, request, fieldErrors);
        validationErrorCounter.increment();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ValidationErrorResponse> handleBindException(BindException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value"
                ));

        ValidationErrorResponse errorResponse = createValidationErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Binding validation failed",
                request.getRequestURI(),
                fieldErrors,
                ex
        );

        logValidationError(ex, request, fieldErrors);
        validationErrorCounter.increment();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ValidationErrorResponse> handleConstraintViolationException(ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = ex.getConstraintViolations()
                .stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage
                ));

        ValidationErrorResponse errorResponse = createValidationErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Constraint validation failed",
                request.getRequestURI(),
                fieldErrors,
                ex
        );

        logValidationError(ex, request, fieldErrors);
        validationErrorCounter.increment();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // HTTP Method & Media Type Exceptions
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupportedException(HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        String supportedMethods = String.join(", ", Objects.requireNonNull(ex.getSupportedMethods()));
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.METHOD_NOT_ALLOWED,
                String.format("Method '%s' not supported. Supported methods: %s", ex.getMethod(), supportedMethods),
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Method Not Supported");
        errorCounter.increment("type", "method_not_allowed");

        return new ResponseEntity<>(errorResponse, HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                String.format("Media type '%s' not supported", ex.getContentType()),
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Media Type Not Supported");
        errorCounter.increment("type", "unsupported_media_type");

        return new ResponseEntity<>(errorResponse, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    // Request Processing Exceptions
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMessageNotReadableException(HttpMessageNotReadableException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Malformed JSON or invalid request body",
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Message Not Readable");
        errorCounter.increment("type", "malformed_request");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParameterException(MissingServletRequestParameterException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.BAD_REQUEST,
                String.format("Required parameter '%s' is missing", ex.getParameterName()),
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Missing Request Parameter");
        errorCounter.increment("type", "missing_parameter");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatchException(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String expectedType = Objects.requireNonNull(ex.getRequiredType()).getSimpleName();
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.BAD_REQUEST,
                String.format("Parameter '%s' should be of type %s", ex.getName(), expectedType),
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Type Mismatch");
        errorCounter.increment("type", "type_mismatch");

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // File Upload Exceptions
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "File size exceeds maximum allowed size",
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "File Size Exceeded");
        errorCounter.increment("type", "file_too_large");

        return new ResponseEntity<>(errorResponse, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    // Database Exceptions
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.CONFLICT,
                "Data integrity violation: The operation conflicts with existing data",
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Data Integrity Violation");
        databaseErrorCounter.increment("type", "integrity_violation");

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccessException(DataAccessException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Database operation failed",
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Database Access Error");
        databaseErrorCounter.increment("type", "access_error");

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 404 Handler
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoHandlerFoundException(NoHandlerFoundException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.NOT_FOUND,
                String.format("Endpoint '%s %s' not found", ex.getHttpMethod(), ex.getRequestURL()),
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Endpoint Not Found");
        errorCounter.increment("type", "endpoint_not_found");

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    // Generic Exception Handler (Last Resort)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                request.getRequestURI(),
                ex
        );

        logError(ex, request, "Unexpected Error");
        systemErrorCounter.increment();

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Helper Methods
    private ErrorResponse createErrorResponse(HttpStatus status, String message, String path, Exception ex) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .exception(ex.getClass().getSimpleName())
                .traceId(MDC.get("traceId"))
                .build();
    }

    private ValidationErrorResponse createValidationErrorResponse(HttpStatus status, String message, String path,
                                                               Map<String, String> fieldErrors, Exception ex) {
        return ValidationErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .exception(ex.getClass().getSimpleName())
                .traceId(MDC.get("traceId"))
                .fieldErrors(fieldErrors)
                .build();
    }

    private void logError(Exception ex, HttpServletRequest request, String errorType) {
        String userId = getCurrentUserId();
        String sessionId = request.getSession(false) != null ? request.getSession().getId() : "no-session";

        MDC.put("errorType", errorType);
        MDC.put("userId", userId);
        MDC.put("sessionId", sessionId);
        MDC.put("requestUri", request.getRequestURI());
        MDC.put("requestMethod", request.getMethod());
        MDC.put("userAgent", request.getHeader("User-Agent"));
        MDC.put("clientIp", getClientIpAddress(request));

        logger.error("Exception occurred: {} - {}", errorType, ex.getMessage(), ex);

        // Clear MDC
        MDC.clear();
    }

    private void logValidationError(Exception ex, HttpServletRequest request, Map<String, String> fieldErrors) {
        String userId = getCurrentUserId();
        String sessionId = request.getSession(false) != null ? request.getSession().getId() : "no-session";

        MDC.put("errorType", "Validation Error");
        MDC.put("userId", userId);
        MDC.put("sessionId", sessionId);
        MDC.put("requestUri", request.getRequestURI());
        MDC.put("requestMethod", request.getMethod());
        MDC.put("fieldErrors", fieldErrors.toString());

        logger.warn("Validation failed: {} field errors - {}", fieldErrors.size(), ex.getMessage());

        // Clear MDC
        MDC.clear();
    }

    private String getCurrentUserId() {
        // Implementation would depend on your authentication mechanism
        // This is a placeholder - replace with actual user ID extraction
        return "anonymous";
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
