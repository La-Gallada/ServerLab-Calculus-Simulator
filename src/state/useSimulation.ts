import { useContext } from 'react';
import { SimulationContext } from './simulationContext';

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation debe utilizarse dentro de SimulationProvider.');
  return context;
}
