'use client';

import { useRouter } from 'next/navigation';
import { TrackLayout, StepContainer } from '@/components/layout';
import { useDocumentationProfile } from '@/context/ProfileContext';
import { docColdScenarios, documentationSteps } from '@/data/documentationScenarios';

export default function DocumentationStep2() {
  const router = useRouter();
  const { profile, setColdResponses, setStep } = useDocumentationProfile();

  const handleNext = () => {
    setStep(3);
    router.push('/documentation/step-3');
  };

  const allFilled =
    profile.coldResponses.hpiPediatricAcute.trim() !== '' &&
    profile.coldResponses.hpiAdultChronic.trim() !== '' &&
    profile.coldResponses.apPediatricWellChild.trim() !== '' &&
    profile.coldResponses.apDiagnosticUncertainty.trim() !== '' &&
    profile.coldResponses.apMentalHealth.trim() !== '';

  return (
    <TrackLayout
      trackTitle="Clinical Documentation"
      trackDescription="Capture your documentation style for clinical notes"
      steps={documentationSteps}
      currentStep={2}
    >
      <StepContainer
        title="Cold Generation — Note Sections"
        instructions="Write these sections exactly as you would in your actual notes. Don't clean them up or make them 'better'—we want your real documentation style."
        currentStep={2}
        totalSteps={7}
        prevHref="/documentation/step-1"
        onNext={handleNext}
        nextLabel="Continue"
        isNextDisabled={!allFilled}
      >
        <div className="space-y-10">
          {docColdScenarios.map((scenario, index) => (
            <div key={scenario.id}>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-[var(--deep-blue)] text-white text-xs font-medium rounded">
                    {scenario.scenarioType}
                  </span>
                  <h3 className="text-lg font-medium text-[var(--charcoal)]">
                    {scenario.title}
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-[var(--charcoal)] mb-2">
                    Clinical context:
                  </p>
                  <p className="text-sm text-[var(--gray)]">{scenario.context}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
                  {scenario.scenarioType === 'HPI'
                    ? 'Write your HPI for this visit:'
                    : 'Write your Assessment & Plan for this visit:'}
                </label>
                <textarea
                  value={
                    profile.coldResponses[
                      scenario.id as keyof typeof profile.coldResponses
                    ]
                  }
                  onChange={(e) =>
                    setColdResponses({ [scenario.id]: e.target.value })
                  }
                  placeholder={scenario.placeholder}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--mid-blue)] focus:border-transparent resize-y text-sm text-[var(--charcoal)] font-mono"
                />
              </div>

              {index < docColdScenarios.length - 1 && (
                <div className="mt-8 border-t border-gray-200" />
              )}
            </div>
          ))}
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
