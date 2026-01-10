import React from 'react';

export function Input({
  label,
  error,
  className = '',
  id,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-stone-700 mb-1.5"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`
          flex h-11 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className = '',
  id,
  ...props
}) {
  const textareaId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-stone-700 mb-1.5"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        className={`
          flex min-h-[80px] w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
