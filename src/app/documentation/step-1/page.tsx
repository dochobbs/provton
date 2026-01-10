'use client';

import { useRouter } from 'next/navigation';
import { TrackLayout, StepContainer } from '@/components/layout';
import { Slider } from '@/components/inputs';
import { useDocumentationProfile } from '@/context/ProfileContext';
import { structureOptions, documentationSteps } from '@/data/documentationScenarios';

export default function DocumentationStep1() {
  const router = useRouter();
  const { profile, setStructure, setStep } = useDocumentationProfile();

  const handleNext = () => {
    setStep(2);
    router.push('/documentation/step-2');
  };

  const RadioGroup = ({
    name,
    options,
    value,
    onChange,
    label,
  }: {
    name: string;
    options: { id: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    label: string;
  }) => (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-[var(--charcoal)] mb-4">{label}</h3>
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
      currentStep={1}
    >
      <StepContainer
        title="Structure Preferences"
        instructions="These questions help us understand how you organize your notes."
        currentStep={1}
        totalSteps={7}
        prevHref="/"
        onNext={handleNext}
        nextLabel="Continue"
      >
        <div className="space-y-6">
          <RadioGroup
            name="overallStructure"
            label="Which best describes your typical note structure?"
            options={structureOptions.overallStructure}
            value={profile.structure.overallStructure}
            onChange={(value) => setStructure({ overallStructure: value })}
          />

          <RadioGroup
            name="planOrganization"
            label="How do you typically organize your Plan section?"
            options={structureOptions.planOrganization}
            value={profile.structure.planOrganization}
            onChange={(value) => setStructure({ planOrganization: value })}
          />

          <RadioGroup
            name="assessmentStyle"
            label="How do you typically write your Assessment section?"
            options={structureOptions.assessmentStyle}
            value={profile.structure.assessmentStyle}
            onChange={(value) => setStructure({ assessmentStyle: value })}
          />

          <RadioGroup
            name="hpiConstruction"
            label="How do you typically construct the HPI?"
            options={structureOptions.hpiConstruction}
            value={profile.structure.hpiConstruction}
            onChange={(value) => setStructure({ hpiConstruction: value })}
          />

          <RadioGroup
            name="physicalExamStyle"
            label="How do you typically document physical exam?"
            options={structureOptions.physicalExamStyle}
            value={profile.structure.physicalExamStyle}
            onChange={(value) => setStructure({ physicalExamStyle: value })}
          />

          <div className="pt-4 border-t border-gray-200">
            <Slider
              label="How much do you rely on templates vs. free text?"
              leftLabel="Heavy template use"
              rightLabel="Mostly free text"
              value={profile.structure.templateUsage}
              min={1}
              max={10}
              onChange={(value) => setStructure({ templateUsage: value })}
            />
          </div>
        </div>
      </StepContainer>
    </TrackLayout>
  );
}
