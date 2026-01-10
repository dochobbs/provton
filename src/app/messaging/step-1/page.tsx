'use client';

import { useRouter } from 'next/navigation';
import { TrackLayout, StepContainer } from '@/components/layout';
import { ScenarioPrompt } from '@/components/inputs';
import { useMessagingProfile } from '@/context/ProfileContext';
import { coldScenarios, messagingSteps } from '@/data/messagingScenarios';

export default function MessagingStep1() {
  const router = useRouter();
  const { profile, setColdResponses, setStep } = useMessagingProfile();

  const handleNext = () => {
    setStep(2);
    router.push('/messaging/step-2');
  };

  const allFilled =
    profile.coldResponses.scenario1A.trim() !== '' &&
    profile.coldResponses.scenario1B.trim() !== '' &&
    profile.coldResponses.scenario1C.trim() !== '';

  return (
    <TrackLayout
      trackTitle="Portal Messages"
      trackDescription="Capture your communication style for patient messaging"
      steps={messagingSteps}
      currentStep={1}
    >
      <StepContainer
        title="Cold Generation"
        instructions="Respond to these portal messages exactly as you would in practice. Don't overthink it—just write what you'd actually send."
        currentStep={1}
        totalSteps={6}
        prevHref="/"
        onNext={handleNext}
        nextLabel="Continue"
        isNextDisabled={!allFilled}
      >
        <div className="space-y-8">
          <ScenarioPrompt
            title={coldScenarios[0].title}
            scenarioType={coldScenarios[0].scenarioType}
            incomingMessage={coldScenarios[0].incomingMessage}
            senderName={coldScenarios[0].senderName}
            value={profile.coldResponses.scenario1A}
            onChange={(value) => setColdResponses({ scenario1A: value })}
            placeholder="Write your response to Sarah..."
          />

          <div className="border-t border-gray-200" />

          <ScenarioPrompt
            title={coldScenarios[1].title}
            scenarioType={coldScenarios[1].scenarioType}
            incomingMessage={coldScenarios[1].incomingMessage}
            senderName={coldScenarios[1].senderName}
            value={profile.coldResponses.scenario1B}
            onChange={(value) => setColdResponses({ scenario1B: value })}
            placeholder="Write your response to Robert..."
          />

          <div className="border-t border-gray-200" />

          <ScenarioPrompt
            title={coldScenarios[2].title}
            scenarioType={coldScenarios[2].scenarioType}
            incomingMessage={coldScenarios[2].incomingMessage}
            senderName={coldScenarios[2].senderName}
            value={profile.coldResponses.scenario1C}
            onChange={(value) => setColdResponses({ scenario1C: value })}
            placeholder="Write your response to Michelle..."
          />
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
