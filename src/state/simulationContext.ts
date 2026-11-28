import { createContext } from 'react';
import type { SimulationInput } from '../math';

export interface SimulationContextValue {
  input: SimulationInput;
  update: (patch: Partial<SimulationInput>) => void;
  reset: () => void;
}

export const SimulationContext = createContext<SimulationContextValue | null>(null);
