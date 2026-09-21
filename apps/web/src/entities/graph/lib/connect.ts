import type { Edge, Node } from '@xyflow/react';
import { indexBy } from '@/shared/lib/indexBy';
import type { CanvasNodeData } from '../model/types';

export function canConnect(
  nodes: Node<CanvasNodeData>[],
  edges: Edge[],
  source: string,
  target: string,
): boolean {
  const byId = indexBy(nodes, (node) => node.id);
  const from = byId.get(source);
  const to = byId.get(target);
  if (!from || !to) return false;
  const allowed =
    (from.type === 'prompt' && to.type === 'generator') ||
    (from.type === 'generator' && to.type === 'result');
  if (!allowed) return false;
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (edge.target === target) return false;
    if (from.type === 'generator' && edge.source === source) return false;
  }
  return true;
}

export function generatorChainError(
  nodes: Node<CanvasNodeData>[],
  edges: Edge[],
  generatorId: string,
): string | null {
  const byId = indexBy(nodes, (node) => node.id);
  let incoming: Edge | undefined;
  let outgoing: Edge | undefined;
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (edge.target === generatorId) incoming = edge;
    if (edge.source === generatorId) outgoing = edge;
  }
  const prompt = incoming ? byId.get(incoming.source) : undefined;
  const result = outgoing ? byId.get(outgoing.target) : undefined;
  if (!prompt || prompt.type !== 'prompt') {
    return 'Нет линии от текста. Зажмите кружок справа у «Текст» и потяните на этот генератор — должна появиться синяя линия.';
  }
  if (!(prompt.data.text ?? '').trim()) {
    return 'В текстовой ноде пусто. Напишите описание изображения.';
  }
  if (!result || result.type !== 'result') {
    return 'Нет линии к результату. Зажмите кружок справа у генератора и потяните на «Результат».';
  }
  return null;
}
