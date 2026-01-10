'use client';

import { Check } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  description?: string;
}

interface MultiSelectProps {
  title: string;
  description?: string;
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  columns?: 1 | 2 | 3;
}

export function MultiSelect({
  title,
  description,
  options,
  selected,
  onToggle,
  columns = 2,
}: MultiSelectProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-[var(--charcoal)]">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-[var(--gray)]">{description}</p>
        )}
      </div>

      <div className={`grid grid-cols-1 ${gridCols[columns]} gap-3`}>
        {options.map((option) => {
          const isSelected = selected.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => onToggle(option.id)}
              className={`
                text-left p-4 rounded-lg border-2 transition-all flex items-start gap-3
                ${isSelected
                  ? 'border-[var(--mid-blue)] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Checkbox */}
              <div
                className={`
                  flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                  ${isSelected
                    ? 'bg-[var(--mid-blue)] border-[var(--mid-blue)]'
                    : 'border-gray-300 bg-white'
                  }
                `}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-[var(--charcoal)]">
                  {option.label}
                </span>
                {option.description && (
                  <p className="mt-1 text-sm text-[var(--gray)]">
                    {option.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-sm text-[var(--mid-blue)]">
          {selected.length} selected
        </p>
      )}
    </div>
  );
}
