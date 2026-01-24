package com.voltx.util;

import java.util.regex.Pattern;

public final class ValidationUtils {

    // Email validation pattern (RFC 5322 compliant)
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@" +
        "(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$"
    );

    // Username validation (alphanumeric, underscore, dash, 3-20 chars)
    private static final Pattern USERNAME_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_-]{3,20}$"
    );

    // Strong password requirements
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
    );

    public static boolean isValidEmail(String email) {
        return StringUtils.isNotEmpty(email) && EMAIL_PATTERN.matcher(email).matches();
    }

    public static boolean isValidUsername(String username) {
        return StringUtils.isNotEmpty(username) && USERNAME_PATTERN.matcher(username).matches();
    }

    public static boolean isValidPassword(String password) {
        return StringUtils.isNotEmpty(password) && PASSWORD_PATTERN.matcher(password).matches();
    }

    public static boolean isValidName(String name) {
        return StringUtils.isNotEmpty(name) && 
               name.trim().length() >= 2 && 
               name.trim().length() <= 50;
    }

    public static String sanitizeInput(String input) {
        if (StringUtils.isEmpty(input)) {
            return input;
        }
        
        return input.trim()
                   .replaceAll("[<>\"'&]", "") // Remove potentially dangerous characters
                   .replaceAll("\s+", " ");   // Replace multiple spaces with single space
    }

    public static boolean isValidAdrenalinePoints(int points) {
        return points >= 0 && points <= 100000; // Reasonable upper limit
    }

    public static boolean isValidLevel(int level) {
        return level >= 1 && level <= 15; // Based on LEVELS configuration
    }

    private ValidationUtils() {}
}
