import React, { forwardRef, useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Base input props interface
interface BaseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'bordered';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

// Enhanced Input Component
export const EnhancedInput = forwardRef<HTMLInputElement, BaseInputProps>(({
  label,
  error,
  hint,
  success,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  loading,
  fullWidth = true,
  className = '',
  disabled,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const variantClasses = {
    default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
    filled: 'border-0 bg-gray-100 dark:bg-gray-700',
    bordered: 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
  };

  const stateClasses = error
    ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500'
    : success
    ? 'border-green-500 dark:border-green-400 focus:border-green-500 focus:ring-green-500'
    : 'focus:border-primary focus:ring-primary';

  const baseClasses = `
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${stateClasses}
    rounded-lg transition-colors duration-200
    placeholder-gray-500 dark:placeholder-gray-400
    text-gray-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
    ${leftIcon ? 'pl-12' : ''}
    ${rightIcon ? 'pr-12' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          className={baseClasses}
          disabled={disabled || loading}
          {...props}
        />

        {(rightIcon || loading || error || success) && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {loading ? (
              <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full" />
            ) : error ? (
              <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
            ) : success ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            ) : rightIcon}
          </div>
        )}
      </div>

      {(error || hint) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}
          {hint && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
});

EnhancedInput.displayName = 'EnhancedInput';

// Password Input Component
interface PasswordInputProps extends Omit<BaseInputProps, 'type'> {
  showStrength?: boolean;
  strengthRules?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  };
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  showStrength = false,
  strengthRules = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');

  const calculateStrength = (password: string): number => {
    let score = 0;
    const rules = strengthRules;

    if (password.length >= (rules.minLength || 8)) score += 1;
    if (rules.requireUppercase && /[A-Z]/.test(password)) score += 1;
    if (rules.requireLowercase && /[a-z]/.test(password)) score += 1;
    if (rules.requireNumbers && /\d/.test(password)) score += 1;
    if (rules.requireSpecialChars && /[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    return score;
  };

  const getStrengthText = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'Very Weak';
      case 2:
        return 'Weak';
      case 3:
        return 'Fair';
      case 4:
        return 'Good';
      case 5:
        return 'Strong';
      default:
        return '';
    }
  };

  const getStrengthColor = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-blue-500';
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  useEffect(() => {
    if (showStrength && props.value) {
      const score = calculateStrength(String(props.value));
      setStrength(score);
      setStrengthText(getStrengthText(score));
    }
  }, [props.value, showStrength, strengthRules]);

  return (
    <div>
      <EnhancedInput
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        }
        {...props}
      />

      {showStrength && props.value && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Password Strength:
            </span>
            <span className={`text-sm font-medium ${
              strength <= 2 ? 'text-red-600' :
              strength <= 3 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {strengthText}
            </span>
          </div>

          <div className="flex space-x-1">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index < strength ? getStrengthColor(strength) : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

// Textarea Component
interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'bordered';
  showCount?: boolean;
  maxLength?: number;
  fullWidth?: boolean;
  autoResize?: boolean;
}

export const EnhancedTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  success,
  size = 'md',
  variant = 'default',
  showCount = false,
  maxLength,
  fullWidth = true,
  autoResize = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const variantClasses = {
    default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
    filled: 'border-0 bg-gray-100 dark:bg-gray-700',
    bordered: 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
  };

  const stateClasses = error
    ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500'
    : success
    ? 'border-green-500 dark:border-green-400 focus:border-green-500 focus:ring-green-500'
    : 'focus:border-primary focus:ring-primary';

  const baseClasses = `
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${stateClasses}
    rounded-lg transition-colors duration-200
    placeholder-gray-500 dark:placeholder-gray-400
    text-gray-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
    ${autoResize ? 'resize-none' : 'resize-vertical'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const currentLength = String(props.value || '').length;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <textarea
          ref={ref}
          className={baseClasses}
          disabled={disabled}
          maxLength={maxLength}
          {...props}
        />

        {(error || success) && (
          <div className="absolute right-4 top-4 text-gray-400">
            {error ? (
              <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
            ) : success ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            ) : null}
          </div>
        )}
      </div>

      <div className="flex justify-between items-start mt-2">
        <div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <ExclamationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
              {error}
            </p>
          )}
          {hint && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
          )}
        </div>

        {showCount && (
          <div className="text-sm text-gray-500 dark:text-gray-400 ml-4">
            {currentLength}{maxLength && `/${maxLength}`}
          </div>
        )}
      </div>
    </div>
  );
});

EnhancedTextarea.displayName = 'EnhancedTextarea';

// Select Component
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'bordered';
  placeholder?: string;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  fullWidth?: boolean;
  loading?: boolean;
}

export const EnhancedSelect = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  success,
  size = 'md',
  variant = 'default',
  placeholder,
  options,
  fullWidth = true,
  loading,
  className = '',
  disabled,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const variantClasses = {
    default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
    filled: 'border-0 bg-gray-100 dark:bg-gray-700',
    bordered: 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
  };

  const stateClasses = error
    ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500'
    : success
    ? 'border-green-500 dark:border-green-400 focus:border-green-500 focus:ring-green-500'
    : 'focus:border-primary focus:ring-primary';

  const baseClasses = `
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${stateClasses}
    rounded-lg transition-colors duration-200
    text-gray-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
    pr-12
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          className={baseClasses}
          disabled={disabled || loading}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full" />
          ) : error ? (
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
          ) : success ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {(error || hint) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}
          {hint && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
});

EnhancedSelect.displayName = 'EnhancedSelect';