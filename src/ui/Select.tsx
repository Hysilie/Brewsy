import type { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export const Select = ({ label, children, className = '', ...props }: SelectProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-2 rounded-input border border-border bg-card text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-peach/30 focus:border-peach transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};
