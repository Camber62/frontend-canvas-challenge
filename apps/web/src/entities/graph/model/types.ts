export type NodeType = 'prompt' | 'generator' | 'result';

export type ApiNode =
  | {
      id: string;
      type: 'prompt';
      position: { x: number; y: number };
      data: { text: string };
    }
  | {
      id: string;
      type: 'generator';
      position: { x: number; y: number };
      data: { label: string };
    }
  | {
      id: string;
      type: 'result';
      position: { x: number; y: number };
      data: { label: string };
    };

export type ApiEdge = { id: string; source: string; target: string };

export type ApiGraph = {
  nodes: ApiNode[];
  edges: ApiEdge[];
  viewport: { x: number; y: number; zoom: number };
};

export type CanvasNodeData = {
  text?: string;
  label?: string;
  imageUrl?: string | null;
  status?: 'idle' | 'processing' | 'succeeded' | 'failed';
  error?: string | null;
};

export type GenerationView = {
  id: string;
  nodeId: string;
  resultNodeId: string;
  status: 'processing' | 'succeeded' | 'failed';
  imageUrl: string | null;
  failureCode: string | null;
};
