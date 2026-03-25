package com.voltx.validation;

import com.voltx.entity.User;
import com.voltx.entity.Activity;
import com.voltx.entity.Achievement;
import com.voltx.repository.UserRepository;
import com.voltx.repository.ActivityRepository;
import com.voltx.repository.AchievementRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Custom validation annotations for VoltX business rules
 */
public class VoltXValidators {

    // Username Validation
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = UniqueUsernameValidator.class)
    public @interface UniqueUsername {
        String message() default "Username already exists";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
        long excludeId() default 0L;
    }

    @Component
    public static class UniqueUsernameValidator implements ConstraintValidator<UniqueUsername, String> {

        @Autowired
        private UserRepository userRepository;

        private long excludeId;

        @Override
        public void initialize(UniqueUsername constraintAnnotation) {
            this.excludeId = constraintAnnotation.excludeId();
        }

        @Override
        public boolean isValid(String username, ConstraintValidatorContext context) {
            if (username == null || username.trim().isEmpty()) {
                return false;
            }

            User existingUser = userRepository.findByUsername(username);
            return existingUser == null || (excludeId > 0 && existingUser.getId().equals(excludeId));
        }
    }

    // Email Validation
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = UniqueEmailValidator.class)
    public @interface UniqueEmail {
        String message() default "Email already exists";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
        long excludeId() default 0L;
    }

    @Component
    public static class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {

        @Autowired
        private UserRepository userRepository;

        private long excludeId;

        @Override
        public void initialize(UniqueEmail constraintAnnotation) {
            this.excludeId = constraintAnnotation.excludeId();
        }

        @Override
        public boolean isValid(String email, ConstraintValidatorContext context) {
            if (email == null || email.trim().isEmpty()) {
                return false;
            }

            User existingUser = userRepository.findByEmail(email);
            return existingUser == null || (excludeId > 0 && existingUser.getId().equals(excludeId));
        }
    }

    // Strong Password Validation
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = StrongPasswordValidator.class)
    public @interface StrongPassword {
        String message() default "Password must be at least 8 characters with uppercase, lowercase, number and special character";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
        int minLength() default 8;
        boolean requireUppercase() default true;
        boolean requireLowercase() default true;
        boolean requireNumbers() default true;
        boolean requireSpecialChars() default true;
    }

    @Component
    public static class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

        private int minLength;
        private boolean requireUppercase;
        private boolean requireLowercase;
        private boolean requireNumbers;
        private boolean requireSpecialChars;

        @Override
        public void initialize(StrongPassword constraintAnnotation) {
            this.minLength = constraintAnnotation.minLength();
            this.requireUppercase = constraintAnnotation.requireUppercase();
            this.requireLowercase = constraintAnnotation.requireLowercase();
            this.requireNumbers = constraintAnnotation.requireNumbers();
            this.requireSpecialChars = constraintAnnotation.requireSpecialChars();
        }

        @Override
        public boolean isValid(String password, ConstraintValidatorContext context) {
            if (password == null || password.length() < minLength) {
                return false;
            }

            if (requireUppercase && !password.matches(".*[A-Z].*")) {
                return false;
            }

            if (requireLowercase && !password.matches(".*[a-z].*")) {
                return false;
            }

            if (requireNumbers && !password.matches(".*\\d.*")) {
                return false;
            }

            if (requireSpecialChars && !password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
                return false;
            }

            return true;
        }
    }

    // Activity Date Validation
    @Target({ElementType.FIELD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = ValidActivityDateValidator.class)
    public @interface ValidActivityDate {
        String message() default "Activity date must be in the future and within reasonable limits";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
        int maxDaysInFuture() default 365;
        int minDaysInFuture() default 1;
    }

    @Component
    public static class ValidActivityDateValidator implements ConstraintValidator<ValidActivityDate, LocalDateTime> {

        private int maxDaysInFuture;
        private int minDaysInFuture;

        @Override
        public void initialize(ValidActivityDate constraintAnnotation) {
            this.maxDaysInFuture = constraintAnnotation.maxDaysInFuture();
            this.minDaysInFuture = constraintAnnotation.minDaysInFuture();
        }

        @Override
        public boolean isValid(LocalDateTime activityDate, ConstraintValidatorContext context) {
            if (activityDate == null) {
                return true; // Let @NotNull handle null validation
            }

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime minDate = now.plusDays(minDaysInFuture);
            LocalDateTime maxDate = now.plusDays(maxDaysInFuture);

            return activityDate.isAfter(minDate) && activityDate.isBefore(maxDate);
        }
    }

    // Activity Capacity Validation
    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = ValidActivityCapacityValidator.class)
    public @interface ValidActivityCapacity {
        String message() default "Current participants cannot exceed maximum participants";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
    }

    @Component
    public static class ValidActivityCapacityValidator implements ConstraintValidator<ValidActivityCapacity, Activity> {

        @Override
        public boolean isValid(Activity activity, ConstraintValidatorContext context) {
            if (activity == null) {
                return true;
            }

            return activity.getCurrentParticipants() <= activity.getMaxParticipants();
        }
    }

    // Achievement Points Validation
    @Target({ElementType.FIELD})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = ValidAchievementPointsValidator.class)
    public @interface ValidAchievementPoints {
        String message() default "Achievement points must align with rarity level";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
    }

    @Component
    public static class ValidAchievementPointsValidator implements ConstraintValidator<ValidAchievementPoints, Achievement> {

        @Override
        public boolean isValid(Achievement achievement, ConstraintValidatorContext context) {
            if (achievement == null || achievement.getRarity() == null) {
                return true;
            }

            int points = achievement.getPoints();
            switch (achievement.getRarity()) {
                case COMMON:
                    return points >= 10 && points <= 50;
                case RARE:
                    return points >= 51 && points <= 150;
                case EPIC:
                    return points >= 151 && points <= 300;
                case LEGENDARY:
                    return points >= 301 && points <= 500;
                case MYTHIC:
                    return points >= 501 && points <= 1000;
                default:
                    return false;
            }
        }
    }

    // Professional Username Validation
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = ProfessionalUsernameValidator.class)
    public @interface ProfessionalUsername {
        String message() default "Username must be professional and appropriate";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
    }

    @Component
    public static class ProfessionalUsernameValidator implements ConstraintValidator<ProfessionalUsername, String> {

        private static final List<String> INAPPROPRIATE_WORDS = List.of(
            "admin", "administrator", "root", "system", "test", "demo",
            "null", "undefined", "support", "help"
        );

        private static final Pattern VALID_USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9][a-zA-Z0-9._-]{2,28}[a-zA-Z0-9]$");

        @Override
        public boolean isValid(String username, ConstraintValidatorContext context) {
            if (username == null) {
                return false;
            }

            // Check pattern
            if (!VALID_USERNAME_PATTERN.matcher(username).matches()) {
                return false;
            }

            // Check for inappropriate words
            String lowerUsername = username.toLowerCase();
            return INAPPROPRIATE_WORDS.stream()
                    .noneMatch(word -> lowerUsername.contains(word));
        }
    }

    // Bio Content Validation
    @Target({ElementType.FIELD})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = SafeBioContentValidator.class)
    public @interface SafeBioContent {
        String message() default "Bio content contains inappropriate material";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
    }

    @Component
    public static class SafeBioContentValidator implements ConstraintValidator<SafeBioContent, String> {

        private static final List<String> INAPPROPRIATE_PATTERNS = List.of(
            "http://", "https://", "www\\.", "<script", "<iframe",
            "javascript:", "email:", "phone:", "contact:"
        );

        @Override
        public boolean isValid(String bio, ConstraintValidatorContext context) {
            if (bio == null || bio.trim().isEmpty()) {
                return true;
            }

            String lowerBio = bio.toLowerCase();
            return INAPPROPRIATE_PATTERNS.stream()
                    .noneMatch(pattern -> lowerBio.contains(pattern.toLowerCase()));
        }
    }

    // Activity Title Validation
    @Target({ElementType.FIELD})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = ValidActivityTitleValidator.class)
    public @interface ValidActivityTitle {
        String message() default "Activity title must be descriptive and appropriate";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
        int minWords() default 2;
        int maxWords() default 10;
    }

    @Component
    public static class ValidActivityTitleValidator implements ConstraintValidator<ValidActivityTitle, String> {

        private int minWords;
        private int maxWords;

        @Override
        public void initialize(ValidActivityTitle constraintAnnotation) {
            this.minWords = constraintAnnotation.minWords();
            this.maxWords = constraintAnnotation.maxWords();
        }

        @Override
        public boolean isValid(String title, ConstraintValidatorContext context) {
            if (title == null || title.trim().isEmpty()) {
                return false;
            }

            String[] words = title.trim().split("\\s+");
            return words.length >= minWords && words.length <= maxWords;
        }
    }

    // File Upload Validation
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = ValidFileUploadValidator.class)
    public @interface ValidFileUpload {
        String message() default "Invalid file upload";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
        String[] allowedTypes() default {"image/jpeg", "image/png", "image/gif"};
        long maxSizeBytes() default 5 * 1024 * 1024; // 5MB
    }

    @Component
    public static class ValidFileUploadValidator implements ConstraintValidator<ValidFileUpload, org.springframework.web.multipart.MultipartFile> {

        private String[] allowedTypes;
        private long maxSizeBytes;

        @Override
        public void initialize(ValidFileUpload constraintAnnotation) {
            this.allowedTypes = constraintAnnotation.allowedTypes();
            this.maxSizeBytes = constraintAnnotation.maxSizeBytes();
        }

        @Override
        public boolean isValid(org.springframework.web.multipart.MultipartFile file, ConstraintValidatorContext context) {
            if (file == null || file.isEmpty()) {
                return true; // Let @NotNull handle null validation
            }

            // Check file size
            if (file.getSize() > maxSizeBytes) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                    "File size exceeds maximum allowed size of " + (maxSizeBytes / 1024 / 1024) + "MB"
                ).addConstraintViolation();
                return false;
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !isAllowedType(contentType)) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                    "File type not allowed. Allowed types: " + String.join(", ", allowedTypes)
                ).addConstraintViolation();
                return false;
            }

            return true;
        }

        private boolean isAllowedType(String contentType) {
            for (String allowedType : allowedTypes) {
                if (allowedType.equalsIgnoreCase(contentType)) {
                    return true;
                }
            }
            return false;
        }
    }

    // Level Progression Validation
    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = ValidLevelProgressionValidator.class)
    public @interface ValidLevelProgression {
        String message() default "User level must align with adrenaline points";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
    }

    @Component
    public static class ValidLevelProgressionValidator implements ConstraintValidator<ValidLevelProgression, User> {

        @Override
        public boolean isValid(User user, ConstraintValidatorContext context) {
            if (user == null) {
                return true;
            }

            int level = user.getLevel();
            int points = user.getAdrenalinePoints();

            // Calculate expected minimum points for level
            int expectedMinPoints = calculateMinPointsForLevel(level);
            int expectedMaxPoints = calculateMinPointsForLevel(level + 1) - 1;

            return points >= expectedMinPoints && points <= expectedMaxPoints;
        }

        private int calculateMinPointsForLevel(int level) {
            if (level <= 1) return 0;
            return (level - 1) * (level - 1) * 100; // Exponential growth formula
        }
    }

    // Cross-Field Validation for ActivityDateRange
    @Target({ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = ValidDateRangeValidator.class)
    public @interface ValidDateRange {
        String message() default "Start date must be before end date";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
        String startDateField() default "startDate";
        String endDateField() default "endDate";
    }

    @Component
    public static class ValidDateRangeValidator implements ConstraintValidator<ValidDateRange, Object> {

        private String startDateField;
        private String endDateField;

        @Override
        public void initialize(ValidDateRange constraintAnnotation) {
            this.startDateField = constraintAnnotation.startDateField();
            this.endDateField = constraintAnnotation.endDateField();
        }

        @Override
        public boolean isValid(Object obj, ConstraintValidatorContext context) {
            try {
                LocalDateTime startDate = (LocalDateTime) getFieldValue(obj, startDateField);
                LocalDateTime endDate = (LocalDateTime) getFieldValue(obj, endDateField);

                if (startDate == null || endDate == null) {
                    return true; // Let individual field validators handle null values
                }

                return startDate.isBefore(endDate);
            } catch (Exception e) {
                return false;
            }
        }

        private Object getFieldValue(Object obj, String fieldName) throws Exception {
            java.lang.reflect.Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(obj);
        }
    }

    // Business Hours Validation
    @Target({ElementType.FIELD})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = BusinessHoursValidator.class)
    public @interface BusinessHours {
        String message() default "Time must be within business hours (9 AM - 6 PM)";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
        int startHour() default 9;
        int endHour() default 18;
    }

    @Component
    public static class BusinessHoursValidator implements ConstraintValidator<BusinessHours, LocalDateTime> {

        private int startHour;
        private int endHour;

        @Override
        public void initialize(BusinessHours constraintAnnotation) {
            this.startHour = constraintAnnotation.startHour();
            this.endHour = constraintAnnotation.endHour();
        }

        @Override
        public boolean isValid(LocalDateTime dateTime, ConstraintValidatorContext context) {
            if (dateTime == null) {
                return true;
            }

            int hour = dateTime.getHour();
            return hour >= startHour && hour < endHour;
        }
    }

    // Sequence Validation for Achievement Dependencies
    @Target({ElementType.FIELD})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @jakarta.validation.Constraint(validatedBy = ValidAchievementSequenceValidator.class)
    public @interface ValidAchievementSequence {
        String message() default "Achievement prerequisites must be valid and achievable";
        Class<?>[] groups() default {};
        Class<? extends jakarta.validation.Payload>[] payload() default {};
    }

    @Component
    public static class ValidAchievementSequenceValidator implements ConstraintValidator<ValidAchievementSequence, List<Long>> {

        @Autowired
        private AchievementRepository achievementRepository;

        @Override
        public boolean isValid(List<Long> prerequisiteIds, ConstraintValidatorContext context) {
            if (prerequisiteIds == null || prerequisiteIds.isEmpty()) {
                return true;
            }

            // Check if all prerequisites exist and are active
            for (Long prereqId : prerequisiteIds) {
                Achievement prereq = achievementRepository.findById(prereqId).orElse(null);
                if (prereq == null || !prereq.isActive()) {
                    return false;
                }
            }

            // Check for circular dependencies (simplified check)
            return prerequisiteIds.size() == prerequisiteIds.stream().distinct().count();
        }
    }
}