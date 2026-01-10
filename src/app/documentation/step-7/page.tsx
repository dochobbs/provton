'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { TrackLayout, StepContainer } from '@/components/layout';
import { useDocumentationProfile } from '@/context/ProfileContext';
import {
  practiceTypeOptions,
  pedsGrowthOptions,
  pedsDevelopmentOptions,
  pedsAnticipGuidanceOptions,
  documentationSteps,
} from '@/data/documentationScenarios';

export default function DocumentationStep7() {
  const router = useRouter();
  const { profile, setSpecialty, setGeneratedProfile, setUserCorrections, complete } =
    useDocumentationProfile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(!!profile.generatedProfile);

  const generateProfile = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: 'documentation',
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

  const isPediatrics =
    profile.specialty.practiceType === 'pediatrics' ||
    profile.specialty.practiceType === 'peds-adolescent';

  const styleProfile = profile.generatedProfile;

  const RadioGroup = ({
    name,
    options,
    value,
    onChange,
    label,
  }: {
    name: string;
    options: { id: string; label: string }[];
    value: string | undefined;
    onChange: (value: string) => void;
    label: string;
  }) => (
    <div className="mb-6">
      <p className="text-sm font-medium text-[var(--charcoal)] mb-3">{label}</p>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.id}
            className={`
              flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
              ${value === option.id
                ? 'border-[var(--mid-blue)] bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="w-4 h-4 text-[var(--mid-blue)] focus:ring-[var(--mid-blue)]"
            />
            <span className="text-sm text-[var(--charcoal)]">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <TrackLayout
      trackTitle="Clinical Documentation"
      trackDescription="Capture your documentation style for clinical notes"
      steps={documentationSteps}
      currentStep={7}
    >
      <StepContainer
        title="Specialty & Summary"
        instructions="Select your practice type, then review your generated style profile."
        currentStep={7}
        totalSteps={7}
        prevHref="/documentation/step-6"
        onNext={handleComplete}
        nextLabel="Complete"
        isLoading={isGenerating}
      >
        <div className="space-y-8">
          {/* Practice Type */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-[var(--charcoal)] mb-4">
              Practice Type
            </h3>
            <RadioGroup
              name="practiceType"
              label="Which best describes your practice?"
              options={practiceTypeOptions}
              value={profile.specialty.practiceType}
              onChange={(value) => setSpecialty({ practiceType: value })}
            />

            {/* Pediatric-specific questions */}
            {isPediatrics && (
              <div className="mt-6 space-y-6">
                <h4 className="text-md font-medium text-[var(--charcoal)]">
                  Pediatric-Specific Preferences
                </h4>
                <RadioGroup
                  name="growthDocStyle"
                  label="Growth documentation style:"
                  options={pedsGrowthOptions}
                  value={profile.specialty.growthDocStyle}
                  onChange={(value) => setSpecialty({ growthDocStyle: value })}
                />
                <RadioGroup
                  name="developmentDocStyle"
                  label="Development documentation style:"
                  options={pedsDevelopmentOptions}
                  value={profile.specialty.developmentDocStyle}
                  onChange={(value) => setSpecialty({ developmentDocStyle: value })}
                />
                <RadioGroup
                  name="anticipatoryGuidanceDoc"
                  label="Anticipatory guidance documentation:"
                  options={pedsAnticipGuidanceOptions}
                  value={profile.specialty.anticipatoryGuidanceDoc}
                  onChange={(value) => setSpecialty({ anticipatoryGuidanceDoc: value })}
                />
              </div>
            )}
          </div>

          {/* Profile Generation */}
          {!hasGenerated ? (
            <div className="text-center py-8">
              <p className="text-[var(--gray)] mb-6">
                Click below to generate your personalized documentation style profile.
              </p>
              <button
                onClick={generateProfile}
                disabled={isGenerating || !profile.specialty.practiceType}
                className="px-6 py-3 bg-[var(--mid-blue)] text-white rounded-lg font-medium hover:bg-[var(--deep-blue)] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Profile...
                  </>
                ) : (
                  'Generate My Documentation Style Profile'
                )}
              </button>
            </div>
          ) : styleProfile ? (
            <div className="space-y-8">
              {/* Voice Summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-medium text-[var(--deep-blue)] mb-3">
                  Documentation Voice Summary
                </h3>
                <p className="text-[var(--charcoal)]">{styleProfile.voiceSummary}</p>
              </div>

              {/* Voice Dimensions */}
              <div>
                <h3 className="text-lg font-medium text-[var(--charcoal)] mb-4">
                  Documentation Tendencies
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(styleProfile.voiceDimensions).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[var(--charcoal)] capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
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

              {/* Example Fragments */}
              <div>
                <h3 className="text-lg font-medium text-[var(--charcoal)] mb-4">
                  Phrases That Sound Like You
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {styleProfile.exampleFragments.map((fragment, index) => (
                    <p
                      key={index}
                      className="text-[var(--charcoal)] font-mono text-sm border-l-2 border-[var(--mid-blue)] pl-3 mb-3 last:mb-0"
                    >
                      {fragment}
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
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--mid-blue)] mx-auto mb-4" />
              <p className="text-[var(--gray)]">Generating your profile...</p>
            </div>
          )}
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
