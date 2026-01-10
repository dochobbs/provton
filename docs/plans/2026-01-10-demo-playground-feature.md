# Demo Playground Feature Specification

**Feature:** Style Profile Testing Playground
**Priority:** High
**Complexity:** Medium
**Estimated Files:** 5-7 new files

---

## Overview

Add a demo/playground page where users can test their style profile against example inputs and see AI-generated outputs. Users can load profiles via upload, paste, or transfer from completed interrogation, then test with pre-built or custom scenarios.

### Key Capabilities

1. **Load Profile** - Upload JSON file, paste JSON, or use completed profile
2. **Select Track** - Test messaging or documentation pipeline
3. **Generate Examples** - Pre-built scenarios or AI-generated test inputs
4. **Custom Input** - Freetext patient message or visit details
5. **View Output** - See AI-generated draft based on profile
6. **Modify Profile** - Natural language instructions to tweak profile ("make it warmer")
7. **Re-test** - Iterate on profile changes

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEMO PLAYGROUND                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 1. LOAD YOUR PROFILE                                             │    │
│  │                                                                   │    │
│  │  [Upload JSON] [Paste JSON] [Use Current Profile]                │    │
│  │                                                                   │    │
│  │  Profile Status: ✓ Messaging loaded | ✗ Documentation missing    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 2. SELECT TRACK                                                  │    │
│  │                                                                   │    │
│  │  ( ) Portal Messaging    ( ) Clinical Documentation              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 3. TEST INPUT                                                    │    │
│  │                                                                   │    │
│  │  [Example Scenarios ▼]  OR  [Write Custom Input]                 │    │
│  │                                                                   │    │
│  │  ┌─────────────────────────────────────────────────────────┐     │    │
│  │  │ Anxious parent asking about fever in 2-year-old...      │     │    │
│  │  │                                                          │     │    │
│  │  └─────────────────────────────────────────────────────────┘     │    │
│  │                                                                   │    │
│  │                              [Generate Draft]                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 4. GENERATED OUTPUT                                              │    │
│  │                                                                   │    │
│  │  ┌─────────────────────────────────────────────────────────┐     │    │
│  │  │ Hi Sarah,                                                │     │    │
│  │  │                                                          │     │    │
│  │  │ I understand how worrying it is when Emma has a fever... │     │    │
│  │  └─────────────────────────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 5. REFINE YOUR PROFILE                                           │    │
│  │                                                                   │    │
│  │  Describe changes: "Make it warmer and add more empathy"         │    │
│  │  ┌─────────────────────────────────────────────────────────┐     │    │
│  │  │                                                          │     │    │
│  │  └─────────────────────────────────────────────────────────┘     │    │
│  │                                                                   │    │
│  │  [Apply Changes & Re-test]  [View Modified Profile]              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 6. SAVE                                                          │    │
│  │                                                                   │    │
│  │  [Download Modified Profile]  [Copy to Clipboard]                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/
├── app/
│   └── demo/
│       └── page.tsx                    # Main demo playground page
├── components/
│   └── demo/
│       ├── ProfileLoader.tsx           # Upload/paste/use current profile
│       ├── TrackSelector.tsx           # Messaging vs Documentation toggle
│       ├── ScenarioSelector.tsx        # Dropdown of example scenarios
│       ├── CustomInputEditor.tsx       # Textarea for custom input
│       ├── OutputDisplay.tsx           # Generated draft display
│       ├── ProfileRefiner.tsx          # Natural language modification
│       └── ProfileViewer.tsx           # View/download modified profile
├── data/
│   └── demoScenarios.ts                # Pre-built test scenarios
└── app/
    └── api/
        ├── demo-generate/
        │   └── route.ts                # Generate draft from profile + input
        └── modify-profile/
            └── route.ts                # AI-powered profile modification
```

---

## Implementation Details

### 1. Main Page (`src/app/demo/page.tsx`)

```tsx
'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { ProfileLoader } from '@/components/demo/ProfileLoader';
import { TrackSelector } from '@/components/demo/TrackSelector';
import { ScenarioSelector } from '@/components/demo/ScenarioSelector';
import { CustomInputEditor } from '@/components/demo/CustomInputEditor';
import { OutputDisplay } from '@/components/demo/OutputDisplay';
import { ProfileRefiner } from '@/components/demo/ProfileRefiner';
import { ProfileViewer } from '@/components/demo/ProfileViewer';
import { StyleProfile, DocumentationStyleProfile } from '@/types';

type Track = 'messaging' | 'documentation';

interface LoadedProfiles {
  messaging: StyleProfile | null;
  documentation: DocumentationStyleProfile | null;
  rawData: any; // Full exported JSON for reference
}

export default function DemoPage() {
  // Profile state
  const [profiles, setProfiles] = useState<LoadedProfiles>({
    messaging: null,
    documentation: null,
    rawData: null,
  });

  // UI state
  const [selectedTrack, setSelectedTrack] = useState<Track>('messaging');
  const [inputText, setInputText] = useState('');
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showProfileViewer, setShowProfileViewer] = useState(false);

  const currentProfile = selectedTrack === 'messaging'
    ? profiles.messaging
    : profiles.documentation;

  const handleProfileLoaded = (data: any) => {
    setProfiles({
      messaging: data.messaging?.generatedProfile || null,
      documentation: data.documentation?.generatedProfile || null,
      rawData: data,
    });
  };

  const handleGenerate = async () => {
    if (!currentProfile || !inputText.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/demo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: selectedTrack,
          profile: currentProfile,
          rawProfile: profiles.rawData?.[selectedTrack]?.rawResponses,
          input: inputText,
        }),
      });

      const data = await response.json();
      setGeneratedOutput(data.draft);
    } catch (error) {
      console.error('Generation failed:', error);
      setGeneratedOutput('Error generating draft. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineProfile = async () => {
    if (!currentProfile || !refinementInput.trim()) return;

    setIsRefining(true);
    try {
      const response = await fetch('/api/modify-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: selectedTrack,
          currentProfile,
          modification: refinementInput,
        }),
      });

      const data = await response.json();

      // Update the appropriate profile
      if (selectedTrack === 'messaging') {
        setProfiles(prev => ({
          ...prev,
          messaging: data.modifiedProfile,
        }));
      } else {
        setProfiles(prev => ({
          ...prev,
          documentation: data.modifiedProfile,
        }));
      }

      setRefinementInput('');

      // Auto-regenerate if there was previous output
      if (inputText.trim()) {
        // Small delay then regenerate
        setTimeout(() => handleGenerate(), 500);
      }
    } catch (error) {
      console.error('Refinement failed:', error);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light text-[var(--mid-blue)] mb-2">
            Style Profile Playground
          </h1>
          <p className="text-[var(--gray)]">
            Test your profile against example scenarios and refine it with natural language.
          </p>
        </div>

        {/* 1. Profile Loader */}
        <ProfileLoader
          onProfileLoaded={handleProfileLoaded}
          loadedProfiles={profiles}
        />

        {/* 2. Track Selector */}
        {(profiles.messaging || profiles.documentation) && (
          <TrackSelector
            selectedTrack={selectedTrack}
            onTrackChange={setSelectedTrack}
            messagingAvailable={!!profiles.messaging}
            documentationAvailable={!!profiles.documentation}
          />
        )}

        {/* 3. Test Input */}
        {currentProfile && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-[var(--charcoal)] mb-4">
              Test Input
            </h2>

            <ScenarioSelector
              track={selectedTrack}
              onScenarioSelect={setInputText}
            />

            <div className="mt-4">
              <CustomInputEditor
                track={selectedTrack}
                value={inputText}
                onChange={setInputText}
              />
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className="px-6 py-2 bg-[var(--mid-blue)] text-white rounded-lg font-medium hover:bg-[var(--deep-blue)] transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Draft'}
              </button>
            </div>
          </div>
        )}

        {/* 4. Output Display */}
        {generatedOutput && (
          <OutputDisplay
            output={generatedOutput}
            track={selectedTrack}
          />
        )}

        {/* 5. Profile Refiner */}
        {currentProfile && generatedOutput && (
          <ProfileRefiner
            value={refinementInput}
            onChange={setRefinementInput}
            onRefine={handleRefineProfile}
            isRefining={isRefining}
            onViewProfile={() => setShowProfileViewer(true)}
          />
        )}

        {/* 6. Profile Viewer Modal */}
        {showProfileViewer && (
          <ProfileViewer
            profile={currentProfile}
            track={selectedTrack}
            onClose={() => setShowProfileViewer(false)}
            fullData={profiles.rawData}
          />
        )}
      </div>
    </AppLayout>
  );
}
```

### 2. Profile Loader Component (`src/components/demo/ProfileLoader.tsx`)

```tsx
'use client';

import { useRef, useState } from 'react';
import { Upload, Clipboard, CheckCircle2 } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';

interface ProfileLoaderProps {
  onProfileLoaded: (data: any) => void;
  loadedProfiles: {
    messaging: any;
    documentation: any;
  };
}

export function ProfileLoader({ onProfileLoaded, loadedProfiles }: ProfileLoaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { state } = useProfile();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        validateAndLoad(data);
      } catch {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handlePaste = () => {
    try {
      const data = JSON.parse(pasteValue);
      validateAndLoad(data);
      setPasteMode(false);
      setPasteValue('');
    } catch {
      setError('Invalid JSON format');
    }
  };

  const handleUseCurrentProfile = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      messaging: state.messagingProfile.generatedProfile
        ? {
            generatedProfile: state.messagingProfile.generatedProfile,
            rawResponses: {
              coldResponses: state.messagingProfile.coldResponses,
              pairSelections: state.messagingProfile.pairSelections,
              antiExamples: state.messagingProfile.antiExamples,
              values: state.messagingProfile.values,
            },
          }
        : null,
      documentation: state.documentationProfile.generatedProfile
        ? {
            generatedProfile: state.documentationProfile.generatedProfile,
            rawResponses: {
              structure: state.documentationProfile.structure,
              coldResponses: state.documentationProfile.coldResponses,
              pairSelections: state.documentationProfile.pairSelections,
              antiExamples: state.documentationProfile.antiExamples,
              values: state.documentationProfile.values,
            },
          }
        : null,
    };

    if (!exportData.messaging && !exportData.documentation) {
      setError('No completed profile found. Complete an interrogation first.');
      return;
    }

    validateAndLoad(exportData);
  };

  const validateAndLoad = (data: any) => {
    setError(null);

    // Check for valid profile structure
    if (!data.messaging?.generatedProfile && !data.documentation?.generatedProfile) {
      setError('No valid generated profile found in JSON');
      return;
    }

    onProfileLoaded(data);
  };

  const hasCurrentProfile =
    state.messagingProfile.generatedProfile || state.documentationProfile.generatedProfile;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-[var(--charcoal)] mb-4">
        Load Your Profile
      </h2>

      {/* Status indicators */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          {loadedProfiles.messaging ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
          )}
          <span className={loadedProfiles.messaging ? 'text-green-700' : 'text-[var(--gray)]'}>
            Messaging
          </span>
        </div>
        <div className="flex items-center gap-1">
          {loadedProfiles.documentation ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
          )}
          <span className={loadedProfiles.documentation ? 'text-green-700' : 'text-[var(--gray)]'}>
            Documentation
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={() => setPasteMode(!pasteMode)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Clipboard className="w-4 h-4" />
          Paste JSON
        </button>

        {hasCurrentProfile && (
          <button
            onClick={handleUseCurrentProfile}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--sky-blue)] text-white rounded-lg hover:bg-[var(--mid-blue)] transition-colors"
          >
            Use Current Profile
          </button>
        )}
      </div>

      {/* Paste area */}
      {pasteMode && (
        <div className="mt-4">
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder="Paste your profile JSON here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm"
          />
          <button
            onClick={handlePaste}
            disabled={!pasteValue.trim()}
            className="mt-2 px-4 py-2 bg-[var(--mid-blue)] text-white rounded-lg disabled:opacity-50"
          >
            Load Profile
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
```

### 3. Demo Scenarios Data (`src/data/demoScenarios.ts`)

```typescript
export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  input: string;
  category: string;
}

export const messagingDemoScenarios: DemoScenario[] = [
  {
    id: 'msg-anxious-fever',
    title: 'Anxious Parent - Fever',
    description: 'Parent worried about child\'s fever',
    category: 'Pediatrics',
    input: `Hi Dr. Smith,

I'm really worried about my daughter Emma. She's had a fever of 102 for two days now and won't eat anything. She's also been pulling at her ears. Should I bring her in or go to urgent care? I'm so anxious about this.

Thanks,
Sarah`,
  },
  {
    id: 'msg-routine-refill',
    title: 'Routine Medication Refill',
    description: 'Simple refill request',
    category: 'Adult',
    input: `Hello,

I need a refill on my blood pressure medication - the lisinopril 10mg. I have about 5 days left. Can you send it to Walgreens on Main St?

Thanks,
John`,
  },
  {
    id: 'msg-frustrated-results',
    title: 'Frustrated Patient - Lab Results',
    description: 'Patient upset about delayed results',
    category: 'Adult',
    input: `I've been waiting over a week for my lab results and no one has called me. I took time off work for that appointment and I still don't know what's going on. This is unacceptable. When will someone get back to me?`,
  },
  {
    id: 'msg-mental-health',
    title: 'Mental Health Check-in',
    description: 'Patient sharing emotional struggles',
    category: 'Mental Health',
    input: `Dr. Smith,

I wanted to let you know the new medication has been helping with my sleep, but I'm still feeling pretty down most days. It's hard to get motivated to do anything. I'm not having any thoughts of hurting myself, but I just feel stuck. Should we schedule a follow-up?`,
  },
  {
    id: 'msg-after-hours',
    title: 'After Hours Question',
    description: 'Non-urgent evening message',
    category: 'After Hours',
    input: `Hi Doctor,

Sorry to message so late but I forgot to ask at my appointment today - is it okay to take the antibiotic with food? I get an upset stomach easily.

Thanks!`,
  },
  {
    id: 'msg-decline-request',
    title: 'Inappropriate Request',
    description: 'Patient requesting something that should be declined',
    category: 'Boundaries',
    input: `Doctor,

My friend takes Xanax and it really helps her. I've been stressed and can't sleep. Can you prescribe me some? I don't think I need an appointment for that.`,
  },
];

export const documentationDemoScenarios: DemoScenario[] = [
  {
    id: 'doc-peds-acute',
    title: 'Pediatric Acute - Ear Infection',
    description: '2-year-old with otalgia and fever',
    category: 'Pediatrics',
    input: `Visit: 2-year-old Emma Johnson
Chief Complaint: Ear pain x 2 days, fever
HPI Notes: Mom reports fever to 102, pulling at right ear, decreased appetite, fussy. No vomiting, no rash. Older sibling had cold last week.
Vitals: T 101.8, HR 120, RR 24
Exam: TMs - R bulging, erythematous, decreased mobility. L normal. Pharynx clear. Neck supple. Lungs clear.
Assessment: Right acute otitis media
Plan: Amoxicillin 80mg/kg/day divided BID x 10 days, return if worse or not improving in 48-72h`,
  },
  {
    id: 'doc-adult-chronic',
    title: 'Adult Chronic - Diabetes Follow-up',
    description: 'Type 2 DM quarterly visit',
    category: 'Adult',
    input: `Visit: 58-year-old Robert Chen
Chief Complaint: Diabetes follow-up
HPI Notes: Here for quarterly DM check. Reports good compliance with metformin. Checking sugars 2-3x/week, mostly 120-150 fasting. Occasional 180s after big meals. No hypoglycemia. Walking 20 min daily.
Vitals: BP 132/78, HR 72, Wt 198 (down 3 lbs)
Labs: A1c 7.2% (was 7.6%), Cr 0.9, lipids at goal
Exam: General - well appearing. Feet - sensation intact, no lesions, pulses 2+
Assessment: T2DM - improved control
Plan: Continue metformin 1000 BID, encourage continued lifestyle. Recheck A1c in 3 months. Eye exam due. F/u 3 months.`,
  },
  {
    id: 'doc-well-child',
    title: 'Well Child Visit - 4 Year',
    description: 'Routine well child exam',
    category: 'Pediatrics',
    input: `Visit: 4-year-old Maya Williams
Chief Complaint: Well child check
Development: Speaks in sentences, knows colors and shapes, dresses self with help, rides tricycle. Potty trained day and night.
Growth: Wt 35 lbs (50%), Ht 40 in (60%), BMI 15.4
Vitals: BP 90/55, HR 95
Exam: Normal 4yo exam, hearing screen passed, vision 20/30 OU
Immunizations: DTaP, IPV, MMR, Varicella given today
Anticipatory Guidance: Car seat safety, water safety, screen time limits, healthy eating
Plan: Return 5 year check, dental visit if not yet established`,
  },
  {
    id: 'doc-mental-health',
    title: 'Mental Health Visit',
    description: 'Depression follow-up',
    category: 'Mental Health',
    input: `Visit: 34-year-old Jennifer Park
Chief Complaint: Depression follow-up
HPI Notes: Started sertraline 50mg 6 weeks ago. Reports improved mood, sleeping better (6-7 hrs vs 4), more energy. PHQ-9 today: 8 (was 18). Still some anhedonia - "I can do things but don't enjoy them yet." No SI/HI. Tolerating medication well, no side effects.
MSE: Dressed appropriately, good hygiene. Mood "better." Affect brighter than last visit, reactive. Thought process linear. No SI.
Assessment: MDD, responding to treatment
Plan: Continue sertraline 50mg. Consider increase to 75mg if plateau. Return 6 weeks. Encouraged continued therapy.`,
  },
  {
    id: 'doc-uncertainty',
    title: 'Diagnostic Uncertainty',
    description: 'Unclear diagnosis requiring workup',
    category: 'Complex',
    input: `Visit: 45-year-old Michael Torres
Chief Complaint: Fatigue x 2 months
HPI Notes: Progressive fatigue, needs to rest after work. No chest pain, dyspnea, or edema. Appetite okay, no weight loss. Sleep seems adequate (7-8 hrs). Mood okay - "just tired." No recent illness. Denies fever, night sweats.
PMH: HTN, otherwise healthy
Vitals: BP 128/82, HR 68, afebrile
Exam: Unremarkable - no lymphadenopathy, thyroid normal, heart/lungs normal, no hepatosplenomegaly
Assessment: Fatigue - etiology unclear. DDx: anemia, thyroid, sleep apnea, depression, occult malignancy (low suspicion)
Plan: CBC, CMP, TSH, ferritin. PHQ-2 negative but will monitor. Sleep history reviewed - possible OSA given snoring. Consider sleep study if labs unrevealing. Return 1-2 weeks.`,
  },
];

export const demoScenarios = {
  messaging: messagingDemoScenarios,
  documentation: documentationDemoScenarios,
};
```

### 4. Demo Generate API (`src/app/api/demo-generate/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

function buildMessagingStyleInjection(profile: any): string {
  if (!profile) return '';

  return `
## YOUR COMMUNICATION STYLE

Match this provider's voice exactly.

### Surface Patterns
- **Greetings:** ${profile.surfacePatterns?.greetings || 'Professional greeting'}
- **Closings:** ${profile.surfacePatterns?.closings || 'Professional sign-off'}
- **Length:** ${profile.surfacePatterns?.lengthTendency || 'Medium length'}
- **Structure:** ${profile.surfacePatterns?.paragraphStructure || 'Clear paragraphs'}

### Tone Calibration
${profile.toneDimensions ? Object.entries(profile.toneDimensions).map(([dim, data]: [string, any]) =>
  `- **${dim}** (${data.score}/10): ${data.description}`
).join('\n') : '- Balanced professional tone'}

### NEVER Do These
${profile.negativeConstraints?.neverUsePhrases?.map((p: string) => `- Never use: "${p}"`).join('\n') || ''}
${profile.negativeConstraints?.avoid?.map((a: string) => `- Avoid: ${a}`).join('\n') || ''}

### Signature Moves
${profile.signatureMoves?.map((m: string) => `- ${m}`).join('\n') || ''}

### Voice Summary
${profile.voiceSummary || 'Professional, caring communication style.'}
`.trim();
}

function buildDocumentationStyleInjection(profile: any): string {
  if (!profile) return '';

  return `
## DOCUMENTATION STYLE

Match this provider's clinical documentation voice.

### Structure Preferences
- **Note Organization:** ${profile.structuralPatterns?.noteOrganization || 'SOAP format'}
- **HPI Style:** ${profile.structuralPatterns?.hpiConstruction || 'Narrative'}
- **Assessment:** ${profile.structuralPatterns?.assessmentSection || 'Problem-focused'}
- **Plan:** ${profile.structuralPatterns?.planSection || 'Actionable items'}

### Voice Calibration
${profile.voiceDimensions ? Object.entries(profile.voiceDimensions).map(([dim, data]: [string, any]) =>
  `- **${dim.replace(/([A-Z])/g, ' $1').trim()}** (${data.score}/10): ${data.description}`
).join('\n') : '- Balanced clinical documentation'}

### Standard Phrasings
${profile.standardPhrasings?.hpiOpenings?.length ? `**HPI:** ${profile.standardPhrasings.hpiOpenings.join(' | ')}` : ''}
${profile.standardPhrasings?.assessmentLanguage?.length ? `**Assessment:** ${profile.standardPhrasings.assessmentLanguage.join(' | ')}` : ''}
${profile.standardPhrasings?.planLanguage?.length ? `**Plan:** ${profile.standardPhrasings.planLanguage.join(' | ')}` : ''}

### NEVER Do These
${profile.negativeConstraints?.neverUsePhrases?.map((p: string) => `- Never use: "${p}"`).join('\n') || ''}

### Voice Summary
${profile.voiceSummary || 'Professional clinical documentation style.'}
`.trim();
}

export async function POST(request: Request) {
  try {
    const { track, profile, rawProfile, input } = await request.json();

    const isDocumentation = track === 'documentation';
    const styleInjection = isDocumentation
      ? buildDocumentationStyleInjection(profile)
      : buildMessagingStyleInjection(profile);

    const systemPrompt = isDocumentation
      ? `You are helping a healthcare provider write clinical documentation. Generate a complete note that matches their exact documentation style.

${styleInjection}

## RULES
1. Only use information provided - never fabricate findings
2. Match the provider's structure and phrasing preferences
3. Output only the note content - no explanations

Generate the clinical note based on the visit details provided.`
      : `You are helping a healthcare provider draft a portal message response. Match their exact communication style.

${styleInjection}

## RULES
1. Sound natural - like this specific provider wrote it
2. Be clinically appropriate but not diagnostic
3. Output only the message - no explanations

Write a response to the patient message provided.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: isDocumentation
            ? `Write a clinical note for this visit:\n\n${input}`
            : `Write a response to this patient message:\n\n${input}`,
        },
      ],
    });

    const draft = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Demo generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
```

### 5. Modify Profile API (`src/app/api/modify-profile/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

export async function POST(request: Request) {
  try {
    const { track, currentProfile, modification } = await request.json();

    const systemPrompt = `You are a profile modification assistant. Given a style profile JSON and a natural language modification request, output an updated version of the profile JSON.

## RULES
1. Only modify fields relevant to the request
2. Preserve all other fields exactly
3. For score changes, adjust appropriately (1-10 scale)
4. For text changes, rewrite to reflect the requested change
5. Output ONLY valid JSON - no explanation, no markdown

## EXAMPLE MODIFICATIONS
- "make it warmer" → increase warmth score, adjust descriptions to be more empathetic
- "shorter responses" → reduce lengthTendency, adjust thoroughness down
- "more professional" → increase formality score, remove casual phrases
- "add 'Take care' as a closing" → add to surfacePatterns.closings
- "never say 'Unfortunately'" → add to negativeConstraints.neverUsePhrases`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Current ${track} profile:
\`\`\`json
${JSON.stringify(currentProfile, null, 2)}
\`\`\`

Modification requested: "${modification}"

Output the modified profile JSON:`,
        },
      ],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse the JSON response
    let modifiedProfile;
    try {
      // Try direct parse first
      modifiedProfile = JSON.parse(content);
    } catch {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        modifiedProfile = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse modified profile');
      }
    }

    return NextResponse.json({ modifiedProfile });
  } catch (error) {
    console.error('Profile modification error:', error);
    return NextResponse.json({ error: 'Modification failed' }, { status: 500 });
  }
}
```

### 6. Profile Refiner Component (`src/components/demo/ProfileRefiner.tsx`)

```tsx
'use client';

import { Wand2, Eye } from 'lucide-react';

interface ProfileRefinerProps {
  value: string;
  onChange: (value: string) => void;
  onRefine: () => void;
  isRefining: boolean;
  onViewProfile: () => void;
}

export function ProfileRefiner({
  value,
  onChange,
  onRefine,
  isRefining,
  onViewProfile,
}: ProfileRefinerProps) {
  const suggestions = [
    'Make it warmer',
    'Shorter responses',
    'More professional',
    'Less formal',
    'Add more empathy',
    'Be more direct',
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-[var(--charcoal)] mb-4">
        Refine Your Profile
      </h2>

      <p className="text-sm text-[var(--gray)] mb-4">
        Describe how you'd like to modify your profile in natural language.
        The AI will update your profile and regenerate the draft.
      </p>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onChange(suggestion)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Text input */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., 'Make responses warmer with more empathy, but keep them concise'"
        className="w-full h-20 p-3 border border-gray-300 rounded-lg text-sm resize-none"
      />

      {/* Actions */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={onViewProfile}
          className="flex items-center gap-2 text-sm text-[var(--mid-blue)] hover:text-[var(--deep-blue)]"
        >
          <Eye className="w-4 h-4" />
          View Current Profile
        </button>

        <button
          onClick={onRefine}
          disabled={isRefining || !value.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--orange)] text-white rounded-lg font-medium hover:bg-[var(--bright-orange)] transition-colors disabled:opacity-50"
        >
          <Wand2 className="w-4 h-4" />
          {isRefining ? 'Applying...' : 'Apply Changes & Re-test'}
        </button>
      </div>
    </div>
  );
}
```

### 7. Additional Components (Simplified)

**TrackSelector.tsx:**
```tsx
'use client';

import { MessageSquare, FileText } from 'lucide-react';

interface TrackSelectorProps {
  selectedTrack: 'messaging' | 'documentation';
  onTrackChange: (track: 'messaging' | 'documentation') => void;
  messagingAvailable: boolean;
  documentationAvailable: boolean;
}

export function TrackSelector({
  selectedTrack,
  onTrackChange,
  messagingAvailable,
  documentationAvailable,
}: TrackSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => onTrackChange('messaging')}
          disabled={!messagingAvailable}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedTrack === 'messaging'
              ? 'bg-[var(--sky-blue)] text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          } ${!messagingAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <MessageSquare className="w-5 h-5" />
          Portal Messaging
        </button>

        <button
          onClick={() => onTrackChange('documentation')}
          disabled={!documentationAvailable}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedTrack === 'documentation'
              ? 'bg-[var(--deep-blue)] text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          } ${!documentationAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FileText className="w-5 h-5" />
          Clinical Documentation
        </button>
      </div>
    </div>
  );
}
```

**ScenarioSelector.tsx:**
```tsx
'use client';

import { demoScenarios } from '@/data/demoScenarios';

interface ScenarioSelectorProps {
  track: 'messaging' | 'documentation';
  onScenarioSelect: (input: string) => void;
}

export function ScenarioSelector({ track, onScenarioSelect }: ScenarioSelectorProps) {
  const scenarios = demoScenarios[track];

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
        Example Scenarios
      </label>
      <select
        onChange={(e) => {
          const scenario = scenarios.find((s) => s.id === e.target.value);
          if (scenario) onScenarioSelect(scenario.input);
        }}
        className="w-full p-2 border border-gray-300 rounded-lg"
        defaultValue=""
      >
        <option value="" disabled>
          Select an example scenario...
        </option>
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.title} - {scenario.description}
          </option>
        ))}
      </select>
    </div>
  );
}
```

**CustomInputEditor.tsx:**
```tsx
'use client';

interface CustomInputEditorProps {
  track: 'messaging' | 'documentation';
  value: string;
  onChange: (value: string) => void;
}

export function CustomInputEditor({ track, value, onChange }: CustomInputEditorProps) {
  const placeholder =
    track === 'messaging'
      ? 'Or write a custom patient message to test...\n\nExample:\nHi Doctor,\nI have a question about my medication...'
      : 'Or write custom visit details to test...\n\nExample:\nVisit: 45-year-old with knee pain\nChief Complaint: Right knee pain x 1 week\n...';

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
        {track === 'messaging' ? 'Patient Message' : 'Visit Details'}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-40 p-3 border border-gray-300 rounded-lg text-sm font-mono resize-none"
      />
    </div>
  );
}
```

**OutputDisplay.tsx:**
```tsx
'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface OutputDisplayProps {
  output: string;
  track: 'messaging' | 'documentation';
}

export function OutputDisplay({ output, track }: OutputDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[var(--charcoal)]">
          Generated {track === 'messaging' ? 'Response' : 'Note'}
        </h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-sm text-[var(--mid-blue)] hover:text-[var(--deep-blue)]"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div
        className={`p-4 rounded-lg border ${
          track === 'messaging'
            ? 'bg-blue-50 border-blue-100'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <pre className="whitespace-pre-wrap text-sm text-[var(--charcoal)] font-sans">
          {output}
        </pre>
      </div>
    </div>
  );
}
```

**ProfileViewer.tsx:**
```tsx
'use client';

import { X, Download, Copy } from 'lucide-react';

interface ProfileViewerProps {
  profile: any;
  track: 'messaging' | 'documentation';
  onClose: () => void;
  fullData: any;
}

export function ProfileViewer({ profile, track, onClose, fullData }: ProfileViewerProps) {
  const handleDownload = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      [track]: {
        generatedProfile: profile,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modified-${track}-profile-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium text-[var(--charcoal)]">
            Current {track === 'messaging' ? 'Messaging' : 'Documentation'} Profile
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <pre className="text-xs font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Copy className="w-4 h-4" />
            Copy JSON
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--lime-green)] text-white rounded-lg hover:bg-[var(--apple-green)]"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Navigation Update

Add link to demo page in landing page and navigation:

**In `src/app/page.tsx`, add after track cards:**
```tsx
{/* Demo Link */}
<div className="mt-8 text-center">
  <Link
    href="/demo"
    className="inline-flex items-center gap-2 text-[var(--mid-blue)] hover:text-[var(--deep-blue)] transition-colors"
  >
    <Beaker className="w-5 h-5" />
    Test your profile in the Playground
  </Link>
</div>
```

**In `src/components/layout/AppLayout.tsx` header:**
```tsx
<Link
  href="/demo"
  className="text-[var(--mid-blue)] hover:text-[var(--deep-blue)] transition-colors"
>
  Playground
</Link>
```

---

## Summary

This feature adds:
- **1 new page:** `/demo` playground
- **7 new components:** ProfileLoader, TrackSelector, ScenarioSelector, CustomInputEditor, OutputDisplay, ProfileRefiner, ProfileViewer
- **1 new data file:** demoScenarios.ts with 11 pre-built scenarios
- **2 new API routes:** demo-generate and modify-profile
- **Navigation updates:** Links from home page and header

The natural language profile modification uses Claude to interpret requests like "make it warmer" and update the appropriate JSON fields, then automatically regenerates the test output.
