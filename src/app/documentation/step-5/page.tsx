'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrackLayout, StepContainer } from '@/components/layout';
import { EditableDraft } from '@/components/inputs';
import { useDocumentationProfile } from '@/context/ProfileContext';
import { docEditScenarios, documentationSteps } from '@/data/documentationScenarios';

export default function DocumentationStep5() {
  const router = useRouter();
  const { profile, setEditCapture, setStep } = useDocumentationProfile();
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [hasGenerated, setHasGenerated] = useState<Record<string, boolean>>({});

  const handleNext = () => {
    setStep(6);
    router.push('/documentation/step-6');
  };

  const generateDraft = async (scenarioId: string, scenarioIndex: number) => {
    console.log('Starting generation for:', scenarioId);
    setIsGenerating((prev) => ({ ...prev, [scenarioId]: true }));

    try {
      console.log('Sending request to /api/generate-drafts');
      const response = await fetch('/api/generate-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId,
          incomingMessage: docEditScenarios[scenarioIndex].context,
          coldResponses: profile.coldResponses,
          pairSelections: profile.pairSelections,
          antiExamples: profile.antiExamples,
          track: 'documentation',
        }),
      });

      console.log('Response status:', response.status);
      if (!response.ok) throw new Error('Failed to generate draft');

      const data = await response.json();
      console.log('Got draft data:', data);
      const key = scenarioId as 'scenario5A' | 'scenario5B' | 'scenario5C';
      setEditCapture({
        [key]: {
          original: data.draft,
          edited: data.draft,
        },
      });
      setHasGenerated((prev) => ({ ...prev, [scenarioId]: true }));
    } catch (error) {
      console.error('Error generating draft:', error);
    } finally {
      setIsGenerating((prev) => ({ ...prev, [scenarioId]: false }));
    }
  };

  const handleEditChange = (scenarioId: string, edited: string) => {
    const key = scenarioId as 'scenario5A' | 'scenario5B' | 'scenario5C';
    const current = profile.editCapture[key];
    setEditCapture({
      [key]: { ...current, edited },
    });
  };

  const allEdited =
    profile.editCapture.scenario5A.edited.trim() !== '' &&
    profile.editCapture.scenario5B.edited.trim() !== '' &&
    profile.editCapture.scenario5C.edited.trim() !== '';

  return (
    <TrackLayout
      trackTitle="Clinical Documentation"
      trackDescription="Capture your documentation style for clinical notes"
      steps={documentationSteps}
      currentStep={5}
    >
      <StepContainer
        title="Edit Capture — Full Notes"
        instructions="We've generated draft notes based on your input. Edit them to match your style—every change helps us learn."
        currentStep={5}
        totalSteps={7}
        prevHref="/documentation/step-4"
        onNext={handleNext}
        nextLabel="Continue"
        isNextDisabled={!allEdited}
      >
        <div className="space-y-8">
          {/* Generate All Button */}
          {!Object.values(hasGenerated).some((v) => v) && (
            <div className="text-center pb-6 border-b border-gray-200">
              <p className="text-sm text-[var(--gray)] mb-4">
                Click below to generate AI draft notes based on your previous responses.
              </p>
              <button
                onClick={() => {
                  docEditScenarios.forEach((scenario, index) => {
                    generateDraft(scenario.id, index);
                  });
                }}
                disabled={Object.values(isGenerating).some((v) => v)}
                className="px-6 py-2 bg-[var(--mid-blue)] text-white rounded-lg font-medium hover:bg-[var(--deep-blue)] transition-colors disabled:opacity-50"
              >
                Generate All Draft Notes
              </button>
            </div>
          )}

          {docEditScenarios.map((scenario, index) => {
            const key = scenario.id as 'scenario5A' | 'scenario5B' | 'scenario5C';
            const capture = profile.editCapture[key];

            return (
              <div key={scenario.id}>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-[var(--charcoal)] mb-1">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-[var(--gray)] mb-2">
                    {scenario.scenarioDescription}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-[var(--gray)]">{scenario.context}</p>
                  </div>
                </div>

                <EditableDraft
                  title=""
                  scenarioDescription=""
                  aiDraft={capture.original || 'Click "Generate All Draft Notes" above to generate this draft.'}
                  userEdits={capture.edited}
                  onUserEditsChange={(edited) => handleEditChange(scenario.id, edited)}
                  onRegenerate={() => generateDraft(scenario.id, index)}
                  isRegenerating={isGenerating[scenario.id]}
                />

                {index < docEditScenarios.length - 1 && (
                  <div className="mt-8 border-t border-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
