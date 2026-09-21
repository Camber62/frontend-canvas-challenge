import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  type Viewport,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react';
import { ApiError } from '@/shared/api';
import type { CanvasNodeData } from './types';

export type SaveStatus = 'saved' | 'dirty' | 'saving' | 'error' | 'conflict';

type GraphValue = {
  spaceId: string | null;
  spaceTitle: string;
  nodes: Node<CanvasNodeData>[];
  edges: Edge[];
  viewport: Viewport;
  etag: string | null;
  status: SaveStatus;
  error: ApiError | null;
  setNodes: Dispatch<SetStateAction<Node<CanvasNodeData>[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  onNodesChange: OnNodesChange<Node<CanvasNodeData>>;
  onEdgesChange: OnEdgesChange;
  setViewport: (viewport: Viewport) => void;
  markDirty: () => void;
  setStatus: (status: SaveStatus) => void;
  setEtag: (etag: string | null) => void;
  setError: (error: ApiError | null) => void;
  snapshot: () => {
    nodes: Node<CanvasNodeData>[];
    edges: Edge[];
    viewport: Viewport;
    etag: string | null;
    revision: number;
  };
  replaceGraph: (next: {
    nodes: Node<CanvasNodeData>[];
    edges: Edge[];
    viewport: Viewport;
    etag: string | null;
  }) => void;
  setWorkspace: (id: string, title: string) => void;
  updateNodeData: (id: string, patch: Partial<CanvasNodeData>, dirty?: boolean) => void;
  removeNode: (id: string) => void;
};

const GraphContext = createContext<GraphValue | null>(null);

export function GraphProvider({ children }: { children: ReactNode }) {
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [spaceTitle, setSpaceTitle] = useState('Мой канвас');
  const [nodes, setNodes] = useState<Node<CanvasNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [viewport, setViewportState] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [etag, setEtagState] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [error, setError] = useState<ApiError | null>(null);
  const revisionRef = useRef(0);
  const etagRef = useRef<string | null>(null);
  const latestRef = useRef({ nodes, edges, viewport, etag, revision: 0 });
  latestRef.current = {
    nodes,
    edges,
    viewport,
    etag: etagRef.current,
    revision: revisionRef.current,
  };

  const setEtag = useCallback((next: string | null) => {
    etagRef.current = next;
    latestRef.current.etag = next;
    setEtagState(next);
  }, []);

  const markDirty = useCallback(() => {
    revisionRef.current += 1;
    latestRef.current.revision = revisionRef.current;
    setStatus('dirty');
    setError(null);
  }, []);

  const onNodesChange = useCallback<OnNodesChange<Node<CanvasNodeData>>>(
    (changes) => {
      setNodes((current) => applyNodeChanges(changes, current));
      for (let i = 0; i < changes.length; i++) {
        const change = changes[i];
        if (change.type === 'position' || change.type === 'remove' || change.type === 'add') {
          markDirty();
          return;
        }
      }
    },
    [markDirty],
  );

  const onEdgesChange = useCallback<OnEdgesChange>(
    (changes) => {
      setEdges((current) => applyEdgeChanges(changes, current));
      markDirty();
    },
    [markDirty],
  );

  const setViewport = useCallback(
    (next: Viewport) => {
      const current = latestRef.current.viewport;
      if (current.x === next.x && current.y === next.y && current.zoom === next.zoom) return;
      setViewportState(next);
      markDirty();
    },
    [markDirty],
  );

  const snapshot = useCallback(() => latestRef.current, []);

  const replaceGraph = useCallback(
    (next: {
      nodes: Node<CanvasNodeData>[];
      edges: Edge[];
      viewport: Viewport;
      etag: string | null;
    }) => {
      setNodes(next.nodes);
      setEdges(next.edges);
      setViewportState(next.viewport);
      etagRef.current = next.etag;
      latestRef.current.etag = next.etag;
      setEtagState(next.etag);
      setStatus('saved');
      setError(null);
    },
    [],
  );

  const setWorkspace = useCallback((id: string, title: string) => {
    setSpaceId(id);
    setSpaceTitle(title);
  }, []);

  const updateNodeData = useCallback(
    (id: string, patch: Partial<CanvasNodeData>, dirty = true) => {
      setNodes((current) => {
        const next = current.slice();
        for (let i = 0; i < next.length; i++) {
          if (next[i].id === id) {
            next[i] = { ...next[i], data: { ...next[i].data, ...patch } };
            break;
          }
        }
        return next;
      });
      if (dirty) markDirty();
    },
    [markDirty],
  );

  const removeNode = useCallback(
    (id: string) => {
      setNodes((current) => {
        const next: Node<CanvasNodeData>[] = [];
        for (let i = 0; i < current.length; i++) {
          if (current[i].id !== id) next.push(current[i]);
        }
        return next;
      });
      setEdges((current) => {
        const next: Edge[] = [];
        for (let i = 0; i < current.length; i++) {
          const edge = current[i];
          if (edge.source !== id && edge.target !== id) next.push(edge);
        }
        return next;
      });
      markDirty();
    },
    [markDirty],
  );

  const value = useMemo<GraphValue>(
    () => ({
      spaceId,
      spaceTitle,
      nodes,
      edges,
      viewport,
      etag,
      status,
      error,
      setNodes,
      setEdges,
      onNodesChange,
      onEdgesChange,
      setViewport,
      markDirty,
      setStatus,
      setEtag,
      setError,
      snapshot,
      replaceGraph,
      setWorkspace,
      updateNodeData,
      removeNode,
    }),
    [
      spaceId,
      spaceTitle,
      nodes,
      edges,
      viewport,
      etag,
      status,
      error,
      onNodesChange,
      onEdgesChange,
      setViewport,
      markDirty,
      snapshot,
      replaceGraph,
      setWorkspace,
      updateNodeData,
      removeNode,
    ],
  );

  return <GraphContext.Provider value={value}>{children}</GraphContext.Provider>;
}

export function useGraph(): GraphValue {
  const value = useContext(GraphContext);
  if (!value) throw new Error('GraphProvider is required');
  return value;
}
