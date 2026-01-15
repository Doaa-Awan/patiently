import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({
  label,
  options,
  error,
  className = '',
  id,
  value,
  defaultValue,
  name,
  disabled,
  onChange,
  ...props
}) {
  const selectId = id || name;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? options[0]?.value ?? ''
  );
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const currentValue = isControlled ? value : internalValue;
  const selectedOption =
    options.find(
      (option) => String(option.value) === String(currentValue)
    ) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    if (!isControlled) {
      setInternalValue(optionValue);
    }
    if (onChange) {
      onChange({
        target: {
          value: optionValue,
          name,
          id: selectId,
        },
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-stone-700 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={selectId}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`
            flex h-12 w-full items-center justify-between rounded-xl border border-stone-200 bg-white px-4 text-base text-stone-800 shadow-sm ring-offset-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:text-sm sm:px-3
            ${error ? 'border-red-500 focus-visible:ring-red-500' : 'hover:border-stone-300'}
            ${className}
          `}
          {...props}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : 'Select'}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-stone-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <input type="hidden" name={name} value={currentValue ?? ''} />

        {isOpen && (
          <div
            className="absolute z-50 mt-2 w-full rounded-xl border border-stone-200 bg-white shadow-lg max-h-60 overflow-auto"
            role="listbox"
            aria-labelledby={selectId}
          >
            {options.map((option) => {
              const isSelected =
                String(option.value) === String(currentValue);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center px-4 py-2.5 text-left text-base transition sm:text-sm sm:py-2 ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
