'use client';

import { useRouter } from 'next/navigation';
import { TrackLayout, StepContainer } from '@/components/layout';
import { MultiSelect } from '@/components/inputs';
import { useMessagingProfile } from '@/context/ProfileContext';
import {
  closerOptions,
  openerOptions,
  stylisticAversionOptions,
  messagingSteps,
} from '@/data/messagingScenarios';

export default function MessagingStep3() {
  const router = useRouter();
  const { profile, setAntiExamples, setStep } = useMessagingProfile();

  const handleNext = () => {
    setStep(4);
    router.push('/messaging/step-4');
  };

  const toggleCloser = (id: string) => {
    const current = profile.antiExamples.closersNeverUsed;
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    setAntiExamples({ closersNeverUsed: updated });
  };

  const toggleOpener = (id: string) => {
    const current = profile.antiExamples.openersNeverUsed;
    const updated = current.includes(id)
      ? current.filter((o) => o !== id)
      : [...current, id];
    setAntiExamples({ openersNeverUsed: updated });
  };

  const toggleAversion = (id: string) => {
    const current = profile.antiExamples.stylisticAversions;
    const updated = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    setAntiExamples({ stylisticAversions: updated });
  };

  return (
    <TrackLayout
      trackTitle="Portal Messages"
      trackDescription="Capture your communication style for patient messaging"
      steps={messagingSteps}
      currentStep={3}
    >
      <StepContainer
        title="Anti-Examples"
        instructions="Help us understand what you'd never say. This is often more revealing than what you would say."
        currentStep={3}
        totalSteps={6}
        prevHref="/messaging/step-2"
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
              List any words, phrases, or expressions you&apos;d never use in a portal
              message—things that feel wrong, unprofessional, or just not you.
            </p>
            <textarea
              value={profile.antiExamples.forbiddenPhrases}
              onChange={(e) => setAntiExamples({ forbiddenPhrases: e.target.value })}
              placeholder="e.g., 'per my last message', 'circle back', 'touch base'..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--mid-blue)] focus:border-transparent resize-y text-sm text-[var(--charcoal)]"
            />
          </div>

          {/* Closers */}
          <MultiSelect
            title="Closers You'd Never Use"
            description="Select all the closers you'd never use in a portal message."
            options={closerOptions}
            selected={profile.antiExamples.closersNeverUsed}
            onToggle={toggleCloser}
            columns={3}
          />

          {/* Openers */}
          <MultiSelect
            title="Openers You'd Never Use"
            description="Select all the openers you'd never use."
            options={openerOptions}
            selected={profile.antiExamples.openersNeverUsed}
            onToggle={toggleOpener}
            columns={2}
          />

          {/* Stylistic Aversions */}
          <MultiSelect
            title="Stylistic Patterns That Bother You"
            description="Select all that apply."
            options={stylisticAversionOptions}
            selected={profile.antiExamples.stylisticAversions}
            onToggle={toggleAversion}
            columns={2}
          />

          {/* Pet Peeves */}
          <div>
            <h3 className="text-lg font-medium text-[var(--charcoal)] mb-2">
              Pet Peeves
            </h3>
            <p className="text-sm text-[var(--gray)] mb-3">
              Any other pet peeves about medical communication—things you see other
              providers do that you&apos;d never do?
            </p>
            <textarea
              value={profile.antiExamples.petPeeves}
              onChange={(e) => setAntiExamples({ petPeeves: e.target.value })}
              placeholder="e.g., 'Providers who use all caps for emphasis', 'Excessive medical jargon'..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--mid-blue)] focus:border-transparent resize-y text-sm text-[var(--charcoal)]"
            />
          </div>
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
