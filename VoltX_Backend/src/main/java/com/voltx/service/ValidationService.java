package com.voltx.service;

import com.voltx.enums.AccountStatus;
import com.voltx.enums.Role;
import com.voltx.exception.VoltXException;
import com.voltx.util.StringUtils;
import com.voltx.util.ValidationUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ValidationService {

    // User validation methods
    public void validateUserRegistration(String firstName, String lastName, String username, String email, String password) {
        validateName(firstName, "First name");
        validateName(lastName, "Last name");
        validateUsername(username);
        validateEmail(email);
        validatePassword(password);
    }

    public void validateName(String name, String fieldName) {
        if (StringUtils.isEmpty(name)) {
            throw new VoltXException(fieldName + " is required", HttpStatus.BAD_REQUEST);
        }

        if (name.trim().length() < 2) {
            throw new VoltXException(fieldName + " must be at least 2 characters long", HttpStatus.BAD_REQUEST);
        }

        if (name.trim().length() > 50) {
            throw new VoltXException(fieldName + " cannot exceed 50 characters", HttpStatus.BAD_REQUEST);
        }

        // Check for valid characters (letters, spaces, hyphens, apostrophes)
        if (!name.matches("^[a-zA-Z\\s\\-']+$")) {
            throw new VoltXException(fieldName + " can only contain letters, spaces, hyphens, and apostrophes", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateUsername(String username) {
        if (!ValidationUtils.isValidUsername(username)) {
            throw new VoltXException("Username must be 3-20 characters long and contain only letters, numbers, underscores, and dashes", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateEmail(String email) {
        if (!ValidationUtils.isValidEmail(email)) {
            throw new VoltXException("Please provide a valid email address", HttpStatus.BAD_REQUEST);
        }
    }

    public void validatePassword(String password) {
        if (!ValidationUtils.isValidPassword(password)) {
            throw new VoltXException("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character", HttpStatus.BAD_REQUEST);
        }
    }

    // Gamification validation
    public void validateAdrenalinePoints(int points) {
        if (!ValidationUtils.isValidAdrenalinePoints(points)) {
            throw new VoltXException("Adrenaline points must be between 0 and 100,000", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateLevel(int level) {
        if (!ValidationUtils.isValidLevel(level)) {
            throw new VoltXException("Level must be between 1 and 15", HttpStatus.BAD_REQUEST);
        }
    }

    // Role and status validation
    public void validateRole(Role role) {
        if (role == null) {
            throw new VoltXException("Role is required", HttpStatus.BAD_REQUEST);
        }

        List<Role> allowedRoles = List.of(Role.EXPLORER, Role.CHALLENGER, Role.MARSHAL, Role.CAPTAIN, Role.ADMIN);
        if (!allowedRoles.contains(role)) {
            throw new VoltXException("Invalid role specified", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateAccountStatus(AccountStatus status) {
        if (status == null) {
            throw new VoltXException("Account status is required", HttpStatus.BAD_REQUEST);
        }

        List<AccountStatus> allowedStatuses = List.of(AccountStatus.ACTIVE, AccountStatus.SUSPENDED, AccountStatus.BANNED);
        if (!allowedStatuses.contains(status)) {
            throw new VoltXException("Invalid account status specified", HttpStatus.BAD_REQUEST);
        }
    }

    // Business logic validation
    public void validateRoleChangePermission(Role currentUserRole, Role targetUserRole, Role newRole) {
        // Only admins can change roles
        if (currentUserRole != Role.ADMIN) {
            throw new VoltXException("Only administrators can change user roles", HttpStatus.FORBIDDEN);
        }

        // Admins cannot demote themselves
        if (currentUserRole == Role.ADMIN && targetUserRole == Role.ADMIN && newRole != Role.ADMIN) {
            throw new VoltXException("Administrators cannot demote themselves", HttpStatus.BAD_REQUEST);
        }

        // Cannot promote to admin (business rule)
        if (newRole == Role.ADMIN && targetUserRole != Role.ADMIN) {
            throw new VoltXException("New administrators must be promoted through a different process", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateStatusChangePermission(Role currentUserRole, AccountStatus currentStatus, AccountStatus newStatus) {
        // Only captains and admins can change account status
        if (currentUserRole != Role.CAPTAIN && currentUserRole != Role.ADMIN) {
            throw new VoltXException("Only captains and administrators can change account status", HttpStatus.FORBIDDEN);
        }

        // Cannot ban/suspend admins
        if (currentStatus == AccountStatus.ACTIVE && (newStatus == AccountStatus.SUSPENDED || newStatus == AccountStatus.BANNED)) {
            throw new VoltXException("Cannot suspend or ban administrator accounts", HttpStatus.BAD_REQUEST);
        }

        // Suspended users can only be activated or banned
        if (currentStatus == AccountStatus.SUSPENDED && newStatus != AccountStatus.ACTIVE && newStatus != AccountStatus.BANNED) {
            throw new VoltXException("Suspended users can only be activated or banned", HttpStatus.BAD_REQUEST);
        }
    }

    // Pagination validation
    public void validatePaginationParams(int page, int size) {
        if (page < 0) {
            throw new VoltXException("Page number cannot be negative", HttpStatus.BAD_REQUEST);
        }

        if (size <= 0) {
            throw new VoltXException("Page size must be positive", HttpStatus.BAD_REQUEST);
        }

        if (size > 100) {
            throw new VoltXException("Page size cannot exceed 100", HttpStatus.BAD_REQUEST);
        }
    }

    // Search validation
    public void validateSearchQuery(String query) {
        if (StringUtils.isEmpty(query)) {
            throw new VoltXException("Search query cannot be empty", HttpStatus.BAD_REQUEST);
        }

        if (query.trim().length() < 2) {
            throw new VoltXException("Search query must be at least 2 characters long", HttpStatus.BAD_REQUEST);
        }

        if (query.length() > 100) {
            throw new VoltXException("Search query cannot exceed 100 characters", HttpStatus.BAD_REQUEST);
        }
    }

    // Date validation
    public void validateDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            if (startDate.isAfter(endDate)) {
                throw new VoltXException("Start date cannot be after end date", HttpStatus.BAD_REQUEST);
            }

            if (startDate.isAfter(LocalDateTime.now())) {
                throw new VoltXException("Start date cannot be in the future", HttpStatus.BAD_REQUEST);
            }
        }
    }

    // Generic validation helpers
    public void validateRequired(Object value, String fieldName) {
        if (value == null) {
            throw new VoltXException(fieldName + " is required", HttpStatus.BAD_REQUEST);
        }

        if (value instanceof String && StringUtils.isEmpty((String) value)) {
            throw new VoltXException(fieldName + " cannot be empty", HttpStatus.BAD_REQUEST);
        }
    }

    public void validateRange(int value, int min, int max, String fieldName) {
        if (value < min || value > max) {
            throw new VoltXException(fieldName + " must be between " + min + " and " + max, HttpStatus.BAD_REQUEST);
        }
    }

    public void validatePermissions(Role userRole, List<Role> requiredRoles) {
        if (!requiredRoles.contains(userRole)) {
            throw new VoltXException("Insufficient permissions to perform this action", HttpStatus.FORBIDDEN);
        }
    }
}