import { SleepState, SleepAction, User, SleepForm, MergeReport } from '@/types/sleep';
import { generateReport } from '@/utils/analysis';
import { generateId, getToday } from '@/utils/date';

export const STORAGE_KEY = 'sleep_co_observer_state';

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

export const loadFromStorage = (): Partial<SleepState> => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return parsed || {};
  } catch (e) {
    console.error('[sleepReducer] Failed to load from storage:', e);
    return {};
  }
};

export const saveToStorage = (state: SleepState) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const toSave = {
      currentUser: state.currentUser,
      partner: state.partner,
      isBound: state.isBound,
      forms: state.forms,
      reports: state.reports,
      recordings: state.recordings,
      suggestions: state.suggestions,
      medicalChecklist: state.medicalChecklist,
      environmentChecklist: state.environmentChecklist,
      reminders: state.reminders,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('[sleepReducer] Failed to save to storage:', e);
  }
};

const tryGenerateTodayReport = (state: SleepState): SleepState => {
  if (!state.currentUser || !state.partner) return state;

  const today = getToday();
  const userAId = state.currentUser.id;
  const userBId = state.partner.id;

  const todayFormsA = state.forms.filter((f) => f.date === today && f.userId === userAId);
  const todayFormsB = state.forms.filter((f) => f.date === today && f.userId === userBId);

  if (todayFormsA.length === 0 || todayFormsB.length === 0) return state;

  const formA = todayFormsA.reduce((latest, f) => {
    const t = f.updatedAt || f.createdAt;
    const lt = latest.updatedAt || latest.createdAt;
    return t > lt ? f : latest;
  });
  const formB = todayFormsB.reduce((latest, f) => {
    const t = f.updatedAt || f.createdAt;
    const lt = latest.updatedAt || latest.createdAt;
    return t > lt ? f : latest;
  });

  const report: MergeReport = generateReport(state.currentUser, state.partner, formA, formB);

  const existingTodayReportIndex = state.reports.findIndex(
    (r) => r.date === today && r.userAId === userAId && r.userBId === userBId
  );

  let newReports = [...state.reports];
  if (existingTodayReportIndex >= 0) {
    newReports.splice(existingTodayReportIndex, 1);
  }
  newReports = [report, ...newReports];

  return {
    ...state,
    reports: newReports,
    suggestions: report.suggestions.length > 0 ? report.suggestions : state.suggestions,
  };
};

export const sleepReducer = (state: SleepState, action: SleepAction): SleepState => {
  let newState: SleepState = state;

  switch (action.type) {
    case 'HYDRATE_STATE':
      newState = { ...state, ...action.payload };
      break;
    case 'SET_USER':
      newState = { ...state, currentUser: action.payload };
      break;
    case 'SET_PARTNER':
      newState = { ...state, partner: action.payload, isBound: !!action.payload };
      break;
    case 'SET_BOUND':
      newState = { ...state, isBound: action.payload };
      break;
    case 'ADD_FORM': {
      const withForm = { ...state, forms: [action.payload, ...state.forms] };
      newState = tryGenerateTodayReport(withForm);
      break;
    }
    case 'UPDATE_FORM':
      newState = {
        ...state,
        forms: state.forms.map((f) => (f.id === action.payload.id ? action.payload : f)),
      };
      break;
    case 'SET_FORMS':
      newState = { ...state, forms: action.payload };
      break;
    case 'ADD_REPORT':
      newState = { ...state, reports: [action.payload, ...state.reports] };
      break;
    case 'SET_REPORTS':
      newState = { ...state, reports: action.payload };
      break;
    case 'ADD_RECORDING':
      newState = { ...state, recordings: [action.payload, ...state.recordings] };
      break;
    case 'UPDATE_RECORDING':
      newState = {
        ...state,
        recordings: state.recordings.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
      break;
    case 'SET_RECORDINGS':
      newState = { ...state, recordings: action.payload };
      break;
    case 'UPDATE_SUGGESTION':
      newState = {
        ...state,
        suggestions: state.suggestions.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
      break;
    case 'SET_SUGGESTIONS':
      newState = { ...state, suggestions: action.payload };
      break;
    case 'UPDATE_MEDICAL_CHECKLIST':
      newState = {
        ...state,
        medicalChecklist: state.medicalChecklist.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
      };
      break;
    case 'SET_MEDICAL_CHECKLIST':
      newState = { ...state, medicalChecklist: action.payload };
      break;
    case 'UPDATE_ENVIRONMENT_CHECKLIST':
      newState = {
        ...state,
        environmentChecklist: state.environmentChecklist.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
      break;
    case 'SET_ENVIRONMENT_CHECKLIST':
      newState = { ...state, environmentChecklist: action.payload };
      break;
    case 'ADD_REMINDER':
      newState = { ...state, reminders: [action.payload, ...state.reminders] };
      break;
    case 'UPDATE_REMINDER':
      newState = {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
      break;
    case 'SET_REMINDERS':
      newState = { ...state, reminders: action.payload };
      break;
    case 'SET_LOADING':
      newState = { ...state, loading: action.payload };
      break;
    default:
      newState = state;
  }

  saveToStorage(newState);
  return newState;
};
