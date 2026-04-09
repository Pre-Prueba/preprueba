import { InputHTMLAttributes, forwardRef, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, style, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          style={{
            background: 'var(--color-white)',
            border: `1.5px solid ${error ? 'var(--color-error)' : focused ? 'var(--color-persian-blue)' : 'var(--color-border)'}`,
            borderRadius: '10px',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text)',
            width: '100%',
            outline: 'none',
            boxShadow: focused && !error ? '0 0 0 3px rgba(0,56,188,0.12)' : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            ...style,
          }}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          {...props}
        />
        {error && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
