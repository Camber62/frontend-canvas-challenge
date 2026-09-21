import { useCallback } from 'react';
import { addEdge, type Connection } from '@xyflow/react';
import { canConnect, useGraph, type ApiNode } from '@/entities/graph';

const labels: Record<Exclude<ApiNode['type'], 'prompt'>, string> = {
  generator: 'Генератор',
  result: 'Результат',
};

export function useEditGraph() {
  const { nodes, setNodes, setEdges, markDirty, snapshot } = useGraph();

  const addNode = useCallback(
    (type: ApiNode['type']) => {
      if (nodes.length >= 20) return;
      const id = crypto.randomUUID();
      setNodes((current) => [
        ...current,
        {
          id,
          type,
          position: { x: 72 + current.length * 36, y: 80 + (current.length % 5) * 28 },
          data:
            type === 'prompt' ? { text: '' } : { label: labels[type], status: 'idle' as const },
        },
      ]);
      markDirty();
    },
    [markDirty, nodes.length, setNodes],
  );

  const addExampleChain = useCallback(() => {
    const promptId = crypto.randomUUID();
    const generatorId = crypto.randomUUID();
    const resultId = crypto.randomUUID();
    const y = 80 + (snapshot().nodes.length % 4) * 40;
    setNodes((current) => [
      ...current,
      {
        id: promptId,
        type: 'prompt',
        position: { x: 80, y },
        data: { text: 'Горы на рассвете' },
      },
      {
        id: generatorId,
        type: 'generator',
        position: { x: 400, y },
        data: { label: 'Генератор', status: 'idle' },
      },
      {
        id: resultId,
        type: 'result',
        position: { x: 720, y },
        data: { label: 'Результат', status: 'idle' },
      },
    ]);
    setEdges((current) => [
      ...current,
      { id: crypto.randomUUID(), source: promptId, target: generatorId },
      { id: crypto.randomUUID(), source: generatorId, target: resultId },
    ]);
    markDirty();
  }, [markDirty, setEdges, setNodes, snapshot]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const current = snapshot();
      if (current.edges.length >= 20) return;
      if (!canConnect(current.nodes, current.edges, connection.source, connection.target)) return;
      setEdges((edges) => addEdge({ ...connection, id: crypto.randomUUID() }, edges));
      markDirty();
    },
    [markDirty, setEdges, snapshot],
  );

  const isValidConnection = useCallback(
    (connection: Connection | { source: string | null; target: string | null }) => {
      if (!connection.source || !connection.target) return false;
      const current = snapshot();
      return canConnect(current.nodes, current.edges, connection.source, connection.target);
    },
    [snapshot],
  );

  return { addNode, addExampleChain, onConnect, isValidConnection };
}
