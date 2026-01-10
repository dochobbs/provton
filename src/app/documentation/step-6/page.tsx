'use client';

import { useRouter } from 'next/navigation';
import { TrackLayout, StepContainer } from '@/components/layout';
import { Slider } from '@/components/inputs';
import { useDocumentationProfile } from '@/context/ProfileContext';
import {
  docSliderQuestions,
  docSituationQuestions,
  documentationSteps,
} from '@/data/documentationScenarios';

export default function DocumentationStep6() {
  const router = useRouter();
  const { profile, setValues, setStep } = useDocumentationProfile();

  const handleNext = () => {
    setStep(7);
    router.push('/documentation/step-7');
  };

  return (
    <TrackLayout
      trackTitle="Clinical Documentation"
      trackDescription="Capture your documentation style for clinical notes"
      steps={documentationSteps}
      currentStep={6}
    >
      <StepContainer
        title="Values Calibration — Documentation Philosophy"
        instructions="These questions help us understand how you think about documentation."
        currentStep={6}
        totalSteps={7}
        prevHref="/documentation/step-5"
        onNext={handleNext}
        nextLabel="Continue"
      >
        <div className="space-y-10">
          {/* Sliders */}
          <div className="space-y-8">
            {docSliderQuestions.map((q) => (
              <Slider
                key={q.id}
                label={q.label}
                leftLabel={q.leftLabel}
                rightLabel={q.rightLabel}
                value={profile.values[q.id as keyof typeof profile.values] as number}
                min={1}
                max={10}
                onChange={(value) => setValues({ [q.id]: value })}
              />
            ))}
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-[var(--charcoal)] mb-6">
              Documentation Preferences
            </h3>

            {/* Situation Questions */}
            {docSituationQuestions.map((q) => (
              <div key={q.id} className="mb-8">
                <p className="text-sm font-medium text-[var(--charcoal)] mb-3">
                  {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((option) => (
                    <label
                      key={option.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${
                          profile.values[q.id as keyof typeof profile.values] === option.id
                            ? 'border-[var(--mid-blue)] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={option.id}
                        checked={profile.values[q.id as keyof typeof profile.values] === option.id}
                        onChange={() => setValues({ [q.id]: option.id })}
                        className="w-4 h-4 text-[var(--mid-blue)] focus:ring-[var(--mid-blue)]"
                      />
                      <span className="text-sm text-[var(--charcoal)]">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Philosophy */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-[var(--charcoal)] mb-2">
              Documentation Philosophy
            </h3>
            <p className="text-sm text-[var(--gray)] mb-3">
              What else should we know about how you think about documentation?
              What&apos;s important to you in a medical record?
            </p>
            <textarea
              value={profile.values.documentationPhilosophy}
              onChange={(e) => setValues({ documentationPhilosophy: e.target.value })}
              placeholder="Share any additional thoughts about your documentation approach..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--mid-blue)] focus:border-transparent resize-y text-sm text-[var(--charcoal)]"
            />
          </div>
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
