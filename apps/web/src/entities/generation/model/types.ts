export type Generation = {
  id: string;
  spaceId: string;
  nodeId: string;
  resultNodeId: string;
  prompt: string;
  graphETag: string;
  scenario: 'success' | 'failure';
  status: 'processing' | 'succeeded' | 'failed';
  createdAt: string;
  imageUrl: string | null;
  failureCode: string | null;
};

export function isTerminalGeneration(status: Generation['status']): boolean {
  return status === 'succeeded' || status === 'failed';
}
