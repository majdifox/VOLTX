package com.voltx.constants;

public final class ErrorMessages {

    // Authentication
    public static final String INVALID_CREDENTIALS = "Invalid username or password";
    public static final String USER_NOT_FOUND = "User not found";
    public static final String USER_ALREADY_EXISTS = "User already exists";
    public static final String USERNAME_TAKEN = "Username is already taken";
    public static final String EMAIL_TAKEN = "Email is already taken";
    public static final String TOKEN_EXPIRED = "Token has expired";
    public static final String TOKEN_INVALID = "Invalid token";

    // Validation
    public static final String FIELD_REQUIRED = "This field is required";
    public static final String INVALID_EMAIL = "Invalid email format";
    public static final String INVALID_USERNAME = "Username must be 3-20 characters, alphanumeric and underscore only";
    public static final String PASSWORD_TOO_SHORT = "Password must be at least 6 characters";
    public static final String PASSWORDS_NOT_MATCH = "Passwords do not match";

    // Authorization
    public static final String ACCESS_DENIED = "Access denied";
    public static final String ADMIN_REQUIRED = "Administrator access required";
    public static final String CANNOT_MODIFY_OWN_ROLE = "Cannot modify your own role";
    public static final String CANNOT_SUSPEND_ADMIN = "Cannot suspend administrator users";

    // Posts
    public static final String POST_NOT_FOUND = "Post not found";
    public static final String POST_ALREADY_LIKED = "Post already liked";
    public static final String POST_NOT_LIKED = "Post not liked yet";
    public static final String CANNOT_EDIT_POST = "You can only edit your own posts";

    // Events
    public static final String EVENT_NOT_FOUND = "Event not found";
    public static final String EVENT_FULL = "Event is full";
    public static final String ALREADY_JOINED = "Already joined this event";
    public static final String NOT_MEMBER = "Not a member of this event";
    public static final String CANNOT_EDIT_EVENT = "Only the organizer can edit this event";

    // File Upload
    public static final String FILE_TOO_LARGE = "File size exceeds maximum limit";
    public static final String INVALID_FILE_TYPE = "Invalid file type";
    public static final String FILE_UPLOAD_FAILED = "File upload failed";

    private ErrorMessages() {
        // Private constructor to prevent instantiation
    }
}