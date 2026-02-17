import React, { forwardRef } from 'react';
import { THEME } from '../../config/theme';

interface InputProps {
  label?: string;
  error?: string;
  helper?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'underlined';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  name?: string;
  maxLength?: number;
}


export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helper,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  fullWidth = false,
  size = 'md',
  variant = 'outlined',
  startIcon,
  endIcon,
  className = ''
}, ref) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-4 py-4 text-lg';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const getVariantStyles = () => {
    const baseStyles = `${getSizeStyles()} ${fullWidth ? 'w-full' : ''}`;
    
    switch (variant) {
      case 'filled':
        return `${baseStyles} bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-[${THEME.colors.primary}]`;
      case 'underlined':
        return `${baseStyles} bg-transparent border-0 border-b-2 border-gray-300 rounded-none focus:border-[${THEME.colors.primary}]`;
      default:
        return `${baseStyles} bg-white border-2 border-gray-300 rounded-lg focus:border-[${THEME.colors.primary}] focus:ring-2 focus:ring-[${THEME.colors.primary}]/20`;
    }
  };

  const inputId = React.useId();
  const hasError = !!error;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {startIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          className={`
            ${getVariantStyles()}
            ${startIcon ? 'pl-10' : ''}
            ${endIcon ? 'pr-10' : ''}
            ${hasError ? `border-[${THEME.colors.danger}] focus:border-[${THEME.colors.danger}] focus:ring-[${THEME.colors.danger}]/20` : ''}
            transition-all duration-200 ease-in-out
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
            focus:outline-none
            placeholder:text-gray-400
          `}
        />
        
        {endIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {endIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className={`mt-2 text-sm text-[${THEME.colors.danger}]`}>
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
