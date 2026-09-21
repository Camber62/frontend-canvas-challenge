export type Space = {
  id: string;
  title: string;
  createdAt: string;
  links: Record<string, { href: string; method: string }>;
};

export type ApiConfig = {
  debounceMs: number;
  pollIntervalMs: number;
  generationDelayMs: number;
  maxNodes: number;
  maxEdges: number;
};
