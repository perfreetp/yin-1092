import { SleepState, SleepAction } from '@/types/sleep';

export const initialState: SleepState = {
  currentUser: null,
  partner: null,
  isBound: false,
  currentForm: null,
  forms: [],
  reports: [],
  recordings: [],
  suggestions: [],
  medicalChecklist: [],
  environmentChecklist: [],
  reminders: [],
  loading: false,
};

export const sleepReducer = (state: SleepState, action: SleepAction): SleepState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_PARTNER':
      return { ...state, partner: action.payload, isBound: !!action.payload };
    case 'SET_BOUND':
      return { ...state, isBound: action.payload };
    case 'ADD_FORM':
      return { ...state, forms: [action.payload, ...state.forms] };
    case 'UPDATE_FORM':
      return {
        ...state,
        forms: state.forms.map((f) => (f.id === action.payload.id ? action.payload : f)),
      };
    case 'SET_FORMS':
      return { ...state, forms: action.payload };
    case 'ADD_REPORT':
      return { ...state, reports: [action.payload, ...state.reports] };
    case 'SET_REPORTS':
      return { ...state, reports: action.payload };
    case 'ADD_RECORDING':
      return { ...state, recordings: [action.payload, ...state.recordings] };
    case 'SET_RECORDINGS':
      return { ...state, recordings: action.payload };
    case 'UPDATE_SUGGESTION':
      return {
        ...state,
        suggestions: state.suggestions.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    case 'UPDATE_MEDICAL_CHECKLIST':
      return {
        ...state,
        medicalChecklist: state.medicalChecklist.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
      };
    case 'SET_MEDICAL_CHECKLIST':
      return { ...state, medicalChecklist: action.payload };
    case 'UPDATE_ENVIRONMENT_CHECKLIST':
      return {
        ...state,
        environmentChecklist: state.environmentChecklist.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'SET_ENVIRONMENT_CHECKLIST':
      return { ...state, environmentChecklist: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};
