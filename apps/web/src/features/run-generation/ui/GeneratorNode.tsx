import { Handle, Position, useNodeId } from '@xyflow/react';
import { generatorChainError, RemoveNodeButton, useGraph } from '@/entities/graph';
import { useAction } from '@/shared/lib/useAction';
import { Button } from '@/shared/ui';
import { useGeneration } from '../model/generation-context';

export function GeneratorNode() {
  const id = useNodeId() ?? '';
  const { nodes, edges } = useGraph();
  const run = useGeneration();
  const chainError = generatorChainError(nodes, edges, id);
  const action = useAction(async (scenario: 'success' | 'failure') => {
    await run(id, scenario);
  });

  return (
    <article className="rf-node">
      <Handle type="target" position={Position.Left} id="in" aria-label="Вход от текста" />
      <div className="rf-node-head">
        <h3>Генератор</h3>
        <RemoveNodeButton id={id} />
      </div>
      {chainError ? <p className="error">{chainError}</p> : <p className="hint">Цепочка собрана, можно генерировать.</p>}
      {action.error && action.error.message !== chainError ? (
        <p className="error">{action.error.message}</p>
      ) : null}
      <div className="rf-actions">
        <Button
          pending={action.pending}
          disabled={Boolean(chainError)}
          onClick={() => {
            void action.run('success').catch(() => undefined);
          }}
        >
          Сгенерировать
        </Button>
        <Button
          variant="secondary"
          pending={action.pending}
          disabled={Boolean(chainError)}
          onClick={() => {
            void action.run('failure').catch(() => undefined);
          }}
        >
          Тестовый отказ
        </Button>
      </div>
      <Handle type="source" position={Position.Right} id="out" aria-label="Выход к результату" />
    </article>
  );
}
