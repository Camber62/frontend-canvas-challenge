import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { RemoveNodeButton, type CanvasNodeData } from '@/entities/graph';

type ResultRFNode = Node<CanvasNodeData, 'result'>;

export function ResultNode({ id, data }: NodeProps<ResultRFNode>) {
  return (
    <article className="rf-node">
      <Handle type="target" position={Position.Left} id="in" aria-label="Вход от генератора" />
      <div className="rf-node-head">
        <h3>Результат</h3>
        <RemoveNodeButton id={id} />
      </div>
      <p className="rf-port-hint">Тяните сюда линию от генератора</p>
      {data.status === 'processing' ? <p>Генерация выполняется…</p> : null}
      {data.status === 'failed' ? <p className="error">{data.error}</p> : null}
      {data.status === 'succeeded' && data.imageUrl ? (
        <img src={data.imageUrl} alt="Сгенерированное изображение" width={220} height={160} />
      ) : null}
      {data.status !== 'processing' && data.status !== 'failed' && data.status !== 'succeeded' ? (
        <p className="hint">Картинка появится после генерации.</p>
      ) : null}
    </article>
  );
}
