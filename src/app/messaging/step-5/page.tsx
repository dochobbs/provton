'use client';

import { useRouter } from 'next/navigation';
import { TrackLayout, StepContainer } from '@/components/layout';
import { Slider } from '@/components/inputs';
import { useMessagingProfile } from '@/context/ProfileContext';
import { sliderQuestions, situationQuestions, messagingSteps } from '@/data/messagingScenarios';

export default function MessagingStep5() {
  const router = useRouter();
  const { profile, setValues, setStep } = useMessagingProfile();

  const handleNext = () => {
    setStep(6);
    router.push('/messaging/step-6');
  };

  return (
    <TrackLayout
      trackTitle="Portal Messages"
      trackDescription="Capture your communication style for patient messaging"
      steps={messagingSteps}
      currentStep={5}
    >
      <StepContainer
        title="Values Calibration"
        instructions="These questions help us understand your clinical communication philosophy—there are no right answers."
        currentStep={5}
        totalSteps={6}
        prevHref="/messaging/step-4"
        onNext={handleNext}
        nextLabel="Continue"
      >
        <div className="space-y-10">
          {/* Sliders */}
          <div className="space-y-8">
            <Slider
              label={sliderQuestions[0].label}
              leftLabel={sliderQuestions[0].leftLabel}
              rightLabel={sliderQuestions[0].rightLabel}
              value={profile.values.uncertainty}
              min={1}
              max={10}
              onChange={(value) => setValues({ uncertainty: value })}
            />
            <Slider
              label={sliderQuestions[1].label}
              leftLabel={sliderQuestions[1].leftLabel}
              rightLabel={sliderQuestions[1].rightLabel}
              value={profile.values.length}
              min={1}
              max={10}
              onChange={(value) => setValues({ length: value })}
            />
            <Slider
              label={sliderQuestions[2].label}
              leftLabel={sliderQuestions[2].leftLabel}
              rightLabel={sliderQuestions[2].rightLabel}
              value={profile.values.warmth}
              min={1}
              max={10}
              onChange={(value) => setValues({ warmth: value })}
            />
            <Slider
              label={sliderQuestions[3].label}
              leftLabel={sliderQuestions[3].leftLabel}
              rightLabel={sliderQuestions[3].rightLabel}
              value={profile.values.directiveStyle}
              min={1}
              max={10}
              onChange={(value) => setValues({ directiveStyle: value })}
            />
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-[var(--charcoal)] mb-6">
              Situational Preferences
            </h3>

            {/* Situation Questions */}
            {situationQuestions.map((q) => (
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
              Communication Philosophy
            </h3>
            <p className="text-sm text-[var(--gray)] mb-3">
              Anything else about your communication philosophy we should know? How you
              think about the provider-patient relationship, what matters to you in
              these exchanges, etc.
            </p>
            <textarea
              value={profile.values.philosophy}
              onChange={(e) => setValues({ philosophy: e.target.value })}
              placeholder="Share any additional thoughts about your communication approach..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--mid-blue)] focus:border-transparent resize-y text-sm text-[var(--charcoal)]"
            />
          </div>
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
