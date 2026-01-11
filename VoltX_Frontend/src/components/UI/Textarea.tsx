import React from 'react';
import './Textarea.css';

interface TextareaProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  id?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  value,
  onChange,
  error,
  label,
  disabled = false,
  rows = 4,
  maxLength,
  className = '',
  id,
}) => {
  return (
    <div className={`textarea-group ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="textarea-label">
          {label}
        </label>
      )}
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`textarea ${error ? 'textarea-error' : ''}`.trim()}
      />
      {maxLength && (
        <div className="textarea-counter">
          {value.length}/{maxLength}
        </div>
      )}
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Textarea;