package com.voltx.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception for conflicts in business logic or data state
 */
public class ConflictException extends VoltXException {

    public ConflictException(String message) {
        super(message, HttpStatus.CONFLICT);
    }

    public ConflictException(String message, Throwable cause) {
        super(message, cause, HttpStatus.CONFLICT);
    }

    /**
     * Create a conflict exception for duplicate resources
     */
    public static ConflictException duplicateResource(String resourceType, String identifier) {
        return new ConflictException(String.format("%s with identifier '%s' already exists", resourceType, identifier));
    }

    /**
     * Create a conflict exception for business rule violations
     */
    public static ConflictException businessRuleViolation(String rule, String details) {
        return new ConflictException(String.format("Business rule violation: %s. %s", rule, details));
    }

    /**
     * Create a conflict exception for state conflicts
     */
    public static ConflictException stateConflict(String currentState, String expectedState, String operation) {
        return new ConflictException(String.format("Cannot perform '%s' operation. Current state: %s, Expected state: %s",
                operation, currentState, expectedState));
    }
}