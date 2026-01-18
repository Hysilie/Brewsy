import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses = 'font-semibold rounded-soft transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-peach to-lavender hover:from-peach-dark hover:to-lavender-dark text-white shadow-soft',
    secondary: 'bg-surface hover:bg-surface-hover text-text border border-border',
    outline: 'border-2 border-peach text-peach hover:bg-peach-light',
    danger: 'bg-peach hover:bg-peach-dark text-white shadow-soft',
  };

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
