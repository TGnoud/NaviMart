import { useState, useRef, useEffect } from 'react';

export type Option = {
  value: string;
  label: string;
};

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  menuClassName?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder = 'Chọn...', className = '', menuClassName = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full px-4 flex items-center justify-between outline-none appearance-none cursor-pointer"
      >
        <span className="truncate pr-2">
          {selectedOption ? selectedOption.label : <span className="text-on-surface-variant opacity-70">{placeholder}</span>}
        </span>
        <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg max-h-60 overflow-y-auto ${menuClassName}`}>
          <ul className="py-2">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 font-body-md text-body-md transition-colors ${
                    value === option.value
                      ? 'bg-primary-container text-on-primary-container font-bold'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-4 py-3 text-on-surface-variant text-center font-body-sm text-body-sm">
                Không có dữ liệu
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
