import { createContext, useContext, type ReactNode } from 'react';

type Run = (nodeId: string, scenario: 'success' | 'failure') => Promise<void>;

const GenerationContext = createContext<Run | null>(null);

export function GenerationProvider({
  run,
  children,
}: {
  run: Run;
  children: ReactNode;
}) {
  return <GenerationContext.Provider value={run}>{children}</GenerationContext.Provider>;
}

export function useGeneration(): Run {
  const value = useContext(GenerationContext);
  if (!value) throw new Error('GenerationProvider is required');
  return value;
}
