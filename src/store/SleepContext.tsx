import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { SleepState, SleepAction } from '@/types/sleep';
import { sleepReducer, initialState, loadFromStorage } from './sleepReducer';
import { mockUserA, mockUserB, mockSuggestions, mockMedicalChecklist, mockEnvironmentChecklist } from '@/data/mockData';

interface SleepContextType {
  state: SleepState;
  dispatch: React.Dispatch<SleepAction>;
}

const SleepContext = createContext<SleepContextType | undefined>(undefined);

export const SleepProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(sleepReducer, initialState);

  useEffect(() => {
    const savedState = loadFromStorage();
    if (Object.keys(savedState).length > 0) {
      dispatch({ type: 'HYDRATE_STATE', payload: savedState });
      console.log('[SleepContext] Hydrated state from storage:', Object.keys(savedState));
    }

    setTimeout(() => {
      if (!state.currentUser) {
        dispatch({ type: 'SET_USER', payload: mockUserA });
      }
      if (!state.partner) {
        dispatch({ type: 'SET_PARTNER', payload: mockUserB });
        dispatch({ type: 'SET_BOUND', payload: true });
      }
      if (state.suggestions.length === 0) {
        dispatch({ type: 'SET_SUGGESTIONS', payload: mockSuggestions });
      }
      if (state.medicalChecklist.length === 0) {
        dispatch({ type: 'SET_MEDICAL_CHECKLIST', payload: mockMedicalChecklist });
      }
      if (state.environmentChecklist.length === 0) {
        dispatch({ type: 'SET_ENVIRONMENT_CHECKLIST', payload: mockEnvironmentChecklist });
      }
    }, 100);
  }, []);

  return (
    <SleepContext.Provider value={{ state, dispatch }}>
      {children}
    </SleepContext.Provider>
  );
};

export const useSleep = (): SleepContextType => {
  const context = useContext(SleepContext);
  if (!context) {
    throw new Error('useSleep must be used within a SleepProvider');
  }
  return context;
};
