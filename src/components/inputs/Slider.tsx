'use client';

interface SliderProps {
  label: string;
  description?: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export function Slider({
  label,
  description,
  leftLabel,
  rightLabel,
  value,
  min = 1,
  max = 5,
  step = 1,
  onChange,
}: SliderProps) {
  // Calculate percentage for gradient fill
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-[var(--charcoal)]">
          {label}
        </label>
        {description && (
          <p className="mt-1 text-xs text-[var(--gray)]">{description}</p>
        )}
      </div>

      <div className="space-y-2">
        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, var(--mid-blue) 0%, var(--mid-blue) ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
            }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-[var(--gray)]">
          <span>{leftLabel}</span>
          <span className="font-medium text-[var(--mid-blue)]">{value}</span>
          <span>{rightLabel}</span>
        </div>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: var(--mid-blue);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: var(--mid-blue);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
