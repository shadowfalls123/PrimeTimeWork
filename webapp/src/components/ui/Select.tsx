import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '../../util/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  required?: boolean;
  className?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    label,
    error,
    helperText,
    disabled = false,
    multiple = false,
    searchable = false,
    required = false,
    className,
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = searchable
      ? options.filter(option =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    const selectedOptions = multiple
      ? options.filter(option => Array.isArray(value) && value.includes(option.value))
      : options.find(option => option.value === value);

    const displayValue = multiple
      ? Array.isArray(selectedOptions) && selectedOptions.length > 0
        ? selectedOptions.length === 1
          ? selectedOptions[0].label
          : `${selectedOptions.length} selected`
        : placeholder
      : selectedOptions
        ? (selectedOptions as SelectOption).label
        : placeholder;

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    const handleOptionClick = (optionValue: string) => {
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(optionValue)
          ? currentValues.filter(v => v !== optionValue)
          : [...currentValues, optionValue];
        onChange(newValues);
      } else {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const isSelected = (optionValue: string) => {
      return multiple
        ? Array.isArray(value) && value.includes(optionValue)
        : value === optionValue;
    };

    return (
      <div className={cn('w-full', className)} ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative" ref={selectRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'relative w-full rounded-lg border px-3 py-2 text-left shadow-sm transition-colors duration-200 focus:outline-none focus:ring-1',
              'bg-white text-gray-900',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-sage-500 focus:ring-sage-500',
              disabled && 'cursor-not-allowed bg-gray-50 text-gray-500',
              'hover:border-gray-400'
            )}
          >
            <span className={cn(
              'block truncate',
              !selectedOptions && 'text-gray-400'
            )}>
              {displayValue}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </span>
          </button>

          {isOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-lg bg-white shadow-lg border border-gray-200 max-h-60 overflow-auto">
              {searchable && (
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search options..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sage-500 focus:border-sage-500"
                    />
                  </div>
                </div>
              )}

              <div className="py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {searchTerm ? 'No options found' : 'No options available'}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => !option.disabled && handleOptionClick(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        'relative w-full px-3 py-2 text-left text-sm transition-colors duration-150',
                        'hover:bg-sage-50 focus:bg-sage-50 focus:outline-none',
                        isSelected(option.value) && 'bg-sage-100 text-sage-900',
                        option.disabled && 'cursor-not-allowed text-gray-400'
                      )}
                    >
                      <span className="block truncate">{option.label}</span>
                      {isSelected(option.value) && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Check className="h-4 w-4 text-sage-600" />
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };