'use client';

import { useRouter } from 'next/navigation';
import { TrackLayout, StepContainer } from '@/components/layout';
import { MultiSelect } from '@/components/inputs';
import { useDocumentationProfile } from '@/context/ProfileContext';
import {
  docPatternsAvoidedOptions,
  docStyleAversionOptions,
  documentationSteps,
} from '@/data/documentationScenarios';

export default function DocumentationStep4() {
  const router = useRouter();
  const { profile, setAntiExamples, setStep } = useDocumentationProfile();

  const handleNext = () => {
    setStep(5);
    router.push('/documentation/step-5');
  };

  const togglePattern = (id: string) => {
    const current = profile.antiExamples.patternsAvoided;
    const updated = current.includes(id)
      ? current.filter((p) => p !== id)
      : [...current, id];
    setAntiExamples({ patternsAvoided: updated });
  };

  const toggleAversion = (id: string) => {
    const current = profile.antiExamples.styleAversions;
    const updated = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    setAntiExamples({ styleAversions: updated });
  };

  return (
    <TrackLayout
      trackTitle="Clinical Documentation"
      trackDescription="Capture your documentation style for clinical notes"
      steps={documentationSteps}
      currentStep={4}
    >
      <StepContainer
        title="Anti-Examples — Documentation"
        instructions="Help us understand documentation patterns you avoid."
        currentStep={4}
        totalSteps={7}
        prevHref="/documentation/step-3"
        onNext={handleNext}
        nextLabel="Continue"
      >
        <div className="space-y-10">
          {/* Forbidden Phrases */}
          <div>
            <h3 className="text-lg font-medium text-[var(--charcoal)] mb-2">
              Forbidden Phrases
            </h3>
            <p className="text-sm text-[var(--gray)] mb-3">
              List phrases or patterns you&apos;d never use in documentation—things
              that feel inappropriate, medicolegally risky, or just not your style.
            </p>
            <textarea
              value={profile.antiExamples.forbiddenPhrases}
              onChange={(e) =>
                setAntiExamples({ forbiddenPhrases: e.target.value })
              }
              placeholder='e.g., "Patient states...", "Denies any...", "Discussed at length..."'
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--mid-blue)] focus:border-transparent resize-y text-sm text-[var(--charcoal)]"
            />
          </div>

          {/* Documentation Pet Peeves */}
          <div>
            <h3 className="text-lg font-medium text-[var(--charcoal)] mb-2">
              Documentation Pet Peeves
            </h3>
            <p className="text-sm text-[var(--gray)] mb-3">
              What documentation habits bother you when you read other providers&apos;
              notes?
            </p>
            <textarea
              value={profile.antiExamples.documentationPetPeeves}
              onChange={(e) =>
                setAntiExamples({ documentationPetPeeves: e.target.value })
              }
              placeholder="e.g., 'Notes that are clearly auto-generated with no personal touch', 'Copy-forward garbage'..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--mid-blue)] focus:border-transparent resize-y text-sm text-[var(--charcoal)]"
            />
          </div>

          {/* Patterns to Avoid */}
          <MultiSelect
            title="Patterns to Avoid"
            description="Which of these patterns do you avoid? Select all that apply."
            options={docPatternsAvoidedOptions}
            selected={profile.antiExamples.patternsAvoided}
            onToggle={togglePattern}
            columns={2}
          />

          {/* Style Aversions */}
          <MultiSelect
            title="Style Aversions"
            description="Which of these stylistic elements do you dislike in documentation?"
            options={docStyleAversionOptions}
            selected={profile.antiExamples.styleAversions}
            onToggle={toggleAversion}
            columns={2}
          />
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
