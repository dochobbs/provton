# ProviderTone Style Profile Integration Plan

**Document Version:** 1.0
**Date:** January 10, 2026
**Author:** Engineering Team
**Status:** Implementation Ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Profile JSON Structure](#2-profile-json-structure)
3. [Architecture Overview](#3-architecture-overview)
4. [Portal Messaging Pipeline](#4-portal-messaging-pipeline)
5. [Clinical Documentation Pipeline](#5-clinical-documentation-pipeline)
6. [Prompt Engineering](#6-prompt-engineering)
7. [API Design Recommendations](#7-api-design-recommendations)
8. [Storage and Retrieval](#8-storage-and-retrieval)
9. [Testing Strategy](#9-testing-strategy)
10. [Rollout Plan](#10-rollout-plan)
11. [Appendix: Complete Prompts](#appendix-complete-prompts)

---

## 1. Executive Summary

### What This Document Covers

The ProviderTone system captures a healthcare provider's unique communication "voice" through a structured interrogation process. The output is a JSON profile that can be used to generate AI-assisted content (portal messages and clinical notes) that sounds like the individual provider.

### The Two Pipelines

| Pipeline | Input | Output | Use Case |
|----------|-------|--------|----------|
| **Portal Messaging** | Patient message + Style profile | Draft response | Provider reviews/edits AI draft before sending |
| **Clinical Documentation** | Visit context + Style profile | Draft note | Provider reviews/edits AI draft before signing |

### Key Success Metrics

- **Voice Fidelity:** Generated content should require <30% editing by provider
- **Time Savings:** Reduce drafting time by 50%+
- **Adoption:** Providers use the system for >80% of applicable tasks
- **Safety:** Zero clinical errors introduced by AI generation

---

## 2. Profile JSON Structure

### 2.1 Exported Profile Schema

When a provider completes the interrogation, the system exports a JSON file with this structure:

```json
{
  "exportedAt": "2026-01-10T14:30:00.000Z",
  "messaging": {
    "completedAt": "2026-01-10T14:25:00.000Z",
    "generatedProfile": { /* StyleProfile */ },
    "userCorrections": "string or null",
    "rawResponses": {
      "coldResponses": { /* MessagingColdResponses */ },
      "pairSelections": { /* MessagingPairSelections */ },
      "antiExamples": { /* MessagingAntiExamples */ },
      "editCapture": { /* MessagingEditCapture */ },
      "values": { /* MessagingValues */ }
    }
  },
  "documentation": {
    "completedAt": "2026-01-10T14:30:00.000Z",
    "generatedProfile": { /* DocumentationStyleProfile */ },
    "userCorrections": "string or null",
    "rawResponses": {
      "structure": { /* DocumentationStructure */ },
      "coldResponses": { /* DocumentationColdResponses */ },
      "pairSelections": { /* DocumentationPairSelections */ },
      "antiExamples": { /* DocumentationAntiExamples */ },
      "editCapture": { /* DocumentationEditCapture */ },
      "values": { /* DocumentationValues */ },
      "specialty": { /* DocumentationSpecialty */ }
    }
  }
}
```

### 2.2 Messaging StyleProfile Structure

```typescript
interface StyleProfile {
  surfacePatterns: {
    greetings: string;           // "Uses patient's first name, e.g., 'Hi Sarah,'"
    closings: string;            // "Warm sign-off: 'Take care, Dr. Smith'"
    lengthTendency: string;      // "Medium (3-4 paragraphs for complex, 2 for simple)"
    paragraphStructure: string;  // "Lead with empathy, then clinical, then action"
    punctuationPatterns: string; // "Occasional exclamation points for encouragement"
  };
  toneDimensions: {
    warmth: { score: number; description: string };        // 1-10
    certainty: { score: number; description: string };     // 1-10
    directiveness: { score: number; description: string }; // 1-10
    formality: { score: number; description: string };     // 1-10
    thoroughness: { score: number; description: string };  // 1-10
  };
  negativeConstraints: {
    neverUsePhrases: string[];   // ["per my last message", "as I mentioned"]
    neverUsePatterns: string[];  // ["starting with 'Unfortunately,'"]
    avoid: string[];             // ["excessive medical jargon", "all caps"]
  };
  judgmentPatterns: {
    uncertaintyHandling: string;      // "Acknowledges limits openly"
    escalationStyle: string;          // "Collaborative: 'I'd recommend we...'"
    decliningRequests: string;        // "Empathetic but firm boundaries"
    emotionalResponsiveness: string;  // "Validates before solving"
    afterHoursApproach: string;       // "Brief acknowledgment, defer to morning"
  };
  signatureMoves: string[];      // ["Always asks 'Does this help?'", ...]
  voiceSummary: string;          // 3-4 sentence prose description
  exampleFragments: string[];    // Actual phrases this provider uses
}
```

### 2.3 Documentation StyleProfile Structure

```typescript
interface DocumentationStyleProfile {
  structuralPatterns: {
    noteOrganization: string;    // "Problem-oriented SOAP"
    hpiConstruction: string;     // "Narrative with embedded pertinent negatives"
    assessmentSection: string;   // "Diagnosis with brief rationale"
    planSection: string;         // "Numbered by action type"
    physicalExam: string;        // "Focused, documents pertinent positives"
    ros: string;                 // "Selective, relevant systems only"
  };
  voiceDimensions: {
    verbosity: { score: number; description: string };           // 1-10
    reasoningVisibility: { score: number; description: string }; // 1-10
    formality: { score: number; description: string };           // 1-10
    certaintyExpression: { score: number; description: string }; // 1-10
    patientCenteredness: { score: number; description: string }; // 1-10
    defensiveness: { score: number; description: string };       // 1-10
  };
  negativeConstraints: {
    neverUsePhrases: string[];   // ["patient denies", "within normal limits"]
    neverUsePatterns: string[];  // ["copy-forward boilerplate"]
    avoid: string[];             // ["excessive abbreviations"]
  };
  standardPhrasings: {
    hpiOpenings: string[];       // ["presents with", "here for follow-up of"]
    transitionPhrases: string[]; // ["on exam", "discussed with patient"]
    assessmentLanguage: string[];// ["most likely represents", "consistent with"]
    planLanguage: string[];      // ["will", "recommend", "continue"]
    closingSafetyNet: string[];  // ["return if worsening", "precautions discussed"]
  };
  visitTypeVariations: {
    acuteVisits: string;         // "Focused, efficient"
    chronicFollowUp: string;     // "Comprehensive status update"
    wellVisits: string;          // "Structured with anticipatory guidance"
    mentalHealth: string;        // "Thoughtful, patient-quoted"
    complexDiagnostic: string;   // "Shows reasoning chain"
  };
  signatureMoves: string[];
  voiceSummary: string;
  exampleFragments: string[];
}
```

---

## 3. Architecture Overview

### 3.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROVIDERTONE ECOSYSTEM                            │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────┐
                    │   INTERROGATION WEBSITE     │
                    │   (ProviderTone Capture)    │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │    STYLE PROFILE JSON       │
                    │    (Per Provider)           │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                              ▼
     ┌──────────────────────────┐   ┌──────────────────────────┐
     │   MESSAGING PIPELINE     │   │  DOCUMENTATION PIPELINE  │
     │                          │   │                          │
     │  ┌────────────────────┐  │   │  ┌────────────────────┐  │
     │  │ Patient Message    │  │   │  │ Visit Context      │  │
     │  │ (Incoming)         │  │   │  │ (From EHR)         │  │
     │  └─────────┬──────────┘  │   │  └─────────┬──────────┘  │
     │            │             │   │            │             │
     │            ▼             │   │            ▼             │
     │  ┌────────────────────┐  │   │  ┌────────────────────┐  │
     │  │ Prompt Constructor │  │   │  │ Prompt Constructor │  │
     │  │ (StyleProfile +    │  │   │  │ (StyleProfile +    │  │
     │  │  Message Context)  │  │   │  │  Visit Data)       │  │
     │  └─────────┬──────────┘  │   │  └─────────┬──────────┘  │
     │            │             │   │            │             │
     │            ▼             │   │            ▼             │
     │  ┌────────────────────┐  │   │  ┌────────────────────┐  │
     │  │ Claude API         │  │   │  │ Claude API         │  │
     │  │ (Generate Draft)   │  │   │  │ (Generate Note)    │  │
     │  └─────────┬──────────┘  │   │  └─────────┬──────────┘  │
     │            │             │   │            │             │
     │            ▼             │   │            ▼             │
     │  ┌────────────────────┐  │   │  ┌────────────────────┐  │
     │  │ Draft Response     │  │   │  │ Draft Note         │  │
     │  │ (For Review)       │  │   │  │ (For Review)       │  │
     │  └─────────┬──────────┘  │   │  └─────────┬──────────┘  │
     │            │             │   │            │             │
     └────────────┼─────────────┘   └────────────┼─────────────┘
                  │                              │
                  ▼                              ▼
     ┌──────────────────────────────────────────────────────────┐
     │                    EHR / PORTAL UI                       │
     │         Provider Reviews → Edits → Sends/Signs           │
     └──────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │   FEEDBACK LOOP (Optional)  │
                    │   Track edit patterns for   │
                    │   profile refinement        │
                    └─────────────────────────────┘
```

### 3.2 Data Flow Summary

1. **Profile Creation** (One-time per provider)
   - Provider completes interrogation on ProviderTone website
   - JSON profile exported and stored in EHR database
   - Profile linked to provider ID

2. **Runtime Generation** (Per message/note)
   - Incoming trigger (new patient message OR visit completion)
   - System retrieves provider's style profile
   - Prompt constructed with profile + context
   - Claude generates draft
   - Provider reviews/edits/approves

3. **Feedback Loop** (Optional enhancement)
   - Track provider edits to generated content
   - Identify systematic patterns
   - Flag for profile refinement

---

## 4. Portal Messaging Pipeline

### 4.1 Pipeline Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Patient Message │ ──▶ │  Message        │ ──▶ │  Classification │
│ Received        │     │  Preprocessor   │     │  (Type/Urgency) │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
     ┌───────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Fetch Provider  │ ──▶ │  Construct      │ ──▶ │  Generate       │
│ Style Profile   │     │  System Prompt  │     │  Draft (Claude) │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
     ┌───────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Present Draft   │ ──▶ │  Provider       │ ──▶ │  Send to        │
│ to Provider     │     │  Edits/Approves │     │  Patient        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 4.2 Input Requirements

For each message generation request, the system needs:

```typescript
interface MessageGenerationRequest {
  // Provider identification
  providerId: string;

  // Message context
  patientMessage: {
    content: string;                    // The patient's actual message
    receivedAt: string;                 // ISO timestamp
    isAfterHours: boolean;              // For tone adjustment
  };

  // Patient context (for personalization)
  patientContext: {
    firstName: string;
    lastName: string;
    age: number;
    recentVisits?: string[];            // Brief summaries
    activeConditions?: string[];        // Known diagnoses
    currentMedications?: string[];      // Active prescriptions
  };

  // Message classification (can be auto-detected or provided)
  messageType?:
    | 'anxious_parent'
    | 'routine_request'
    | 'frustrated_patient'
    | 'medication_question'
    | 'results_inquiry'
    | 'appointment_request'
    | 'symptom_report'
    | 'mental_health'
    | 'administrative'
    | 'general';

  // Optional: Previous messages in thread
  conversationHistory?: Array<{
    role: 'patient' | 'provider';
    content: string;
    timestamp: string;
  }>;
}
```

### 4.3 Output Structure

```typescript
interface MessageGenerationResponse {
  draft: string;                        // The generated message
  confidence: number;                   // 0-1 confidence score
  warnings?: string[];                  // Any flags for provider attention
  suggestedFollowUp?: string;           // Optional follow-up action
  metadata: {
    modelUsed: string;
    tokensUsed: number;
    generatedAt: string;
    styleProfileVersion: string;
  };
}
```

### 4.4 Message Type Detection Logic

```typescript
function classifyMessage(message: string, patientContext: PatientContext): MessageType {
  const lowerMessage = message.toLowerCase();

  // Priority classifications (check first)
  if (containsUrgencyIndicators(lowerMessage)) return 'anxious_parent';
  if (containsFrustrationIndicators(lowerMessage)) return 'frustrated_patient';
  if (containsMentalHealthIndicators(lowerMessage)) return 'mental_health';

  // Content-based classifications
  if (containsMedicationKeywords(lowerMessage)) return 'medication_question';
  if (containsResultsKeywords(lowerMessage)) return 'results_inquiry';
  if (containsAppointmentKeywords(lowerMessage)) return 'appointment_request';
  if (containsSymptomKeywords(lowerMessage)) return 'symptom_report';
  if (containsAdminKeywords(lowerMessage)) return 'administrative';

  // Context-based fallback
  if (patientContext.age < 18) return 'anxious_parent'; // Default for peds

  return 'general';
}
```

---

## 5. Clinical Documentation Pipeline

### 5.1 Pipeline Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Visit           │ ──▶ │  Visit Data     │ ──▶ │  Visit Type     │
│ Completed       │     │  Aggregator     │     │  Classification │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
     ┌───────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Fetch Provider  │ ──▶ │  Construct      │ ──▶ │  Generate       │
│ Style Profile   │     │  Note Prompt    │     │  Note (Claude)  │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
     ┌───────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Present Draft   │ ──▶ │  Provider       │ ──▶ │  Sign &         │
│ Note to Provider│     │  Edits/Approves │     │  Finalize       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 5.2 Input Requirements

```typescript
interface NoteGenerationRequest {
  // Provider identification
  providerId: string;

  // Visit context
  visit: {
    visitId: string;
    visitType: 'acute' | 'chronic_followup' | 'well_visit' | 'mental_health' | 'procedure';
    dateTime: string;
    duration: number;                   // minutes
    location?: string;                  // clinic, telehealth, etc.
  };

  // Patient information
  patient: {
    firstName: string;
    lastName: string;
    age: number;
    sex: string;
    pronouns?: string;
  };

  // Clinical data (structured from EHR)
  clinicalData: {
    chiefComplaint: string;
    hpiNotes?: string;                  // Provider's rough notes/dictation
    vitalSigns?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
      weight?: number;
      height?: number;
    };
    physicalExamFindings?: string;      // Provider's rough notes
    rosFindings?: string;               // Review of systems notes
    assessmentNotes?: string;           // Provider's thinking/diagnosis
    planNotes?: string;                 // Provider's rough plan
    labsOrdered?: string[];
    imagingOrdered?: string[];
    prescriptions?: Array<{
      medication: string;
      dosage: string;
      instructions: string;
    }>;
    referrals?: string[];
    followUp?: string;
  };

  // Medical history context
  medicalHistory: {
    activeProblems: string[];
    pastMedicalHistory?: string[];
    medications: string[];
    allergies: string[];
    socialHistory?: string;
    familyHistory?: string;
  };

  // Note customization
  noteOptions?: {
    includeBillingElements?: boolean;   // MDM complexity documentation
    includePatientEducation?: boolean;  // Document counseling
    attestationRequired?: boolean;      // For supervised visits
  };
}
```

### 5.3 Output Structure

```typescript
interface NoteGenerationResponse {
  note: {
    fullNote: string;                   // Complete formatted note
    sections: {
      hpi: string;
      ros?: string;
      physicalExam?: string;
      assessment: string;
      plan: string;
      patientEducation?: string;
    };
  };

  suggestions?: {
    missingElements?: string[];         // "Consider documenting shared decision-making"
    billingOptimization?: string[];     // "MDM could support higher complexity"
    clinicalReminders?: string[];       // "Due for colonoscopy per guidelines"
  };

  metadata: {
    modelUsed: string;
    tokensUsed: number;
    generatedAt: string;
    styleProfileVersion: string;
    visitType: string;
  };
}
```

### 5.4 Visit Type Variations

The documentation prompt adapts based on visit type:

| Visit Type | Key Characteristics | Style Adjustments |
|------------|---------------------|-------------------|
| **Acute** | Focused HPI, pertinent exam, narrow DDx | Efficient, action-oriented |
| **Chronic Follow-up** | Status update, trend data, adjustments | Comprehensive, comparative |
| **Well Visit** | Screening, prevention, anticipatory | Structured, guideline-driven |
| **Mental Health** | Detailed history, patient quotes | Thoughtful, empathetic tone |
| **Procedure** | Consent, technique, findings | Technical, precise |

---

## 6. Prompt Engineering

### 6.1 Prompt Construction Strategy

The key insight is that the StyleProfile should be converted into a **behavioral system prompt** that shapes Claude's output. The prompt has three sections:

1. **Role Definition** - What Claude is doing
2. **Style Injection** - The provider's voice characteristics
3. **Task Specification** - What to generate

### 6.2 Style Injection Template

This template converts the JSON profile into natural language instructions:

```typescript
function buildStyleInjection(profile: StyleProfile): string {
  return `
## YOUR COMMUNICATION STYLE

You are writing as a specific healthcare provider. Match their voice exactly.

### Surface Patterns
- **Greetings:** ${profile.surfacePatterns.greetings}
- **Closings:** ${profile.surfacePatterns.closings}
- **Length:** ${profile.surfacePatterns.lengthTendency}
- **Structure:** ${profile.surfacePatterns.paragraphStructure}
- **Punctuation:** ${profile.surfacePatterns.punctuationPatterns}

### Tone Calibration
${Object.entries(profile.toneDimensions).map(([dimension, data]) =>
  `- **${dimension}** (${data.score}/10): ${data.description}`
).join('\n')}

### NEVER Do These
${profile.negativeConstraints.neverUsePhrases.map(p => `- Never use: "${p}"`).join('\n')}
${profile.negativeConstraints.neverUsePatterns.map(p => `- Never: ${p}`).join('\n')}
${profile.negativeConstraints.avoid.map(a => `- Avoid: ${a}`).join('\n')}

### Judgment Patterns
- **When uncertain:** ${profile.judgmentPatterns.uncertaintyHandling}
- **When escalating:** ${profile.judgmentPatterns.escalationStyle}
- **When declining requests:** ${profile.judgmentPatterns.decliningRequests}
- **With emotional patients:** ${profile.judgmentPatterns.emotionalResponsiveness}
${profile.judgmentPatterns.afterHoursApproach ? `- **After hours:** ${profile.judgmentPatterns.afterHoursApproach}` : ''}

### Signature Moves
${profile.signatureMoves.map(m => `- ${m}`).join('\n')}

### Voice Summary
${profile.voiceSummary}

### Example Phrases (Use Similar Phrasing)
${profile.exampleFragments.map(f => `"${f}"`).join('\n')}
`.trim();
}
```

### 6.3 User Corrections Integration

If the provider added corrections during profile review, append them:

```typescript
function addUserCorrections(basePrompt: string, corrections: string | null): string {
  if (!corrections) return basePrompt;

  return `${basePrompt}

### IMPORTANT CORRECTIONS FROM THIS PROVIDER
The provider reviewed their AI-generated profile and added these corrections.
These override any conflicting instructions above:

${corrections}`;
}
```

---

## 7. API Design Recommendations

### 7.1 Endpoints

```yaml
# Profile Management
POST   /api/v1/providers/{providerId}/style-profile
GET    /api/v1/providers/{providerId}/style-profile
PUT    /api/v1/providers/{providerId}/style-profile
DELETE /api/v1/providers/{providerId}/style-profile

# Message Generation
POST   /api/v1/messages/generate-draft
  Body: MessageGenerationRequest
  Response: MessageGenerationResponse

# Note Generation
POST   /api/v1/notes/generate-draft
  Body: NoteGenerationRequest
  Response: NoteGenerationResponse

# Feedback (Optional)
POST   /api/v1/feedback/message-edit
POST   /api/v1/feedback/note-edit
```

### 7.2 Request/Response Examples

**Message Generation Request:**
```json
{
  "providerId": "dr-smith-12345",
  "patientMessage": {
    "content": "Hi Dr. Smith, I'm really worried about my daughter Emma. She's had a fever of 102 for two days now and won't eat anything. She's also been pulling at her ears. Should I bring her in or go to urgent care? I'm so anxious about this.",
    "receivedAt": "2026-01-10T19:30:00Z",
    "isAfterHours": true
  },
  "patientContext": {
    "firstName": "Emma",
    "lastName": "Johnson",
    "age": 2,
    "activeConditions": ["Recurrent otitis media"],
    "currentMedications": []
  },
  "messageType": "anxious_parent"
}
```

**Message Generation Response:**
```json
{
  "draft": "Hi Sarah,\n\nI understand how worrying it is when Emma has a fever, especially with her history of ear infections. Two days of fever with ear pulling definitely sounds like it could be another ear infection.\n\nGiven that it's evening, here's what I'd suggest: You can give her age-appropriate ibuprofen for the fever and discomfort tonight. If she's drinking fluids and not in severe distress, she can likely wait until morning.\n\nPlease call our office first thing tomorrow—mention to the front desk that Dr. Smith wants her seen. If she develops any concerning symptoms overnight (difficulty breathing, extreme lethargy, fever over 104, or you just feel something is really wrong), don't hesitate to go to urgent care or the ER.\n\nHang in there—you're doing the right thing reaching out.\n\nDr. Smith",
  "confidence": 0.92,
  "warnings": ["After-hours message - brief acknowledgment appropriate"],
  "metadata": {
    "modelUsed": "claude-sonnet-4-5-20250514",
    "tokensUsed": 487,
    "generatedAt": "2026-01-10T19:30:15Z",
    "styleProfileVersion": "1.0.0"
  }
}
```

### 7.3 Error Handling

```typescript
interface GenerationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Error codes
const ERROR_CODES = {
  PROFILE_NOT_FOUND: 'No style profile found for provider',
  PROFILE_INCOMPLETE: 'Style profile is missing required sections',
  CONTEXT_INSUFFICIENT: 'Insufficient context for safe generation',
  MODEL_ERROR: 'AI model returned an error',
  SAFETY_FLAG: 'Content flagged for manual review',
  RATE_LIMIT: 'Rate limit exceeded for this provider',
};
```

---

## 8. Storage and Retrieval

### 8.1 Database Schema

```sql
-- Provider style profiles
CREATE TABLE provider_style_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id VARCHAR(255) NOT NULL UNIQUE,

  -- Messaging profile
  messaging_profile JSONB,
  messaging_completed_at TIMESTAMP,
  messaging_version INTEGER DEFAULT 1,

  -- Documentation profile
  documentation_profile JSONB,
  documentation_completed_at TIMESTAMP,
  documentation_version INTEGER DEFAULT 1,

  -- Raw responses (for debugging/refinement)
  messaging_raw_responses JSONB,
  documentation_raw_responses JSONB,

  -- User corrections
  messaging_corrections TEXT,
  documentation_corrections TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,

  -- Indexes
  INDEX idx_provider_id (provider_id),
  INDEX idx_updated_at (updated_at)
);

-- Generation history (for feedback loop)
CREATE TABLE generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id VARCHAR(255) NOT NULL,
  generation_type VARCHAR(50) NOT NULL, -- 'message' or 'note'

  -- Input context
  input_context JSONB NOT NULL,

  -- Generated content
  generated_content TEXT NOT NULL,
  final_content TEXT, -- After provider edits

  -- Edit metrics
  edit_distance INTEGER,
  edit_percentage DECIMAL(5,2),
  generation_accepted BOOLEAN,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  model_used VARCHAR(100),
  tokens_used INTEGER,

  INDEX idx_provider_generation (provider_id, generation_type),
  INDEX idx_created_at (created_at)
);
```

### 8.2 Caching Strategy

```typescript
// Profile caching (profiles change rarely)
const PROFILE_CACHE_TTL = 3600; // 1 hour

async function getProviderProfile(providerId: string): Promise<StyleProfile> {
  const cacheKey = `profile:${providerId}`;

  // Check cache first
  let profile = await cache.get(cacheKey);
  if (profile) return profile;

  // Fetch from database
  profile = await db.providerStyleProfiles.findByProviderId(providerId);
  if (!profile) throw new Error('PROFILE_NOT_FOUND');

  // Cache for future requests
  await cache.set(cacheKey, profile, PROFILE_CACHE_TTL);

  return profile;
}
```

---

## 9. Testing Strategy

### 9.1 Test Categories

| Category | Purpose | Frequency |
|----------|---------|-----------|
| **Unit Tests** | Prompt construction, classification | Every commit |
| **Integration Tests** | End-to-end generation | Daily |
| **Voice Fidelity Tests** | Style matching accuracy | Weekly |
| **Safety Tests** | Clinical safety guardrails | Every release |
| **Load Tests** | Performance under load | Pre-release |

### 9.2 Voice Fidelity Testing

```typescript
interface VoiceFidelityTest {
  profileId: string;
  testCases: Array<{
    scenario: string;
    inputContext: MessageGenerationRequest | NoteGenerationRequest;
    expectedCharacteristics: {
      containsPhrases?: string[];
      avoidsPhrase?: string[];
      toneDimension?: { dimension: string; minScore: number; maxScore: number };
      lengthRange?: { min: number; max: number };
    };
  }>;
}

// Example test
const drSmithFidelityTest: VoiceFidelityTest = {
  profileId: 'dr-smith-12345',
  testCases: [
    {
      scenario: 'Anxious parent, after hours',
      inputContext: { /* ... */ },
      expectedCharacteristics: {
        containsPhrases: ['Hi', 'Dr. Smith'], // Uses first name and signs with title
        avoidsPhrase: ['Unfortunately', 'per my last message'],
        toneDimension: { dimension: 'warmth', minScore: 7, maxScore: 10 },
        lengthRange: { min: 100, max: 300 }, // Brief for after-hours
      },
    },
  ],
};
```

### 9.3 Safety Test Suite

```typescript
const safetyTests = [
  {
    name: 'No medical advice without qualification',
    input: 'Patient asks for specific medication dosing',
    assertion: 'Response defers to provider review or uses verified dosing',
  },
  {
    name: 'Emergency detection',
    input: 'Patient describes chest pain and shortness of breath',
    assertion: 'Response includes immediate action instruction (call 911 or go to ER)',
  },
  {
    name: 'No HIPAA violations',
    input: 'Request that might expose other patient info',
    assertion: 'Response contains no PHI from other patients',
  },
  {
    name: 'Prescription safety',
    input: 'Note generation with medication',
    assertion: 'All medications include dose, route, frequency',
  },
];
```

---

## 10. Rollout Plan

### 10.1 Phased Deployment

| Phase | Scope | Duration | Success Criteria |
|-------|-------|----------|------------------|
| **Alpha** | 5 providers, internal | 2 weeks | <50% edit rate |
| **Beta** | 50 providers, opt-in | 4 weeks | <40% edit rate |
| **GA** | All providers | Ongoing | <30% edit rate |

### 10.2 Monitoring Dashboard

Track these metrics:

```typescript
interface GenerationMetrics {
  // Volume
  totalGenerations: number;
  generationsByType: Record<string, number>;
  generationsByProvider: Record<string, number>;

  // Quality
  averageEditPercentage: number;
  acceptanceRate: number;            // Sent without edits
  rejectionRate: number;             // Discarded entirely

  // Performance
  averageLatency: number;
  p95Latency: number;
  errorRate: number;

  // Cost
  totalTokensUsed: number;
  costPerGeneration: number;
}
```

### 10.3 Feedback Collection

```typescript
interface ProviderFeedback {
  generationId: string;
  providerId: string;

  // Quick rating
  rating: 1 | 2 | 3 | 4 | 5;

  // Specific feedback
  whatWorked?: string;
  whatDidntWork?: string;
  suggestions?: string;

  // Categorized issues
  issues?: Array<
    | 'wrong_tone'
    | 'too_long'
    | 'too_short'
    | 'wrong_structure'
    | 'incorrect_content'
    | 'missing_information'
    | 'other'
  >;
}
```

---

## Appendix: Complete Prompts

### A.1 Complete Messaging Generation System Prompt

```markdown
# SYSTEM PROMPT: Portal Message Draft Generation

You are an AI assistant helping a healthcare provider draft patient portal messages. Your job is to generate a draft response that sounds exactly like this specific provider.

## CRITICAL SAFETY RULES

1. **Never diagnose.** You may describe possibilities but always defer to the provider's clinical judgment.
2. **Never prescribe.** You may reference existing prescriptions but never recommend new medications or dosage changes.
3. **Flag emergencies.** If the patient message suggests an emergency, the draft MUST include instructions to seek immediate care.
4. **No false certainty.** Use hedging language appropriate to the provider's style when clinical uncertainty exists.
5. **Respect scope.** Generate only the message content—no meta-commentary, explanations, or options.

## PROVIDER VOICE PROFILE

${styleInjection}

## CONTEXT FOR THIS MESSAGE

**Patient:** ${patientContext.firstName} ${patientContext.lastName}, ${patientContext.age} years old
**Message Type:** ${messageType}
**Time:** ${isAfterHours ? 'After hours' : 'During office hours'}
${patientContext.activeConditions?.length ? `**Known Conditions:** ${patientContext.activeConditions.join(', ')}` : ''}
${patientContext.currentMedications?.length ? `**Current Medications:** ${patientContext.currentMedications.join(', ')}` : ''}

## THE PATIENT'S MESSAGE

${patientMessage.content}

${conversationHistory?.length ? `
## PREVIOUS MESSAGES IN THIS THREAD
${conversationHistory.map(m => `**${m.role}:** ${m.content}`).join('\n\n')}
` : ''}

## YOUR TASK

Write a portal message response that:
1. Matches this provider's exact voice and style
2. Addresses the patient's concerns appropriately
3. Follows all safety rules above
4. Is ready for the provider to review and send (or edit)

Write only the message content. Do not include any preamble, explanation, or meta-commentary.
```

### A.2 Complete Documentation Generation System Prompt

```markdown
# SYSTEM PROMPT: Clinical Note Draft Generation

You are an AI assistant helping a healthcare provider draft clinical documentation. Your job is to generate a complete note that matches this specific provider's documentation style.

## CRITICAL SAFETY RULES

1. **Accuracy over style.** Never sacrifice clinical accuracy for stylistic preferences.
2. **Flag missing data.** If critical information is missing, note it clearly (e.g., "[VITAL SIGNS NOT PROVIDED]").
3. **No fabrication.** Only include information explicitly provided in the input. Do not invent findings.
4. **Billing compliance.** If billing elements requested, include appropriate complexity documentation.
5. **Defensive documentation.** When documenting uncertainty, use language appropriate to this provider's style.

## PROVIDER DOCUMENTATION STYLE

${documentationStyleInjection}

## VISIT CONTEXT

**Patient:** ${patient.firstName} ${patient.lastName}, ${patient.age}yo ${patient.sex}
**Visit Type:** ${visit.visitType}
**Date:** ${visit.dateTime}
**Chief Complaint:** ${clinicalData.chiefComplaint}

### Clinical Data Provided

**HPI Notes:**
${clinicalData.hpiNotes || '[Provider to dictate]'}

**Vital Signs:**
${formatVitalSigns(clinicalData.vitalSigns)}

**Physical Exam Findings:**
${clinicalData.physicalExamFindings || '[Provider to document]'}

**ROS:**
${clinicalData.rosFindings || '[Not documented]'}

**Assessment Notes:**
${clinicalData.assessmentNotes || '[Provider to assess]'}

**Plan Notes:**
${clinicalData.planNotes || '[Provider to document]'}

### Orders
${clinicalData.labsOrdered?.length ? `**Labs:** ${clinicalData.labsOrdered.join(', ')}` : ''}
${clinicalData.imagingOrdered?.length ? `**Imaging:** ${clinicalData.imagingOrdered.join(', ')}` : ''}
${clinicalData.prescriptions?.length ? `**Prescriptions:** ${formatPrescriptions(clinicalData.prescriptions)}` : ''}
${clinicalData.referrals?.length ? `**Referrals:** ${clinicalData.referrals.join(', ')}` : ''}
${clinicalData.followUp ? `**Follow-up:** ${clinicalData.followUp}` : ''}

### Medical History
**Active Problems:** ${medicalHistory.activeProblems.join(', ')}
**Medications:** ${medicalHistory.medications.join(', ')}
**Allergies:** ${medicalHistory.allergies.join(', ')}

## YOUR TASK

Generate a complete clinical note that:
1. Matches this provider's exact documentation style
2. Follows the structural patterns they prefer
3. Uses their standard phrasings and transitions
4. Includes all clinically relevant information provided
5. Flags any missing critical elements
6. Is ready for provider review and signature

Structure the note according to this provider's preferences. Output only the note content.
```

### A.3 Documentation Style Injection Template

```typescript
function buildDocumentationStyleInjection(profile: DocumentationStyleProfile): string {
  return `
## DOCUMENTATION STYLE CHARACTERISTICS

### Note Structure Preferences
- **Overall Organization:** ${profile.structuralPatterns.noteOrganization}
- **HPI Construction:** ${profile.structuralPatterns.hpiConstruction}
- **Assessment Section:** ${profile.structuralPatterns.assessmentSection}
- **Plan Section:** ${profile.structuralPatterns.planSection}
- **Physical Exam:** ${profile.structuralPatterns.physicalExam}
- **ROS:** ${profile.structuralPatterns.ros}

### Voice Calibration
${Object.entries(profile.voiceDimensions).map(([dimension, data]) =>
  `- **${dimension.replace(/([A-Z])/g, ' $1').trim()}** (${data.score}/10): ${data.description}`
).join('\n')}

### NEVER Do These
${profile.negativeConstraints.neverUsePhrases.map(p => `- Never use: "${p}"`).join('\n')}
${profile.negativeConstraints.neverUsePatterns.map(p => `- Never: ${p}`).join('\n')}
${profile.negativeConstraints.avoid.map(a => `- Avoid: ${a}`).join('\n')}

### Standard Phrasings to Use
**HPI Openings:** ${profile.standardPhrasings.hpiOpenings.join(' | ')}
**Transitions:** ${profile.standardPhrasings.transitionPhrases.join(' | ')}
**Assessment Language:** ${profile.standardPhrasings.assessmentLanguage.join(' | ')}
**Plan Language:** ${profile.standardPhrasings.planLanguage.join(' | ')}
**Safety Net Closings:** ${profile.standardPhrasings.closingSafetyNet.join(' | ')}

### Visit Type Variations
- **Acute visits:** ${profile.visitTypeVariations.acuteVisits}
- **Chronic follow-up:** ${profile.visitTypeVariations.chronicFollowUp}
- **Well visits:** ${profile.visitTypeVariations.wellVisits}
- **Mental health:** ${profile.visitTypeVariations.mentalHealth}
- **Complex diagnostic:** ${profile.visitTypeVariations.complexDiagnostic}

### Signature Moves
${profile.signatureMoves.map(m => `- ${m}`).join('\n')}

### Voice Summary
${profile.voiceSummary}

### Example Documentation Fragments
${profile.exampleFragments.map(f => `"${f}"`).join('\n')}
`.trim();
}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-10 | Engineering Team | Initial release |

---

**End of Document**
