import { useState, useCallback, useMemo } from 'react';

// Types for validation
export interface ValidationRule<T = any> {
  validate: (value: T, formData?: Record<string, any>) => string | null;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  info: Record<string, string[]>;
}

export interface FieldValidation {
  value: any;
  rules: ValidationRule[];
  required?: boolean;
  dependsOn?: string[];
}

export interface FormValidationConfig {
  fields: Record<string, FieldValidation>;
  crossFieldRules?: ValidationRule[];
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
  debounceMs?: number;
}

// Built-in validation rules
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      if (Array.isArray(value) && value.length === 0) {
        return message;
      }
      return null;
    },
    severity: 'error'
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string' && value.length < min) {
        return message || `Must be at least ${min} characters`;
      }
      return null;
    },
    severity: 'error'
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string' && value.length > max) {
        return message || `Must be no more than ${max} characters`;
      }
      return null;
    },
    severity: 'error'
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : message;
    },
    severity: 'error'
  }),

  strongPassword: (message = 'Password must contain at least 8 characters with uppercase, lowercase, number and special character'): ValidationRule => ({
    validate: (value) => {
      if (!value) return null;

      const checks = [
        { regex: /.{8,}/, message: 'at least 8 characters' },
        { regex: /[A-Z]/, message: 'uppercase letter' },
        { regex: /[a-z]/, message: 'lowercase letter' },
        { regex: /\d/, message: 'number' },
        { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, message: 'special character' }
      ];

      const failedChecks = checks.filter(check => !check.regex.test(value));

      if (failedChecks.length > 0) {
        return message;
      }

      return null;
    },
    severity: 'error'
  }),

  username: (message = 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'): ValidationRule => ({
    validate: (value) => {
      if (!value) return null;
      const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,28}[a-zA-Z0-9]$/;

      if (!usernameRegex.test(value)) {
        return message;
      }

      // Check for blocked words
      const blockedWords = ['admin', 'administrator', 'root', 'system', 'test', 'demo', 'support', 'help'];
      const lowerValue = value.toLowerCase();

      if (blockedWords.some(word => lowerValue.includes(word))) {
        return 'Username contains reserved words';
      }

      return null;
    },
    severity: 'error'
  }),

  phoneNumber: (message = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (value) => {
      if (!value) return null;
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      return phoneRegex.test(value.replace(/\s+/g, '')) ? null : message;
    },
    severity: 'error'
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    validate: (value) => {
      if (!value) return null;
      try {
        new URL(value);
        return null;
      } catch {
        return message;
      }
    },
    severity: 'error'
  }),

  number: (message = 'Please enter a valid number'): ValidationRule => ({
    validate: (value) => {
      if (!value) return null;
      return isNaN(Number(value)) ? message : null;
    },
    severity: 'error'
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined || value === '') return null;
      const num = Number(value);
      return isNaN(num) || num < min ? (message || `Must be at least ${min}`) : null;
    },
    severity: 'error'
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined || value === '') return null;
      const num = Number(value);
      return isNaN(num) || num > max ? (message || `Must be no more than ${max}`) : null;
    },
    severity: 'error'
  }),

  dateRange: (startField: string, endField: string, message = 'End date must be after start date'): ValidationRule => ({
    validate: (value, formData) => {
      if (!formData) return null;
      const startDate = new Date(formData[startField]);
      const endDate = new Date(formData[endField]);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

      return startDate >= endDate ? message : null;
    },
    severity: 'error'
  }),

  futureDate: (message = 'Date must be in the future'): ValidationRule => ({
    validate: (value) => {
      if (!value) return null;
      const date = new Date(value);
      const now = new Date();
      return date <= now ? message : null;
    },
    severity: 'error'
  }),

  businessHours: (startHour = 9, endHour = 18, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return null;
      const date = new Date(value);
      const hour = date.getHours();

      if (hour < startHour || hour >= endHour) {
        return message || `Must be between ${startHour}:00 and ${endHour}:00`;
      }

      return null;
    },
    severity: 'warning'
  }),

  match: (otherField: string, message?: string): ValidationRule => ({
    validate: (value, formData) => {
      if (!formData || !value) return null;
      const otherValue = formData[otherField];

      if (value !== otherValue) {
        return message || 'Fields do not match';
      }

      return null;
    },
    severity: 'error'
  }),

  unique: (existingValues: string[], message = 'This value already exists'): ValidationRule => ({
    validate: (value) => {
      if (!value) return null;
      return existingValues.includes(value) ? message : null;
    },
    severity: 'error'
  }),

  fileSize: (maxSizeBytes: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value || !(value instanceof File)) return null;

      if (value.size > maxSizeBytes) {
        const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
        return message || `File size must be less than ${maxSizeMB}MB`;
      }

      return null;
    },
    severity: 'error'
  }),

  fileType: (allowedTypes: string[], message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value || !(value instanceof File)) return null;

      if (!allowedTypes.includes(value.type)) {
        return message || `File type must be one of: ${allowedTypes.join(', ')}`;
      }

      return null;
    },
    severity: 'error'
  }),

  custom: (validator: (value: any, formData?: Record<string, any>) => string | null, severity: 'error' | 'warning' | 'info' = 'error'): ValidationRule => ({
    validate: validator,
    severity
  })
};

// Advanced form validation hook
export const useAdvancedValidation = (config: FormValidationConfig) => {
  const [validationState, setValidationState] = useState<Record<string, ValidationResult>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((fieldName: string, value: any, formData: Record<string, any>): ValidationResult => {
    const fieldConfig = config.fields[fieldName];
    if (!fieldConfig) {
      return { isValid: true, errors: {}, warnings: {}, info: {} };
    }

    const result: ValidationResult = {
      isValid: true,
      errors: {},
      warnings: {},
      info: {}
    };

    // Check required validation
    if (fieldConfig.required && (value === null || value === undefined || value === '')) {
      result.errors[fieldName] = ['This field is required'];
      result.isValid = false;
    }

    // Run field-specific rules
    for (const rule of fieldConfig.rules) {
      const error = rule.validate(value, formData);
      if (error) {
        const severity = rule.severity || 'error';
        if (!result[severity === 'error' ? 'errors' : severity === 'warning' ? 'warnings' : 'info'][fieldName]) {
          result[severity === 'error' ? 'errors' : severity === 'warning' ? 'warnings' : 'info'][fieldName] = [];
        }
        result[severity === 'error' ? 'errors' : severity === 'warning' ? 'warnings' : 'info'][fieldName].push(error);

        if (severity === 'error') {
          result.isValid = false;
        }
      }
    }

    return result;
  }, [config]);

  const validateForm = useCallback((formData: Record<string, any>): ValidationResult => {
    const result: ValidationResult = {
      isValid: true,
      errors: {},
      warnings: {},
      info: {}
    };

    // Validate all fields
    for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
      const value = formData[fieldName];
      const fieldResult = validateField(fieldName, value, formData);

      // Merge results
      Object.assign(result.errors, fieldResult.errors);
      Object.assign(result.warnings, fieldResult.warnings);
      Object.assign(result.info, fieldResult.info);

      if (!fieldResult.isValid) {
        result.isValid = false;
      }
    }

    // Run cross-field validation
    if (config.crossFieldRules) {
      for (const rule of config.crossFieldRules) {
        const error = rule.validate(formData, formData);
        if (error) {
          const severity = rule.severity || 'error';
          const targetArray = severity === 'error' ? result.errors : severity === 'warning' ? result.warnings : result.info;

          if (!targetArray.crossField) {
            targetArray.crossField = [];
          }
          targetArray.crossField.push(error);

          if (severity === 'error') {
            result.isValid = false;
          }
        }
      }
    }

    return result;
  }, [config, validateField]);

  const validateFieldAsync = useCallback(async (fieldName: string, value: any, formData: Record<string, any>) => {
    // Add debouncing if configured
    if (config.debounceMs) {
      await new Promise(resolve => setTimeout(resolve, config.debounceMs));
    }

    const result = validateField(fieldName, value, formData);
    setValidationState(prev => ({
      ...prev,
      [fieldName]: result
    }));

    return result;
  }, [validateField, config.debounceMs]);

  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationState(prev => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
    } else {
      setValidationState({});
    }
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const fieldValidation = validationState[fieldName];
    if (fieldValidation?.errors[fieldName]?.length > 0) {
      return fieldValidation.errors[fieldName][0];
    }
    return undefined;
  }, [validationState]);

  const getFieldWarning = useCallback((fieldName: string): string | undefined => {
    const fieldValidation = validationState[fieldName];
    if (fieldValidation?.warnings[fieldName]?.length > 0) {
      return fieldValidation.warnings[fieldName][0];
    }
    return undefined;
  }, [validationState]);

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return Boolean(getFieldError(fieldName));
  }, [getFieldError]);

  const isFormValid = useMemo(() => {
    return Object.values(validationState).every(result => result.isValid);
  }, [validationState]);

  const formErrors = useMemo(() => {
    const errors: Record<string, string[]> = {};
    Object.values(validationState).forEach(result => {
      Object.assign(errors, result.errors);
    });
    return errors;
  }, [validationState]);

  return {
    validateField: validateFieldAsync,
    validateForm,
    clearValidation,
    getFieldError,
    getFieldWarning,
    hasFieldError,
    isFormValid,
    formErrors,
    validationState,
    isSubmitting,
    setIsSubmitting
  };
};

// Validation provider component for complex forms
export const ValidationProvider: React.FC<{
  config: FormValidationConfig;
  children: (validation: ReturnType<typeof useAdvancedValidation>) => React.ReactNode;
}> = ({ config, children }) => {
  const validation = useAdvancedValidation(config);
  return <>{children(validation)}</>;
};

// Utility functions for common validation scenarios
export const ValidationHelpers = {
  createPasswordStrengthConfig: () => ({
    fields: {
      password: {
        value: '',
        rules: [
          ValidationRules.strongPassword(),
          ValidationRules.minLength(8),
          ValidationRules.maxLength(128)
        ],
        required: true
      },
      confirmPassword: {
        value: '',
        rules: [
          ValidationRules.match('password', 'Passwords do not match')
        ],
        required: true,
        dependsOn: ['password']
      }
    }
  }),

  createUserRegistrationConfig: (existingUsernames: string[] = [], existingEmails: string[] = []) => ({
    fields: {
      firstName: {
        value: '',
        rules: [
          ValidationRules.minLength(2),
          ValidationRules.maxLength(50),
          ValidationRules.custom((value) =>
            /^[a-zA-Z\s\-']+$/.test(value) ? null : 'Only letters, spaces, hyphens, and apostrophes allowed'
          )
        ],
        required: true
      },
      lastName: {
        value: '',
        rules: [
          ValidationRules.minLength(2),
          ValidationRules.maxLength(50),
          ValidationRules.custom((value) =>
            /^[a-zA-Z\s\-']+$/.test(value) ? null : 'Only letters, spaces, hyphens, and apostrophes allowed'
          )
        ],
        required: true
      },
      username: {
        value: '',
        rules: [
          ValidationRules.username(),
          ValidationRules.unique(existingUsernames, 'Username is already taken'),
          ValidationRules.minLength(3),
          ValidationRules.maxLength(30)
        ],
        required: true
      },
      email: {
        value: '',
        rules: [
          ValidationRules.email(),
          ValidationRules.unique(existingEmails, 'Email is already registered')
        ],
        required: true
      }
    }
  }),

  createActivityConfig: () => ({
    fields: {
      title: {
        value: '',
        rules: [
          ValidationRules.minLength(5),
          ValidationRules.maxLength(100),
          ValidationRules.custom((value) => {
            const wordCount = value?.trim().split(/\s+/).length || 0;
            return wordCount >= 2 && wordCount <= 10 ? null : 'Title must contain 2-10 words';
          })
        ],
        required: true
      },
      description: {
        value: '',
        rules: [
          ValidationRules.minLength(20),
          ValidationRules.maxLength(1000)
        ],
        required: true
      },
      activityDate: {
        value: '',
        rules: [
          ValidationRules.futureDate(),
          ValidationRules.businessHours(8, 20, 'Activities should be scheduled between 8 AM and 8 PM')
        ],
        required: true
      },
      maxParticipants: {
        value: 1,
        rules: [
          ValidationRules.number(),
          ValidationRules.min(1),
          ValidationRules.max(100)
        ],
        required: true
      }
    },
    crossFieldRules: [
      ValidationRules.custom((formData) => {
        const currentParticipants = Number(formData.currentParticipants) || 0;
        const maxParticipants = Number(formData.maxParticipants) || 0;

        if (currentParticipants > maxParticipants) {
          return 'Current participants cannot exceed maximum participants';
        }

        return null;
      })
    ]
  })
};