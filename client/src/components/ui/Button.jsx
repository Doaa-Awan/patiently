import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm hover:shadow',
    secondary:
      'bg-stone-100 text-stone-900 hover:bg-stone-200 focus:ring-stone-500 border border-stone-200',
    ghost:
      'bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus:ring-stone-500',
    danger:
      'bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-14 px-6 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}

      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}

      {children}

      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
}
