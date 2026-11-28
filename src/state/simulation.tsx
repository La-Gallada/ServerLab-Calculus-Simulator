import { useMemo, useState, type ReactNode } from 'react';
import { initialSimulationInput, type SimulationInput } from '../math';
import { SimulationContext, type SimulationContextValue } from './simulationContext';

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<SimulationInput>({ ...initialSimulationInput });
  const value = useMemo<SimulationContextValue>(
    () => ({
      input,
      update: (patch) => setInput((current) => ({ ...current, ...patch })),
      reset: () => setInput({ ...initialSimulationInput }),
    }),
    [input],
  );
  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}
