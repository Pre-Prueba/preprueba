import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, style, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: focused ? 'var(--blue)' : 'var(--text-2)',
              transition: 'color 0.15s',
              letterSpacing: '0.01em',
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          style={{
            background: 'var(--white)',
            border: `1.5px solid ${
              error ? 'var(--error)' : focused ? 'var(--blue)' : 'var(--border)'
            }`,
            borderRadius: 'var(--radius-md)',
            padding: '11px 14px',
            fontSize: '15px',
            fontFamily: 'var(--font-ui)',
            color: 'var(--text)',
            width: '100%',
            outline: 'none',
            boxShadow: focused && !error
              ? '0 0 0 3px rgba(0, 56, 188, 0.10)'
              : error
              ? '0 0 0 3px rgba(214, 69, 69, 0.10)'
              : 'none',
            transition: 'border-color 0.18s, box-shadow 0.18s',
            ...style,
          }}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          {...props}
        />
        {error && (
          <span style={{ fontSize: '12px', color: 'var(--error)', letterSpacing: '0.01em' }}>
            {error}
          </span>
        )}
        {hint && !error && (
          <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
