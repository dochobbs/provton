// Messaging Profile Types
export interface MessagingColdResponses {
  scenario1A: string; // Peds: Anxious + Acute
  scenario1B: string; // FM: Routine + Medication
  scenario1C: string; // FM: Frustrated + Results
}

export interface PairSelection {
  selected: 'A' | 'B' | null;
  edits: string | null;
}

export interface MessagingPairSelections {
  pair2A: PairSelection; // Reassurance
  pair2B: PairSelection; // Triage-Up
  pair2C: PairSelection; // Medication/Clinical Detail
  pair2D: PairSelection; // Mental Health
  pair2E: PairSelection; // Admin/Scheduling
  pair2F: PairSelection; // After-Hours/Boundary
}

export interface MessagingAntiExamples {
  forbiddenPhrases: string;
  closersNeverUsed: string[];
  openersNeverUsed: string[];
  stylisticAversions: string[];
  petPeeves: string;
}

export interface EditCapture {
  original: string;
  edited: string;
}

export interface MessagingEditCapture {
  scenario4A: EditCapture; // Peds: Developmental Concern
  scenario4B: EditCapture; // FM: Chronic Disease Management
  scenario4C: EditCapture; // Mixed: Sensitive Decline
}

export interface MessagingValues {
  uncertainty: number; // 1-10
  length: number; // 1-10
  warmth: number; // 1-10
  directiveStyle: number; // 1-10
  decliningRequests: string;
  emotionalPatient: string;
  afterHours: string;
  uncertaintyHandling: string;
  philosophy: string;
}

export interface StyleProfile {
  surfacePatterns: {
    greetings: string;
    closings: string;
    lengthTendency: string;
    paragraphStructure: string;
    punctuationPatterns: string;
  };
  toneDimensions: {
    warmth: { score: number; description: string };
    certainty: { score: number; description: string };
    directiveness: { score: number; description: string };
    formality: { score: number; description: string };
    thoroughness: { score: number; description: string };
  };
  negativeConstraints: {
    neverUsePhrases: string[];
    neverUsePatterns: string[];
    avoid: string[];
  };
  judgmentPatterns: {
    uncertaintyHandling: string;
    escalationStyle: string;
    decliningRequests: string;
    emotionalResponsiveness: string;
    afterHoursApproach: string;
  };
  signatureMoves: string[];
  voiceSummary: string;
  exampleFragments: string[];
}

export interface MessagingProfile {
  coldResponses: MessagingColdResponses;
  pairSelections: MessagingPairSelections;
  antiExamples: MessagingAntiExamples;
  editCapture: MessagingEditCapture;
  values: MessagingValues;
  generatedProfile: StyleProfile | null;
  userCorrections: string | null;
  completedAt: string | null;
}

// Documentation Profile Types
export interface DocumentationStructure {
  overallStructure: string;
  planOrganization: string;
  assessmentStyle: string;
  hpiConstruction: string;
  physicalExamStyle: string;
  templateUsage: number; // 1-10
}

export interface DocumentationColdResponses {
  hpiPediatricAcute: string;
  hpiAdultChronic: string;
  apPediatricWellChild: string;
  apDiagnosticUncertainty: string;
  apMentalHealth: string;
}

export interface DocumentationPairSelections {
  pair3A: PairSelection; // HPI Verbosity
  pair3B: PairSelection; // Assessment Reasoning
  pair3C: PairSelection; // Plan Specificity
  pair3D: PairSelection; // Documenting Uncertainty
  pair3E: PairSelection; // Physical Exam Detail
  pair3F: PairSelection; // Counseling Documentation
}

export interface DocumentationAntiExamples {
  forbiddenPhrases: string;
  documentationPetPeeves: string;
  patternsAvoided: string[];
  styleAversions: string[];
}

export interface DocumentationEditCapture {
  scenario5A: EditCapture; // Pediatric Acute Visit
  scenario5B: EditCapture; // Adult Chronic Disease
  scenario5C: EditCapture; // Mental Health Visit
}

export interface DocumentationValues {
  verbosity: number; // 1-10
  reasoningVisibility: number; // 1-10
  medicolegalAwareness: number; // 1-10
  templateFlexibility: number; // 1-10
  patientQuoteUsage: string;
  openNotesAwareness: string;
  uncertaintyDocumentation: string;
  sensitiveInfoHandling: string;
  billingConsiderations: number; // 1-10
  documentationPhilosophy: string;
}

export interface DocumentationSpecialty {
  practiceType: string;
  growthDocStyle?: string;
  developmentDocStyle?: string;
  anticipatoryGuidanceDoc?: string;
  chronicDiseaseDocStyle?: string;
  preventiveCareDoc?: string;
  medicationReconciliationDoc?: string;
}

export interface DocumentationStyleProfile {
  structuralPatterns: {
    noteOrganization: string;
    hpiConstruction: string;
    assessmentSection: string;
    planSection: string;
    physicalExam: string;
    ros: string;
  };
  voiceDimensions: {
    verbosity: { score: number; description: string };
    reasoningVisibility: { score: number; description: string };
    formality: { score: number; description: string };
    certaintyExpression: { score: number; description: string };
    patientCenteredness: { score: number; description: string };
    defensiveness: { score: number; description: string };
  };
  negativeConstraints: {
    neverUsePhrases: string[];
    neverUsePatterns: string[];
    avoid: string[];
  };
  standardPhrasings: {
    hpiOpenings: string[];
    transitionPhrases: string[];
    assessmentLanguage: string[];
    planLanguage: string[];
    closingSafetyNet: string[];
  };
  visitTypeVariations: {
    acuteVisits: string;
    chronicFollowUp: string;
    wellVisits: string;
    mentalHealth: string;
    complexDiagnostic: string;
  };
  signatureMoves: string[];
  voiceSummary: string;
  exampleFragments: string[];
}

export interface DocumentationProfile {
  structure: DocumentationStructure;
  coldResponses: DocumentationColdResponses;
  pairSelections: DocumentationPairSelections;
  antiExamples: DocumentationAntiExamples;
  editCapture: DocumentationEditCapture;
  values: DocumentationValues;
  specialty: DocumentationSpecialty;
  generatedProfile: DocumentationStyleProfile | null;
  userCorrections: string | null;
  completedAt: string | null;
}

// App State
export interface AppState {
  messagingProfile: MessagingProfile;
  documentationProfile: DocumentationProfile;
  messagingStep: number;
  documentationStep: number;
}

export type TrackType = 'messaging' | 'documentation';
