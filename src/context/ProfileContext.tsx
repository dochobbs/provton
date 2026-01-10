'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  AppState,
  MessagingProfile,
  DocumentationProfile,
  MessagingColdResponses,
  MessagingPairSelections,
  MessagingAntiExamples,
  MessagingEditCapture,
  MessagingValues,
  DocumentationStructure,
  DocumentationColdResponses,
  DocumentationPairSelections,
  DocumentationAntiExamples,
  DocumentationEditCapture,
  DocumentationValues,
  DocumentationSpecialty,
  StyleProfile,
  DocumentationStyleProfile,
} from '@/types';

// Initial state factories
const createInitialMessagingProfile = (): MessagingProfile => ({
  coldResponses: {
    scenario1A: '',
    scenario1B: '',
    scenario1C: '',
  },
  pairSelections: {
    pair2A: { selected: null, edits: null },
    pair2B: { selected: null, edits: null },
    pair2C: { selected: null, edits: null },
    pair2D: { selected: null, edits: null },
    pair2E: { selected: null, edits: null },
    pair2F: { selected: null, edits: null },
  },
  antiExamples: {
    forbiddenPhrases: '',
    closersNeverUsed: [],
    openersNeverUsed: [],
    stylisticAversions: [],
    petPeeves: '',
  },
  editCapture: {
    scenario4A: { original: '', edited: '' },
    scenario4B: { original: '', edited: '' },
    scenario4C: { original: '', edited: '' },
  },
  values: {
    uncertainty: 5,
    length: 5,
    warmth: 5,
    directiveStyle: 5,
    decliningRequests: '',
    emotionalPatient: '',
    afterHours: '',
    uncertaintyHandling: '',
    philosophy: '',
  },
  generatedProfile: null,
  userCorrections: null,
  completedAt: null,
});

const createInitialDocumentationProfile = (): DocumentationProfile => ({
  structure: {
    overallStructure: '',
    planOrganization: '',
    assessmentStyle: '',
    hpiConstruction: '',
    physicalExamStyle: '',
    templateUsage: 5,
  },
  coldResponses: {
    hpiPediatricAcute: '',
    hpiAdultChronic: '',
    apPediatricWellChild: '',
    apDiagnosticUncertainty: '',
    apMentalHealth: '',
  },
  pairSelections: {
    pair3A: { selected: null, edits: null },
    pair3B: { selected: null, edits: null },
    pair3C: { selected: null, edits: null },
    pair3D: { selected: null, edits: null },
    pair3E: { selected: null, edits: null },
    pair3F: { selected: null, edits: null },
  },
  antiExamples: {
    forbiddenPhrases: '',
    documentationPetPeeves: '',
    patternsAvoided: [],
    styleAversions: [],
  },
  editCapture: {
    scenario5A: { original: '', edited: '' },
    scenario5B: { original: '', edited: '' },
    scenario5C: { original: '', edited: '' },
  },
  values: {
    verbosity: 5,
    reasoningVisibility: 5,
    medicolegalAwareness: 5,
    templateFlexibility: 5,
    patientQuoteUsage: '',
    openNotesAwareness: '',
    uncertaintyDocumentation: '',
    sensitiveInfoHandling: '',
    billingConsiderations: 5,
    documentationPhilosophy: '',
  },
  specialty: {
    practiceType: '',
  },
  generatedProfile: null,
  userCorrections: null,
  completedAt: null,
});

const createInitialState = (): AppState => ({
  messagingProfile: createInitialMessagingProfile(),
  documentationProfile: createInitialDocumentationProfile(),
  messagingStep: 1,
  documentationStep: 1,
});

// Action types
type Action =
  | { type: 'SET_MESSAGING_COLD_RESPONSES'; payload: Partial<MessagingColdResponses> }
  | { type: 'SET_MESSAGING_PAIR_SELECTIONS'; payload: Partial<MessagingPairSelections> }
  | { type: 'SET_MESSAGING_ANTI_EXAMPLES'; payload: Partial<MessagingAntiExamples> }
  | { type: 'SET_MESSAGING_EDIT_CAPTURE'; payload: Partial<MessagingEditCapture> }
  | { type: 'SET_MESSAGING_VALUES'; payload: Partial<MessagingValues> }
  | { type: 'SET_MESSAGING_GENERATED_PROFILE'; payload: StyleProfile }
  | { type: 'SET_MESSAGING_USER_CORRECTIONS'; payload: string | null }
  | { type: 'COMPLETE_MESSAGING' }
  | { type: 'SET_MESSAGING_STEP'; payload: number }
  | { type: 'SET_DOCUMENTATION_STRUCTURE'; payload: Partial<DocumentationStructure> }
  | { type: 'SET_DOCUMENTATION_COLD_RESPONSES'; payload: Partial<DocumentationColdResponses> }
  | { type: 'SET_DOCUMENTATION_PAIR_SELECTIONS'; payload: Partial<DocumentationPairSelections> }
  | { type: 'SET_DOCUMENTATION_ANTI_EXAMPLES'; payload: Partial<DocumentationAntiExamples> }
  | { type: 'SET_DOCUMENTATION_EDIT_CAPTURE'; payload: Partial<DocumentationEditCapture> }
  | { type: 'SET_DOCUMENTATION_VALUES'; payload: Partial<DocumentationValues> }
  | { type: 'SET_DOCUMENTATION_SPECIALTY'; payload: Partial<DocumentationSpecialty> }
  | { type: 'SET_DOCUMENTATION_GENERATED_PROFILE'; payload: DocumentationStyleProfile }
  | { type: 'SET_DOCUMENTATION_USER_CORRECTIONS'; payload: string | null }
  | { type: 'COMPLETE_DOCUMENTATION' }
  | { type: 'SET_DOCUMENTATION_STEP'; payload: number }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'RESET_ALL' };

// Reducer
function profileReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    // Messaging actions
    case 'SET_MESSAGING_COLD_RESPONSES':
      return {
        ...state,
        messagingProfile: {
          ...state.messagingProfile,
          coldResponses: { ...state.messagingProfile.coldResponses, ...action.payload },
        },
      };
    case 'SET_MESSAGING_PAIR_SELECTIONS':
      return {
        ...state,
        messagingProfile: {
          ...state.messagingProfile,
          pairSelections: { ...state.messagingProfile.pairSelections, ...action.payload },
        },
      };
    case 'SET_MESSAGING_ANTI_EXAMPLES':
      return {
        ...state,
        messagingProfile: {
          ...state.messagingProfile,
          antiExamples: { ...state.messagingProfile.antiExamples, ...action.payload },
        },
      };
    case 'SET_MESSAGING_EDIT_CAPTURE':
      return {
        ...state,
        messagingProfile: {
          ...state.messagingProfile,
          editCapture: { ...state.messagingProfile.editCapture, ...action.payload },
        },
      };
    case 'SET_MESSAGING_VALUES':
      return {
        ...state,
        messagingProfile: {
          ...state.messagingProfile,
          values: { ...state.messagingProfile.values, ...action.payload },
        },
      };
    case 'SET_MESSAGING_GENERATED_PROFILE':
      return {
        ...state,
        messagingProfile: {
          ...state.messagingProfile,
          generatedProfile: action.payload,
        },
      };
    case 'SET_MESSAGING_USER_CORRECTIONS':
      return {
        ...state,
        messagingProfile: {
          ...state.messagingProfile,
          userCorrections: action.payload,
        },
      };
    case 'COMPLETE_MESSAGING':
      return {
        ...state,
        messagingProfile: {
          ...state.messagingProfile,
          completedAt: new Date().toISOString(),
        },
      };
    case 'SET_MESSAGING_STEP':
      return { ...state, messagingStep: action.payload };

    // Documentation actions
    case 'SET_DOCUMENTATION_STRUCTURE':
      return {
        ...state,
        documentationProfile: {
          ...state.documentationProfile,
          structure: { ...state.documentationProfile.structure, ...action.payload },
        },
      };
    case 'SET_DOCUMENTATION_COLD_RESPONSES':
      return {
        ...state,
        documentationProfile: {
          ...state.documentationProfile,
          coldResponses: { ...state.documentationProfile.coldResponses, ...action.payload },
        },
      };
    case 'SET_DOCUMENTATION_PAIR_SELECTIONS':
      return {
        ...state,
        documentationProfile: {
          ...state.documentationProfile,
          pairSelections: { ...state.documentationProfile.pairSelections, ...action.payload },
        },
      };
    case 'SET_DOCUMENTATION_ANTI_EXAMPLES':
      return {
        ...state,
        documentationProfile: {
          ...state.documentationProfile,
          antiExamples: { ...state.documentationProfile.antiExamples, ...action.payload },
        },
      };
    case 'SET_DOCUMENTATION_EDIT_CAPTURE':
      return {
        ...state,
        documentationProfile: {
          ...state.documentationProfile,
          editCapture: { ...state.documentationProfile.editCapture, ...action.payload },
        },
      };
    case 'SET_DOCUMENTATION_VALUES':
      return {
        ...state,
        documentationProfile: {
          ...state.documentationProfile,
          values: { ...state.documentationProfile.values, ...action.payload },
        },
      };
    case 'SET_DOCUMENTATION_SPECIALTY':
      return {
        ...state,
        documentationProfile: {
          ...state.documentationProfile,
          specialty: { ...state.documentationProfile.specialty, ...action.payload },
        },
      };
    case 'SET_DOCUMENTATION_GENERATED_PROFILE':
      return {
        ...state,
        documentationProfile: {
          ...state.documentationProfile,
          generatedProfile: action.payload,
        },
      };
    case 'SET_DOCUMENTATION_USER_CORRECTIONS':
      return {
        ...state,
        documentationProfile: {
          ...state.documentationProfile,
          userCorrections: action.payload,
        },
      };
    case 'COMPLETE_DOCUMENTATION':
      return {
        ...state,
        documentationProfile: {
          ...state.documentationProfile,
          completedAt: new Date().toISOString(),
        },
      };
    case 'SET_DOCUMENTATION_STEP':
      return { ...state, documentationStep: action.payload };

    // Global actions
    case 'LOAD_STATE':
      return action.payload;
    case 'RESET_ALL':
      return createInitialState();

    default:
      return state;
  }
}

// Context
interface ProfileContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isLoaded: boolean;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const STORAGE_KEY = 'providertone_profile_state';

// Provider component
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(profileReducer, createInitialState());
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch (error) {
      console.error('Failed to load profile state:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save profile state:', error);
      }
    }
  }, [state, isLoaded]);

  return (
    <ProfileContext.Provider value={{ state, dispatch, isLoaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

// Hook for consuming context
export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

// Convenience hooks for common operations
export function useMessagingProfile() {
  const { state, dispatch } = useProfile();
  return {
    profile: state.messagingProfile,
    step: state.messagingStep,
    setColdResponses: (data: Partial<MessagingColdResponses>) =>
      dispatch({ type: 'SET_MESSAGING_COLD_RESPONSES', payload: data }),
    setPairSelections: (data: Partial<MessagingPairSelections>) =>
      dispatch({ type: 'SET_MESSAGING_PAIR_SELECTIONS', payload: data }),
    setAntiExamples: (data: Partial<MessagingAntiExamples>) =>
      dispatch({ type: 'SET_MESSAGING_ANTI_EXAMPLES', payload: data }),
    setEditCapture: (data: Partial<MessagingEditCapture>) =>
      dispatch({ type: 'SET_MESSAGING_EDIT_CAPTURE', payload: data }),
    setValues: (data: Partial<MessagingValues>) =>
      dispatch({ type: 'SET_MESSAGING_VALUES', payload: data }),
    setGeneratedProfile: (profile: StyleProfile) =>
      dispatch({ type: 'SET_MESSAGING_GENERATED_PROFILE', payload: profile }),
    setUserCorrections: (corrections: string | null) =>
      dispatch({ type: 'SET_MESSAGING_USER_CORRECTIONS', payload: corrections }),
    complete: () => dispatch({ type: 'COMPLETE_MESSAGING' }),
    setStep: (step: number) => dispatch({ type: 'SET_MESSAGING_STEP', payload: step }),
  };
}

export function useDocumentationProfile() {
  const { state, dispatch } = useProfile();
  return {
    profile: state.documentationProfile,
    step: state.documentationStep,
    setStructure: (data: Partial<DocumentationStructure>) =>
      dispatch({ type: 'SET_DOCUMENTATION_STRUCTURE', payload: data }),
    setColdResponses: (data: Partial<DocumentationColdResponses>) =>
      dispatch({ type: 'SET_DOCUMENTATION_COLD_RESPONSES', payload: data }),
    setPairSelections: (data: Partial<DocumentationPairSelections>) =>
      dispatch({ type: 'SET_DOCUMENTATION_PAIR_SELECTIONS', payload: data }),
    setAntiExamples: (data: Partial<DocumentationAntiExamples>) =>
      dispatch({ type: 'SET_DOCUMENTATION_ANTI_EXAMPLES', payload: data }),
    setEditCapture: (data: Partial<DocumentationEditCapture>) =>
      dispatch({ type: 'SET_DOCUMENTATION_EDIT_CAPTURE', payload: data }),
    setValues: (data: Partial<DocumentationValues>) =>
      dispatch({ type: 'SET_DOCUMENTATION_VALUES', payload: data }),
    setSpecialty: (data: Partial<DocumentationSpecialty>) =>
      dispatch({ type: 'SET_DOCUMENTATION_SPECIALTY', payload: data }),
    setGeneratedProfile: (profile: DocumentationStyleProfile) =>
      dispatch({ type: 'SET_DOCUMENTATION_GENERATED_PROFILE', payload: profile }),
    setUserCorrections: (corrections: string | null) =>
      dispatch({ type: 'SET_DOCUMENTATION_USER_CORRECTIONS', payload: corrections }),
    complete: () => dispatch({ type: 'COMPLETE_DOCUMENTATION' }),
    setStep: (step: number) => dispatch({ type: 'SET_DOCUMENTATION_STEP', payload: step }),
  };
}
