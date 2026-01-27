// Frontend validation utilities
export const validationUtils = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Username validation
  isValidUsername: (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  },

  // Password strength validation
  isValidPassword: (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Name validation
  isValidName: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 50;
  },

  // Required field validation
  isRequired: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number") return !isNaN(value);
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  // Length validation
  hasValidLength: (value: string, min: number, max?: number): boolean => {
    const length = value.trim().length;
    if (length < min) return false;
    if (max !== undefined && length > max) return false;
    return true;
  }
};

// Form validation helpers
export const formValidation = {
  // Validate form field with rules
  validateField: (
    value: any,
    rules: Array<{ validator: (val: any) => boolean; message: string; }>
  ): string | null => {
    for (const rule of rules) {
      if (!rule.validator(value)) {
        return rule.message;
      }
    }
    return null;
  },

  // Common validation rule builders
  rules: {
    required: (message = "This field is required") => ({
      validator: validationUtils.isRequired,
      message
    }),

    email: (message = "Please enter a valid email address") => ({
      validator: validationUtils.isValidEmail,
      message
    }),

    minLength: (min: number, message?: string) => ({
      validator: (value: string) => validationUtils.hasValidLength(value, min),
      message: message || `Must be at least ${min} characters`
    }),

    username: (message = "Username must be 3-20 characters") => ({
      validator: validationUtils.isValidUsername,
      message
    }),

    password: (message = "Password must meet strength requirements") => ({
      validator: validationUtils.isValidPassword,
      message
    })
  }
};
