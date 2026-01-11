// Validation utility functions

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Username validation
export const isValidUsername = (username: string): boolean => {
  // 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Password strength validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Form validation schemas
export const loginSchema = {
  username: (value: string) => {
    if (!value.trim()) return 'Username is required';
    return null;
  },
  password: (value: string) => {
    if (!value) return 'Password is required';
    return null;
  }
};

export const registerSchema = {
  firstName: (value: string) => {
    if (!value.trim()) return 'First name is required';
    if (value.trim().length < 2) return 'First name must be at least 2 characters';
    return null;
  },
  lastName: (value: string) => {
    if (!value.trim()) return 'Last name is required';
    if (value.trim().length < 2) return 'Last name must be at least 2 characters';
    return null;
  },
  username: (value: string) => {
    if (!value.trim()) return 'Username is required';
    if (!isValidUsername(value)) return 'Username must be 3-20 characters, alphanumeric and underscore only';
    return null;
  },
  email: (value: string) => {
    if (!value.trim()) return 'Email is required';
    if (!isValidEmail(value)) return 'Please enter a valid email address';
    return null;
  },
  password: (value: string) => {
    const validation = validatePassword(value);
    if (!validation.isValid) return validation.errors[0];
    return null;
  },
  confirmPassword: (value: string, password: string) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return null;
  }
};

// Post validation
export const postSchema = {
  content: (value: string) => {
    if (!value.trim()) return 'Post content is required';
    if (value.trim().length > 2000) return 'Post content must be less than 2000 characters';
    return null;
  },
  location: (value?: string) => {
    if (value && value.length > 100) return 'Location must be less than 100 characters';
    return null;
  }
};

// Event validation
export const eventSchema = {
  title: (value: string) => {
    if (!value.trim()) return 'Event title is required';
    if (value.trim().length > 200) return 'Event title must be less than 200 characters';
    return null;
  },
  description: (value?: string) => {
    if (value && value.length > 2000) return 'Event description must be less than 2000 characters';
    return null;
  },
  location: (value: string) => {
    if (!value.trim()) return 'Event location is required';
    if (value.trim().length > 200) return 'Event location must be less than 200 characters';
    return null;
  },
  eventDate: (value: string) => {
    if (!value) return 'Event date is required';
    const eventDate = new Date(value);
    const now = new Date();
    if (eventDate <= now) return 'Event date must be in the future';
    return null;
  },
  maxParticipants: (value: number) => {
    if (!value || value < 2) return 'Event must allow at least 2 participants';
    if (value > 1000) return 'Event cannot have more than 1000 participants';
    return null;
  }
};