import { useState, useCallback, useEffect } from 'react';

// Validation rule types
export type ValidationRule =
  | 'required'
  | 'email'
  | 'url'
  | 'phone'
  | 'number'
  | 'integer'
  | 'positive'
  | 'negative'
  | 'date'
  | { minLength: number }
  | { maxLength: number }
  | { min: number }
  | { max: number }
  | { pattern: RegExp; message?: string }
  | { custom: (value: any) => string | null; message?: string }
  | { oneOf: any[]; message?: string }
  | { notOneOf: any[]; message?: string };

export interface FieldConfig {
  rules?: ValidationRule[];
  validateOn?: 'change' | 'blur' | 'submit';
  transform?: (value: any) => any;
  dependencies?: string[];
}

export interface ValidationSchema {
  [fieldName: string]: FieldConfig;
}

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
}

export interface FormActions<T = Record<string, any>> {
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string | null) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  clearErrors: () => void;
  reset: (values?: Partial<T>) => void;
  validate: (field?: keyof T) => Promise<boolean>;
  validateAll: () => Promise<boolean>;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
}

// Built-in validation functions
const validators = {
  required: (value: any): string | null => {
    if (value === null || value === undefined || value === '' ||
        (Array.isArray(value) && value.length === 0)) {
      return 'This field is required';
    }
    return null;
  },

  email: (value: string): string | null => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  url: (value: string): string | null => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  phone: (value: string): string | null => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) ? null : 'Please enter a valid phone number';
  },

  number: (value: any): string | null => {
    if (value === null || value === undefined || value === '') return null;
    return isNaN(Number(value)) ? 'Please enter a valid number' : null;
  },

  integer: (value: any): string | null => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isInteger(num) ? null : 'Please enter a valid integer';
  },

  positive: (value: any): string | null => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return num > 0 ? null : 'Please enter a positive number';
  },

  negative: (value: any): string | null => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return num < 0 ? null : 'Please enter a negative number';
  },

  date: (value: string): string | null => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? 'Please enter a valid date' : null;
  }
};

// Validation runner
function runValidation(value: any, rule: ValidationRule, allValues?: Record<string, any>): string | null {
  if (typeof rule === 'string') {
    return validators[rule]?.(value) || null;
  }

  if ('minLength' in rule) {
    if (!value) return null;
    const length = typeof value === 'string' ? value.length : Array.isArray(value) ? value.length : 0;
    return length >= rule.minLength ? null : `Must be at least ${rule.minLength} characters long`;
  }

  if ('maxLength' in rule) {
    if (!value) return null;
    const length = typeof value === 'string' ? value.length : Array.isArray(value) ? value.length : 0;
    return length <= rule.maxLength ? null : `Must be no more than ${rule.maxLength} characters long`;
  }

  if ('min' in rule) {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return num >= rule.min ? null : `Must be at least ${rule.min}`;
  }

  if ('max' in rule) {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return num <= rule.max ? null : `Must be no more than ${rule.max}`;
  }

  if ('pattern' in rule) {
    if (!value) return null;
    return rule.pattern.test(String(value)) ? null : (rule.message || 'Invalid format');
  }

  if ('custom' in rule) {
    return rule.custom(value) || null;
  }

  if ('oneOf' in rule) {
    if (!value) return null;
    return rule.oneOf.includes(value) ? null : (rule.message || 'Invalid value');
  }

  if ('notOneOf' in rule) {
    if (!value) return null;
    return !rule.notOneOf.includes(value) ? null : (rule.message || 'Invalid value');
  }

  return null;
}

// Main form validation hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ValidationSchema = {}
) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    submitCount: 0
  });

  // Validate a single field
  const validateField = useCallback(async (field: keyof T, value?: any): Promise<string | null> => {
    const config = validationSchema[field as string];
    if (!config || !config.rules) return null;

    const fieldValue = value !== undefined ? value : state.values[field];
    const transformedValue = config.transform ? config.transform(fieldValue) : fieldValue;

    for (const rule of config.rules) {
      const error = runValidation(transformedValue, rule, state.values);
      if (error) {
        return error;
      }
    }

    return null;
  }, [validationSchema, state.values]);

  // Validate dependent fields
  const validateDependents = useCallback(async (field: keyof T): Promise<void> => {
    const dependentFields = Object.entries(validationSchema)
      .filter(([, config]) => config.dependencies?.includes(field as string))
      .map(([fieldName]) => fieldName as keyof T);

    if (dependentFields.length === 0) return;

    const errors: Partial<Record<keyof T, string>> = {};

    for (const dependentField of dependentFields) {
      const error = await validateField(dependentField);
      if (error) {
        errors[dependentField] = error;
      }
    }

    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        ...errors
      }
    }));
  }, [validationSchema, validateField]);

  // Actions
  const actions: FormActions<T> = {
    setValue: useCallback((field: keyof T, value: any) => {
      setState(prev => {
        const newValues = { ...prev.values, [field]: value };
        return { ...prev, values: newValues };
      });

      // Auto-validate on change if configured
      const config = validationSchema[field as string];
      if (config?.validateOn === 'change') {
        setTimeout(async () => {
          const error = await validateField(field, value);
          setState(prev => ({
            ...prev,
            errors: { ...prev.errors, [field]: error }
          }));
          await validateDependents(field);
        });
      }
    }, [validateField, validateDependents, validationSchema]),

    setValues: useCallback((values: Partial<T>) => {
      setState(prev => ({
        ...prev,
        values: { ...prev.values, ...values }
      }));
    }, []),

    setError: useCallback((field: keyof T, error: string | null) => {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: error }
      }));
    }, []),

    setErrors: useCallback((errors: Partial<Record<keyof T, string>>) => {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, ...errors }
      }));
    }, []),

    setTouched: useCallback((field: keyof T, touched = true) => {
      setState(prev => ({
        ...prev,
        touched: { ...prev.touched, [field]: touched }
      }));

      // Auto-validate on blur if configured
      if (touched) {
        const config = validationSchema[field as string];
        if (config?.validateOn === 'blur') {
          setTimeout(async () => {
            const error = await validateField(field);
            setState(prev => ({
              ...prev,
              errors: { ...prev.errors, [field]: error }
            }));
          });
        }
      }
    }, [validateField, validationSchema]),

    setFieldTouched: useCallback((field: keyof T, touched = true) => {
      setState(prev => ({
        ...prev,
        touched: { ...prev.touched, [field]: touched }
      }));
    }, []),

    clearErrors: useCallback(() => {
      setState(prev => ({ ...prev, errors: {} }));
    }, []),

    reset: useCallback((values?: Partial<T>) => {
      setState({
        values: { ...initialValues, ...values },
        errors: {},
        touched: {},
        isSubmitting: false,
        isValidating: false,
        submitCount: 0
      });
    }, [initialValues]),

    validate: useCallback(async (field?: keyof T): Promise<boolean> => {
      if (field) {
        const error = await validateField(field);
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, [field]: error }
        }));
        return !error;
      }

      return actions.validateAll();
    }, [validateField]),

    validateAll: useCallback(async (): Promise<boolean> => {
      setState(prev => ({ ...prev, isValidating: true }));

      const errors: Partial<Record<keyof T, string>> = {};
      const fields = Object.keys(validationSchema) as Array<keyof T>;

      for (const field of fields) {
        const error = await validateField(field);
        if (error) {
          errors[field] = error;
        }
      }

      setState(prev => ({
        ...prev,
        errors,
        isValidating: false
      }));

      return Object.keys(errors).length === 0;
    }, [validateField, validationSchema]),

    handleSubmit: useCallback((onSubmit: (values: T) => void | Promise<void>) => {
      return async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        setState(prev => ({
          ...prev,
          isSubmitting: true,
          submitCount: prev.submitCount + 1
        }));

        try {
          const isValid = await actions.validateAll();

          if (isValid) {
            await onSubmit(state.values);
          }
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setState(prev => ({ ...prev, isSubmitting: false }));
        }
      };
    }, [state.values, actions.validateAll])
  };

  return [state, actions] as const;
}

// Helper hook for field-level validation
export function useFieldValidation<T>(
  value: T,
  rules: ValidationRule[] = []
) {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async (val: T = value): Promise<boolean> => {
    setIsValidating(true);

    for (const rule of rules) {
      const validationError = runValidation(val, rule);
      if (validationError) {
        setError(validationError);
        setIsValidating(false);
        return false;
      }
    }

    setError(null);
    setIsValidating(false);
    return true;
  }, [value, rules]);

  return {
    error,
    isValidating,
    validate,
    isValid: !error && !isValidating
  };
}