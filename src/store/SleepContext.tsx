import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { SleepState, SleepAction } from '@/types/sleep';
import { sleepReducer, initialState } from './sleepReducer';

interface SleepContextType {
  state: SleepState;
  dispatch: React.Dispatch<SleepAction>;
}

const SleepContext = createContext<SleepContextType | undefined>(undefined);

export const SleepProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(sleepReducer, initialState);

  useEffect(() => {
    console.log('[SleepContext] State updated:', state);
  }, [state]);

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
