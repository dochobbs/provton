'use client';

import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { TrackLayout, StepContainer } from '@/components/layout';
import { useDocumentationProfile } from '@/context/ProfileContext';
import { docContrastivePairs, documentationSteps } from '@/data/documentationScenarios';

export default function DocumentationStep3() {
  const router = useRouter();
  const { profile, setPairSelections, setStep } = useDocumentationProfile();

  const handleNext = () => {
    setStep(4);
    router.push('/documentation/step-4');
  };

  const pairs = profile.pairSelections;
  const allSelected =
    pairs.pair3A.selected !== null &&
    pairs.pair3B.selected !== null &&
    pairs.pair3C.selected !== null &&
    pairs.pair3D.selected !== null &&
    pairs.pair3E.selected !== null &&
    pairs.pair3F.selected !== null;

  const handleSelect = (pairId: keyof typeof pairs, option: 'A' | 'B') => {
    const current = pairs[pairId];
    setPairSelections({
      [pairId]: { ...current, selected: option },
    });
  };

  const handleEdit = (pairId: keyof typeof pairs, edits: string | null) => {
    const current = pairs[pairId];
    setPairSelections({
      [pairId]: { ...current, edits },
    });
  };

  return (
    <TrackLayout
      trackTitle="Clinical Documentation"
      trackDescription="Capture your documentation style for clinical notes"
      steps={documentationSteps}
      currentStep={3}
    >
      <StepContainer
        title="Contrastive Pairs — Documentation Style"
        instructions="For each pair, select the version closer to how you'd document this. Edit if needed."
        currentStep={3}
        totalSteps={7}
        prevHref="/documentation/step-2"
        onNext={handleNext}
        nextLabel="Continue"
        isNextDisabled={!allSelected}
      >
        <div className="space-y-10">
          {docContrastivePairs.map((pair, index) => {
            const pairId = pair.id as keyof typeof pairs;
            const selection = pairs[pairId];

            return (
              <div key={pair.id} className="space-y-4 pb-8 border-b border-gray-200 last:border-0">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-[var(--deep-blue)] text-white text-xs font-medium rounded">
                      {pair.pairType}
                    </span>
                    <h3 className="text-lg font-medium text-[var(--charcoal)]">
                      {pair.title}
                    </h3>
                  </div>
                  <p className="text-sm text-[var(--gray)]">{pair.description}</p>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  {/* Option A */}
                  <button
                    onClick={() => handleSelect(pairId, 'A')}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${selection.selected === 'A'
                        ? 'border-[var(--mid-blue)] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[var(--charcoal)]">
                        Option A: {pair.optionALabel}
                      </span>
                      {selection.selected === 'A' && (
                        <span className="w-5 h-5 bg-[var(--mid-blue)] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>
                    <pre className="text-xs text-[var(--gray)] whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded overflow-x-auto">
                      {pair.optionA}
                    </pre>
                  </button>

                  {/* Option B */}
                  <button
                    onClick={() => handleSelect(pairId, 'B')}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${selection.selected === 'B'
                        ? 'border-[var(--mid-blue)] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[var(--charcoal)]">
                        Option B: {pair.optionBLabel}
                      </span>
                      {selection.selected === 'B' && (
                        <span className="w-5 h-5 bg-[var(--mid-blue)] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>
                    <pre className="text-xs text-[var(--gray)] whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded overflow-x-auto">
                      {pair.optionB}
                    </pre>
                  </button>
                </div>

                {/* Edit option */}
                {selection.selected && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
                      Would you change anything? (Optional)
                    </label>
                    <textarea
                      value={selection.edits || ''}
                      onChange={(e) => handleEdit(pairId, e.target.value || null)}
                      placeholder="Make any edits to better match your style..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--mid-blue)] focus:border-transparent resize-y text-xs text-[var(--charcoal)] font-mono"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
