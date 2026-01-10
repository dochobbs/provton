'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrackLayout, StepContainer } from '@/components/layout';
import { EditableDraft } from '@/components/inputs';
import { useMessagingProfile } from '@/context/ProfileContext';
import { editScenarios, messagingSteps } from '@/data/messagingScenarios';

export default function MessagingStep4() {
  const router = useRouter();
  const { profile, setEditCapture, setStep } = useMessagingProfile();
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [hasGenerated, setHasGenerated] = useState<Record<string, boolean>>({});

  const handleNext = () => {
    setStep(5);
    router.push('/messaging/step-5');
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
          incomingMessage: editScenarios[scenarioIndex].incomingMessage,
          coldResponses: profile.coldResponses,
          pairSelections: profile.pairSelections,
          antiExamples: profile.antiExamples,
        }),
      });

      console.log('Response status:', response.status);
      if (!response.ok) throw new Error('Failed to generate draft');

      const data = await response.json();
      console.log('Received draft:', data.draft?.substring(0, 100) + '...');
      const key = scenarioId as 'scenario4A' | 'scenario4B' | 'scenario4C';
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
    const key = scenarioId as 'scenario4A' | 'scenario4B' | 'scenario4C';
    const current = profile.editCapture[key];
    setEditCapture({
      [key]: { ...current, edited },
    });
  };

  const allEdited =
    profile.editCapture.scenario4A.edited.trim() !== '' &&
    profile.editCapture.scenario4B.edited.trim() !== '' &&
    profile.editCapture.scenario4C.edited.trim() !== '';

  return (
    <TrackLayout
      trackTitle="Portal Messages"
      trackDescription="Capture your communication style for patient messaging"
      steps={messagingSteps}
      currentStep={4}
    >
      <StepContainer
        title="Edit Capture"
        instructions="We've generated draft responses based on your input so far. Edit each one to make it sound like you—every change teaches us something."
        currentStep={4}
        totalSteps={6}
        prevHref="/messaging/step-3"
        onNext={handleNext}
        nextLabel="Continue"
        isNextDisabled={!allEdited}
      >
        <div className="space-y-8">
          {/* Generate All Button */}
          {!Object.values(hasGenerated).some((v) => v) && (
            <div className="text-center pb-6 border-b border-gray-200">
              <p className="text-sm text-[var(--gray)] mb-4">
                Click below to generate AI drafts based on your previous responses.
              </p>
              <button
                onClick={() => {
                  editScenarios.forEach((scenario, index) => {
                    generateDraft(scenario.id, index);
                  });
                }}
                disabled={Object.values(isGenerating).some((v) => v)}
                className="px-6 py-2 bg-[var(--mid-blue)] text-white rounded-lg font-medium hover:bg-[var(--deep-blue)] transition-colors disabled:opacity-50"
              >
                Generate All Drafts
              </button>
            </div>
          )}

          {editScenarios.map((scenario, index) => {
            const key = scenario.id as 'scenario4A' | 'scenario4B' | 'scenario4C';
            const capture = profile.editCapture[key];

            return (
              <div key={scenario.id}>
                <EditableDraft
                  title={scenario.title}
                  scenarioDescription={scenario.scenarioDescription}
                  aiDraft={capture.original || 'Click "Generate All Drafts" above to generate this draft.'}
                  userEdits={capture.edited}
                  onUserEditsChange={(edited) => handleEditChange(scenario.id, edited)}
                  onRegenerate={() => generateDraft(scenario.id, index)}
                  isRegenerating={isGenerating[scenario.id]}
                />
                {index < editScenarios.length - 1 && (
                  <div className="mt-6 border-t border-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
