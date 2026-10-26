// InputField.jsx — Reusable controlled input component with validation styling

import './InputField.css';

function InputField({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  onKeyDown,
  onBlur,
  placeholder,
  error,
  helperText,
  icon,
  disabled = false,
  required = false,
  className = '',
  autoComplete = 'off',
}) {
  return (
    <div className={`form-field-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}

      <div className="input-wrapper">
        {icon && <span className="input-icon-prefix">{icon}</span>}
        <input
          id={id}
          name={name || id}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={`reusable-input ${icon ? 'has-prefix' : ''} ${error ? 'input-error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>

      {error && (
        <p id={`${id}-error`} className="field-error-message" role="alert">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="field-helper-message">{helperText}</p>
      )}
    </div>
  );
}

export default InputField;
