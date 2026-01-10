'use client';

import { Check } from 'lucide-react';
import { AppLayout } from './AppLayout';

interface Step {
  number: number;
  title: string;
  shortTitle: string;
}

interface TrackLayoutProps {
  children: React.ReactNode;
  trackTitle: string;
  trackDescription: string;
  steps: Step[];
  currentStep: number;
}

export function TrackLayout({
  children,
  trackTitle,
  trackDescription,
  steps,
  currentStep,
}: TrackLayoutProps) {
  return (
    <AppLayout>
      {/* Track Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-[var(--mid-blue)] mb-2">
          {trackTitle}
        </h1>
        <p className="text-[var(--gray)]">{trackDescription}</p>
      </div>

      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Line Background */}
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 -z-10" />

          {/* Progress Line Fill */}
          <div
            className="absolute left-0 top-5 h-0.5 bg-[var(--orange)] -z-10 transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />

          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isPending = step.number > currentStep;

            return (
              <div key={step.number} className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${isCompleted ? 'bg-[var(--lime-green)] text-white' : ''}
                    ${isCurrent ? 'bg-[var(--orange)] text-white ring-4 ring-orange-100' : ''}
                    ${isPending ? 'bg-white border-2 border-gray-300 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`
                    mt-2 text-xs text-center max-w-[80px]
                    ${isCurrent ? 'text-[var(--charcoal)] font-medium' : 'text-[var(--gray)]'}
                  `}
                >
                  {step.shortTitle}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {children}
    </AppLayout>
  );
}
