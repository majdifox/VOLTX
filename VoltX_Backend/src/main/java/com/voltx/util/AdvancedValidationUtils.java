package com.voltx.util;

import com.voltx.entity.User;
import com.voltx.entity.Activity;
import com.voltx.entity.Achievement;
import com.voltx.validation.VoltXValidators;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Comprehensive validation utilities for complex data validation scenarios
 */
@Component
public class AdvancedValidationUtils {

    private final Validator validator;

    // Compiled regex patterns for performance
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );

    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^\\+?[1-9]\\d{1,14}$"
    );

    private static final Pattern USERNAME_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9][a-zA-Z0-9._-]{2,28}[a-zA-Z0-9]$"
    );

    private static final Pattern URL_PATTERN = Pattern.compile(
        "^(https?|ftp)://[^\\s/$.?#].[^\\s]*$"
    );

    private static final Set<String> BLOCKED_WORDS = Set.of(
        "admin", "administrator", "root", "system", "test", "demo",
        "support", "help", "null", "undefined", "password"
    );

    @Autowired
    public AdvancedValidationUtils(Validator validator) {
        this.validator = validator;
    }

    /**
     * Validate entity using Bean Validation with detailed error mapping
     */
    public <T> ValidationResult<T> validateEntity(T entity, Class<?>... groups) {
        Set<ConstraintViolation<T>> violations;
        if (groups.length > 0) {
            violations = validator.validate(entity, groups);
        } else {
            violations = validator.validate(entity);
        }

        ValidationResult<T> result = new ValidationResult<>(entity);
        for (ConstraintViolation<T> violation : violations) {
            result.addError(
                violation.getPropertyPath().toString(),
                violation.getMessage(),
                violation.getInvalidValue()
            );
        }

        return result;
    }

    /**
     * Validate multiple entities in batch
     */
    public <T> BatchValidationResult<T> validateBatch(List<T> entities, Class<?>... groups) {
        BatchValidationResult<T> batchResult = new BatchValidationResult<>();

        for (int i = 0; i < entities.size(); i++) {
            ValidationResult<T> result = validateEntity(entities.get(i), groups);
            batchResult.addResult(i, result);
        }

        return batchResult;
    }

    /**
     * Validate field conditionally based on other field values
     */
    public <T> ValidationResult<T> validateConditionally(T entity,
                                                       Map<String, ConditionalValidator<T>> conditionalValidators) {
        ValidationResult<T> result = new ValidationResult<>(entity);

        for (Map.Entry<String, ConditionalValidator<T>> entry : conditionalValidators.entrySet()) {
            String fieldName = entry.getKey();
            ConditionalValidator<T> validator = entry.getValue();

            try {
                Object fieldValue = getFieldValue(entity, fieldName);
                if (validator.shouldValidate(entity)) {
                    List<String> errors = validator.validate(fieldValue, entity);
                    for (String error : errors) {
                        result.addError(fieldName, error, fieldValue);
                    }
                }
            } catch (Exception e) {
                result.addError(fieldName, "Failed to validate field: " + e.getMessage(), null);
            }
        }

        return result;
    }

    /**
     * Cross-field validation
     */
    public <T> ValidationResult<T> validateCrossFields(T entity, List<CrossFieldValidator<T>> crossValidators) {
        ValidationResult<T> result = new ValidationResult<>(entity);

        for (CrossFieldValidator<T> validator : crossValidators) {
            try {
                List<String> errors = validator.validate(entity);
                for (String error : errors) {
                    result.addError("crossField", error, null);
                }
            } catch (Exception e) {
                result.addError("crossField", "Cross-field validation failed: " + e.getMessage(), null);
            }
        }

        return result;
    }

    /**
     * Validate data transformation and sanitization
     */
    public <T> TransformationResult<T> validateAndTransform(T entity,
                                                          Map<String, DataTransformer<T>> transformers) {
        TransformationResult<T> result = new TransformationResult<>(entity);

        T transformedEntity = cloneEntity(entity);

        for (Map.Entry<String, DataTransformer<T>> entry : transformers.entrySet()) {
            String fieldName = entry.getKey();
            DataTransformer<T> transformer = entry.getValue();

            try {
                Object originalValue = getFieldValue(transformedEntity, fieldName);
                Object transformedValue = transformer.transform(originalValue, transformedEntity);

                if (!Objects.equals(originalValue, transformedValue)) {
                    setFieldValue(transformedEntity, fieldName, transformedValue);
                    result.addTransformation(fieldName, originalValue, transformedValue);
                }

                // Validate transformed value
                List<String> errors = transformer.validate(transformedValue, transformedEntity);
                for (String error : errors) {
                    result.addError(fieldName, error, transformedValue);
                }

            } catch (Exception e) {
                result.addError(fieldName, "Transformation failed: " + e.getMessage(), null);
            }
        }

        result.setTransformedEntity(transformedEntity);
        return result;
    }

    /**
     * Validate business rules with custom predicates
     */
    public <T> ValidationResult<T> validateBusinessRules(T entity, List<BusinessRule<T>> rules) {
        ValidationResult<T> result = new ValidationResult<>(entity);

        for (BusinessRule<T> rule : rules) {
            try {
                if (!rule.isValid(entity)) {
                    result.addError("businessRule", rule.getErrorMessage(), null);
                }
            } catch (Exception e) {
                result.addError("businessRule", "Business rule validation failed: " + e.getMessage(), null);
            }
        }

        return result;
    }

    /**
     * Validate collections with custom rules
     */
    public <T, E> ValidationResult<T> validateCollection(T entity, String collectionFieldName,
                                                       CollectionValidator<E> collectionValidator) {
        ValidationResult<T> result = new ValidationResult<>(entity);

        try {
            Object fieldValue = getFieldValue(entity, collectionFieldName);
            if (fieldValue instanceof Collection) {
                @SuppressWarnings("unchecked")
                Collection<E> collection = (Collection<E>) fieldValue;

                // Validate collection size
                if (collection.size() > collectionValidator.getMaxSize()) {
                    result.addError(collectionFieldName,
                        "Collection size exceeds maximum of " + collectionValidator.getMaxSize(),
                        collection.size());
                }

                if (collection.size() < collectionValidator.getMinSize()) {
                    result.addError(collectionFieldName,
                        "Collection size is below minimum of " + collectionValidator.getMinSize(),
                        collection.size());
                }

                // Validate each element
                int index = 0;
                for (E element : collection) {
                    List<String> elementErrors = collectionValidator.validateElement(element, index);
                    for (String error : elementErrors) {
                        result.addError(collectionFieldName + "[" + index + "]", error, element);
                    }
                    index++;
                }

                // Validate uniqueness if required
                if (collectionValidator.isUniqueRequired()) {
                    Set<E> uniqueElements = new HashSet<>(collection);
                    if (uniqueElements.size() != collection.size()) {
                        result.addError(collectionFieldName, "Collection contains duplicate elements", null);
                    }
                }
            }
        } catch (Exception e) {
            result.addError(collectionFieldName, "Collection validation failed: " + e.getMessage(), null);
        }

        return result;
    }

    /**
     * Validate with custom severity levels
     */
    public <T> SeverityValidationResult<T> validateWithSeverity(T entity,
                                                              List<SeverityValidator<T>> validators) {
        SeverityValidationResult<T> result = new SeverityValidationResult<>(entity);

        for (SeverityValidator<T> validator : validators) {
            try {
                SeverityValidationResult.ValidationIssue issue = validator.validate(entity);
                if (issue != null) {
                    result.addIssue(issue);
                }
            } catch (Exception e) {
                result.addIssue(new SeverityValidationResult.ValidationIssue(
                    "validation", "Validator error: " + e.getMessage(),
                    SeverityLevel.ERROR, null));
            }
        }

        return result;
    }

    // Utility methods for common validations

    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public static boolean isValidPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }

    public static boolean isValidUsername(String username) {
        if (username == null || !USERNAME_PATTERN.matcher(username).matches()) {
            return false;
        }

        String lowerUsername = username.toLowerCase();
        return BLOCKED_WORDS.stream().noneMatch(lowerUsername::contains);
    }

    public static boolean isValidUrl(String url) {
        return url != null && URL_PATTERN.matcher(url).matches();
    }

    public static boolean isValidDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return false;
        return start.isBefore(end);
    }

    public static boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) return false;

        boolean hasUpper = password.matches(".*[A-Z].*");
        boolean hasLower = password.matches(".*[a-z].*");
        boolean hasDigit = password.matches(".*\\d.*");
        boolean hasSpecial = password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*");

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    public static ValidationSummary createSummary(List<? extends ValidationResult<?>> results) {
        ValidationSummary summary = new ValidationSummary();

        for (ValidationResult<?> result : results) {
            summary.addResult(result);
        }

        return summary;
    }

    // Helper methods
    private Object getFieldValue(Object obj, String fieldName) throws Exception {
        Field field = findField(obj.getClass(), fieldName);
        field.setAccessible(true);
        return field.get(obj);
    }

    private void setFieldValue(Object obj, String fieldName, Object value) throws Exception {
        Field field = findField(obj.getClass(), fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }

    private Field findField(Class<?> clazz, String fieldName) throws NoSuchFieldException {
        try {
            return clazz.getDeclaredField(fieldName);
        } catch (NoSuchFieldException e) {
            Class<?> superClass = clazz.getSuperclass();
            if (superClass != null) {
                return findField(superClass, fieldName);
            }
            throw e;
        }
    }

    @SuppressWarnings("unchecked")
    private <T> T cloneEntity(T entity) {
        // Simplified cloning - in production, use a proper cloning library
        try {
            return (T) entity.getClass().getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            return entity; // Fallback to original if cloning fails
        }
    }

    // Functional interfaces for validation

    @FunctionalInterface
    public interface ConditionalValidator<T> {
        boolean shouldValidate(T entity);
        List<String> validate(Object fieldValue, T entity);
    }

    @FunctionalInterface
    public interface CrossFieldValidator<T> {
        List<String> validate(T entity);
    }

    @FunctionalInterface
    public interface DataTransformer<T> {
        Object transform(Object value, T entity);
        default List<String> validate(Object transformedValue, T entity) {
            return new ArrayList<>();
        }
    }

    @FunctionalInterface
    public interface BusinessRule<T> {
        boolean isValid(T entity);
        String getErrorMessage();
    }

    public interface CollectionValidator<E> {
        int getMaxSize();
        int getMinSize();
        boolean isUniqueRequired();
        List<String> validateElement(E element, int index);
    }

    @FunctionalInterface
    public interface SeverityValidator<T> {
        SeverityValidationResult.ValidationIssue validate(T entity);
    }

    // Result classes

    public static class ValidationResult<T> {
        private final T entity;
        private final List<ValidationError> errors = new ArrayList<>();

        public ValidationResult(T entity) {
            this.entity = entity;
        }

        public void addError(String field, String message, Object invalidValue) {
            errors.add(new ValidationError(field, message, invalidValue));
        }

        public boolean isValid() {
            return errors.isEmpty();
        }

        public List<ValidationError> getErrors() {
            return new ArrayList<>(errors);
        }

        public T getEntity() {
            return entity;
        }

        public Map<String, List<String>> getErrorMap() {
            return errors.stream()
                .collect(Collectors.groupingBy(
                    ValidationError::getField,
                    Collectors.mapping(ValidationError::getMessage, Collectors.toList())
                ));
        }
    }

    public static class BatchValidationResult<T> {
        private final Map<Integer, ValidationResult<T>> results = new HashMap<>();

        public void addResult(int index, ValidationResult<T> result) {
            results.put(index, result);
        }

        public boolean isAllValid() {
            return results.values().stream().allMatch(ValidationResult::isValid);
        }

        public Map<Integer, ValidationResult<T>> getResults() {
            return new HashMap<>(results);
        }

        public List<ValidationResult<T>> getInvalidResults() {
            return results.values().stream()
                .filter(result -> !result.isValid())
                .collect(Collectors.toList());
        }
    }

    public static class TransformationResult<T> extends ValidationResult<T> {
        private final Map<String, Transformation> transformations = new HashMap<>();
        private T transformedEntity;

        public TransformationResult(T entity) {
            super(entity);
        }

        public void addTransformation(String field, Object originalValue, Object transformedValue) {
            transformations.put(field, new Transformation(originalValue, transformedValue));
        }

        public void setTransformedEntity(T transformedEntity) {
            this.transformedEntity = transformedEntity;
        }

        public T getTransformedEntity() {
            return transformedEntity;
        }

        public Map<String, Transformation> getTransformations() {
            return new HashMap<>(transformations);
        }

        public static class Transformation {
            private final Object originalValue;
            private final Object transformedValue;

            public Transformation(Object originalValue, Object transformedValue) {
                this.originalValue = originalValue;
                this.transformedValue = transformedValue;
            }

            public Object getOriginalValue() { return originalValue; }
            public Object getTransformedValue() { return transformedValue; }
        }
    }

    public static class SeverityValidationResult<T> extends ValidationResult<T> {
        private final List<ValidationIssue> issues = new ArrayList<>();

        public SeverityValidationResult(T entity) {
            super(entity);
        }

        public void addIssue(ValidationIssue issue) {
            issues.add(issue);
            if (issue.getSeverity() == SeverityLevel.ERROR) {
                addError(issue.getField(), issue.getMessage(), issue.getValue());
            }
        }

        public List<ValidationIssue> getIssues() {
            return new ArrayList<>(issues);
        }

        public List<ValidationIssue> getIssuesBySeverity(SeverityLevel severity) {
            return issues.stream()
                .filter(issue -> issue.getSeverity() == severity)
                .collect(Collectors.toList());
        }

        public static class ValidationIssue {
            private final String field;
            private final String message;
            private final SeverityLevel severity;
            private final Object value;

            public ValidationIssue(String field, String message, SeverityLevel severity, Object value) {
                this.field = field;
                this.message = message;
                this.severity = severity;
                this.value = value;
            }

            public String getField() { return field; }
            public String getMessage() { return message; }
            public SeverityLevel getSeverity() { return severity; }
            public Object getValue() { return value; }
        }
    }

    public static class ValidationError {
        private final String field;
        private final String message;
        private final Object invalidValue;

        public ValidationError(String field, String message, Object invalidValue) {
            this.field = field;
            this.message = message;
            this.invalidValue = invalidValue;
        }

        public String getField() { return field; }
        public String getMessage() { return message; }
        public Object getInvalidValue() { return invalidValue; }
    }

    public static class ValidationSummary {
        private int totalResults = 0;
        private int validResults = 0;
        private int invalidResults = 0;
        private final Map<String, Integer> errorCounts = new HashMap<>();

        public void addResult(ValidationResult<?> result) {
            totalResults++;
            if (result.isValid()) {
                validResults++;
            } else {
                invalidResults++;
                for (ValidationError error : result.getErrors()) {
                    errorCounts.merge(error.getField(), 1, Integer::sum);
                }
            }
        }

        public int getTotalResults() { return totalResults; }
        public int getValidResults() { return validResults; }
        public int getInvalidResults() { return invalidResults; }
        public double getValidationRate() { return totalResults > 0 ? (double) validResults / totalResults : 0; }
        public Map<String, Integer> getErrorCounts() { return new HashMap<>(errorCounts); }
    }

    public enum SeverityLevel {
        INFO,
        WARNING,
        ERROR,
        CRITICAL
    }
}