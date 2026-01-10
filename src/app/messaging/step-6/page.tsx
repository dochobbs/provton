'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { TrackLayout, StepContainer } from '@/components/layout';
import { useMessagingProfile } from '@/context/ProfileContext';
import { messagingSteps } from '@/data/messagingScenarios';

export default function MessagingStep6() {
  const router = useRouter();
  const { profile, setGeneratedProfile, setUserCorrections, complete } = useMessagingProfile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(!!profile.generatedProfile);

  const generateProfile = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: 'messaging',
          profile,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate profile');

      const data = await response.json();
      setGeneratedProfile(data.profile);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating profile:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    complete();
    router.push('/');
  };

  const styleProfile = profile.generatedProfile;

  return (
    <TrackLayout
      trackTitle="Portal Messages"
      trackDescription="Capture your communication style for patient messaging"
      steps={messagingSteps}
      currentStep={6}
    >
      <StepContainer
        title="Summary Validation"
        instructions="Here's what we learned about your communication style. Let us know if anything is wrong or missing."
        currentStep={6}
        totalSteps={6}
        prevHref="/messaging/step-5"
        onNext={handleComplete}
        nextLabel="Complete"
        isLoading={isGenerating}
      >
        <div className="space-y-8">
          {!hasGenerated ? (
            <div className="text-center py-12">
              <p className="text-[var(--gray)] mb-6">
                Click below to generate your personalized style profile based on all
                your responses.
              </p>
              <button
                onClick={generateProfile}
                disabled={isGenerating}
                className="px-6 py-3 bg-[var(--mid-blue)] text-white rounded-lg font-medium hover:bg-[var(--deep-blue)] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Profile...
                  </>
                ) : (
                  'Generate My Style Profile'
                )}
              </button>
            </div>
          ) : styleProfile ? (
            <div className="space-y-8">
              {/* Voice Summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-medium text-[var(--deep-blue)] mb-3">
                  Your Voice in a Nutshell
                </h3>
                <p className="text-[var(--charcoal)]">{styleProfile.voiceSummary}</p>
              </div>

              {/* Tone Dimensions */}
              <div>
                <h3 className="text-lg font-medium text-[var(--charcoal)] mb-4">
                  Tone & Approach
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(styleProfile.toneDimensions).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[var(--charcoal)] capitalize">
                          {key}
                        </span>
                        <span className="px-2 py-1 bg-[var(--mid-blue)] text-white text-xs rounded">
                          {value.score}/10
                        </span>
                      </div>
                      <p className="text-sm text-[var(--gray)]">{value.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Moves */}
              <div>
                <h3 className="text-lg font-medium text-[var(--charcoal)] mb-4">
                  Your Signature Patterns
                </h3>
                <ul className="space-y-2">
                  {styleProfile.signatureMoves.map((move, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[var(--lime-green)] flex-shrink-0 mt-0.5" />
                      <span className="text-[var(--charcoal)]">{move}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Negative Constraints */}
              <div>
                <h3 className="text-lg font-medium text-[var(--charcoal)] mb-4">
                  Things You Never Do
                </h3>
                <div className="space-y-4">
                  {styleProfile.negativeConstraints.neverUsePhrases.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-[var(--gray)] mb-2">
                        Never Use These Phrases:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {styleProfile.negativeConstraints.neverUsePhrases.map(
                          (phrase, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-red-50 text-red-700 text-sm rounded border border-red-200"
                            >
                              {phrase}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {styleProfile.negativeConstraints.avoid.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-[var(--gray)] mb-2">
                        Generally Avoid:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {styleProfile.negativeConstraints.avoid.map((item, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-yellow-50 text-yellow-700 text-sm rounded border border-yellow-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Example Fragments */}
              <div>
                <h3 className="text-lg font-medium text-[var(--charcoal)] mb-4">
                  Phrases That Sound Like You
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {styleProfile.exampleFragments.map((fragment, index) => (
                    <p
                      key={index}
                      className="text-[var(--charcoal)] italic border-l-2 border-[var(--mid-blue)] pl-3 mb-3 last:mb-0"
                    >
                      &ldquo;{fragment}&rdquo;
                    </p>
                  ))}
                </div>
              </div>

              {/* Corrections */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-[var(--charcoal)] mb-2">
                  Does This Feel Accurate?
                </h3>
                <p className="text-sm text-[var(--gray)] mb-3">
                  Edit anything that&apos;s wrong or missing, or add notes below:
                </p>
                <textarea
                  value={profile.userCorrections || ''}
                  onChange={(e) => setUserCorrections(e.target.value || null)}
                  placeholder="Add any corrections or clarifications here..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--mid-blue)] focus:border-transparent resize-y text-sm text-[var(--charcoal)]"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--mid-blue)] mx-auto mb-4" />
              <p className="text-[var(--gray)]">Generating your profile...</p>
            </div>
          )}
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
