'use client';

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface StepContainerProps {
  children: React.ReactNode;
  title: string;
  instructions?: string;
  currentStep: number;
  totalSteps: number;
  prevHref?: string;
  nextHref?: string;
  onNext?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isLoading?: boolean;
}

export function StepContainer({
  children,
  title,
  instructions,
  currentStep,
  totalSteps,
  prevHref,
  nextHref,
  onNext,
  nextLabel = 'Continue',
  isNextDisabled = false,
  isLoading = false,
}: StepContainerProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Card Header with Sky Blue accent */}
      <div className="border-l-4 border-[var(--sky-blue)] bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-light text-[var(--mid-blue)]">{title}</h2>
            <p className="text-sm text-[var(--gray)]">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {instructions && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-[var(--deep-blue)] italic">{instructions}</p>
        </div>
      )}

      {/* Content */}
      <div className="p-6">{children}</div>

      {/* Navigation */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        {prevHref ? (
          <Link
            href={prevHref}
            className="flex items-center gap-2 text-[var(--gray)] hover:text-[var(--charcoal)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        ) : (
          <div />
        )}

        {nextHref ? (
          <Link
            href={nextHref}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-all
              ${isNextDisabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[var(--orange)] text-white hover:bg-[var(--bright-orange)]'
              }
            `}
            onClick={(e) => {
              if (isNextDisabled) {
                e.preventDefault();
              }
            }}
          >
            <span>{nextLabel}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : onNext ? (
          <button
            onClick={onNext}
            disabled={isNextDisabled || isLoading}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-all
              ${isNextDisabled || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[var(--orange)] text-white hover:bg-[var(--bright-orange)]'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{nextLabel}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
