'use client';

import { useRouter } from 'next/navigation';
import { TrackLayout, StepContainer } from '@/components/layout';
import { ContrastivePair } from '@/components/inputs';
import { useMessagingProfile } from '@/context/ProfileContext';
import { contrastivePairs, messagingSteps } from '@/data/messagingScenarios';
import { PairSelection } from '@/types';

export default function MessagingStep2() {
  const router = useRouter();
  const { profile, setPairSelections, setStep } = useMessagingProfile();

  const handleNext = () => {
    setStep(3);
    router.push('/messaging/step-3');
  };

  const pairs = profile.pairSelections;
  const allSelected =
    pairs.pair2A.selected !== null &&
    pairs.pair2B.selected !== null &&
    pairs.pair2C.selected !== null &&
    pairs.pair2D.selected !== null &&
    pairs.pair2E.selected !== null &&
    pairs.pair2F.selected !== null;

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
      trackTitle="Portal Messages"
      trackDescription="Capture your communication style for patient messaging"
      steps={messagingSteps}
      currentStep={2}
    >
      <StepContainer
        title="Contrastive Pairs"
        instructions="For each pair, select the response closer to how you'd write it. Then edit it if you'd change anything—even small tweaks help us learn."
        currentStep={2}
        totalSteps={6}
        prevHref="/messaging/step-1"
        onNext={handleNext}
        nextLabel="Continue"
        isNextDisabled={!allSelected}
      >
        <div className="space-y-8">
          {contrastivePairs.map((pair, index) => (
            <div key={pair.id}>
              <ContrastivePair
                title={pair.title}
                pairType={pair.pairType}
                incomingMessage={pair.incomingMessage}
                optionA={pair.optionA}
                optionB={pair.optionB}
                selected={pairs[pair.id as keyof typeof pairs].selected}
                edits={pairs[pair.id as keyof typeof pairs].edits}
                onSelect={(option) => handleSelect(pair.id as keyof typeof pairs, option)}
                onEdit={(edits) => handleEdit(pair.id as keyof typeof pairs, edits)}
              />
              {index < contrastivePairs.length - 1 && (
                <div className="mt-6 border-t border-gray-200" />
              )}
            </div>
          ))}
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
