import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { RemoveNodeButton, useGraph, type CanvasNodeData } from '@/entities/graph';

type PromptRFNode = Node<CanvasNodeData, 'prompt'>;

export function PromptNode({ id, data }: NodeProps<PromptRFNode>) {
  const { updateNodeData } = useGraph();

  return (
    <article className="rf-node">
      <div className="rf-node-head">
        <h3>Текст</h3>
        <RemoveNodeButton id={id} />
      </div>
      <label htmlFor={`prompt-${id}`}>Описание изображения</label>
      <textarea
        id={`prompt-${id}`}
        className="nodrag nopan"
        rows={4}
        value={data.text ?? ''}
        onChange={(event) => updateNodeData(id, { text: event.target.value })}
      />
      <p className="rf-port-hint">Тяните от синего кружка справа к генератору</p>
      <Handle type="source" position={Position.Right} id="out" aria-label="Выход к генератору" />
    </article>
  );
}
