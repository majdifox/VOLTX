import React from 'react';
import './Input.css';

interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  label,
  disabled = false,
  className = '',
  id,
}) => {
  return (
    <div className={`input-group ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input ${error ? 'input-error' : ''}`.trim()}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Input;