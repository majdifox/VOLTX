package com.voltx.constants;

public final class ValidationConstants {

    // Field lengths
    public static final int MAX_FIRST_NAME_LENGTH = 50;
    public static final int MAX_LAST_NAME_LENGTH = 50;
    public static final int MAX_USERNAME_LENGTH = 20;
    public static final int MIN_USERNAME_LENGTH = 3;
    public static final int MAX_EMAIL_LENGTH = 100;
    public static final int MAX_BIO_LENGTH = 500;
    public static final int MAX_POST_CONTENT_LENGTH = 2000;
    public static final int MAX_EVENT_TITLE_LENGTH = 200;
    public static final int MAX_EVENT_DESCRIPTION_LENGTH = 2000;
    public static final int MAX_LOCATION_LENGTH = 200;

    // File upload
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    public static final String[] ALLOWED_IMAGE_TYPES = {
        "image/jpeg", "image/jpg", "image/png", "image/gif"
    };

    // Regex patterns
    public static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    public static final String USERNAME_PATTERN = "^[a-zA-Z0-9_]{3,20}$";

    private ValidationConstants() {
        // Private constructor to prevent instantiation
    }
}