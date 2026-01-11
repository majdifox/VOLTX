package com.voltx.constants;

public final class SecurityConstants {

    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
    public static final String AUTHORITIES_KEY = "authorities";
    public static final String TOKEN_TYPE = "tokenType";
    public static final String ACCESS_TOKEN = "accessToken";
    public static final String REFRESH_TOKEN = "refreshToken";

    // Token expiration times (in milliseconds)
    public static final long ACCESS_TOKEN_EXPIRATION = 15 * 60 * 1000; // 15 minutes
    public static final long REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days

    // Minimum password requirements
    public static final int MIN_PASSWORD_LENGTH = 6;
    public static final int MIN_USERNAME_LENGTH = 3;
    public static final int MAX_USERNAME_LENGTH = 20;

    private SecurityConstants() {
        // Private constructor to prevent instantiation
    }
}