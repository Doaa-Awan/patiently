import React from 'react';

export function Card({
  children,
  className = '',
  onClick,
  padding = 'md',
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-stone-100 shadow-sm ${
        paddings[padding]
      } ${className} ${
        onClick
          ? 'cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-md'
          : ''
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
