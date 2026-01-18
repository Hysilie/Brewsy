import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-200 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2 rounded-input border ${
            error
              ? 'border-peach-dark focus:ring-peach-dark'
              : 'border-border focus:ring-peach/30'
          } bg-card text-text focus:outline-none focus:ring-2 focus:border-peach shadow-sm transition-all ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
