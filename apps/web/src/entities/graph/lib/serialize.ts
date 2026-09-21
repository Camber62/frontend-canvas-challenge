import type { Edge, Node } from '@xyflow/react';
import type { ApiGraph, CanvasNodeData } from '../model/types';

export function toApiGraph(
  nodes: Node<CanvasNodeData>[],
  edges: Edge[],
  viewport: ApiGraph['viewport'],
): ApiGraph {
  const apiNodes: ApiGraph['nodes'] = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const type = node.type;
    if (type === 'prompt') {
      apiNodes.push({
        id: node.id,
        type: 'prompt',
        position: node.position,
        data: { text: node.data.text ?? '' },
      });
    } else if (type === 'generator') {
      apiNodes.push({
        id: node.id,
        type: 'generator',
        position: node.position,
        data: { label: node.data.label || 'Генератор' },
      });
    } else if (type === 'result') {
      apiNodes.push({
        id: node.id,
        type: 'result',
        position: node.position,
        data: { label: node.data.label || 'Результат' },
      });
    }
  }

  const apiEdges: ApiGraph['edges'] = [];
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    apiEdges.push({ id: edge.id, source: edge.source, target: edge.target });
  }

  return { nodes: apiNodes, edges: apiEdges, viewport };
}

export function fromApiGraph(graph: ApiGraph): {
  nodes: Node<CanvasNodeData>[];
  edges: Edge[];
  viewport: ApiGraph['viewport'];
} {
  const nodes: Node<CanvasNodeData>[] = [];
  for (let i = 0; i < graph.nodes.length; i++) {
    const node = graph.nodes[i];
    nodes.push({
      id: node.id,
      type: node.type,
      position: node.position,
      data:
        node.type === 'prompt'
          ? { text: node.data.text }
          : { label: node.data.label, status: 'idle' },
    });
  }

  const edges: Edge[] = [];
  for (let i = 0; i < graph.edges.length; i++) {
    const edge = graph.edges[i];
    edges.push({ id: edge.id, source: edge.source, target: edge.target });
  }

  return { nodes, edges, viewport: graph.viewport };
}
