import { useMemo } from 'react';
import { Background, ConnectionMode, Controls, MarkerType, MiniMap, ReactFlow } from '@xyflow/react';
import { Button, StatusBanner } from '@/shared/ui';
import { toApiError } from '@/shared/api';
import { useGraph } from '@/entities/graph';
import { PromptNode, useEditGraph } from '@/features/edit-graph';
import { useOpenWorkspace } from '@/features/open-workspace';
import { useSaveGraph } from '@/features/save-graph';
import { GenerationProvider, GeneratorNode, ResultNode, useRunGeneration } from '@/features/run-generation';

const nodeTypes = { prompt: PromptNode, generator: GeneratorNode, result: ResultNode };

const edgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#124c8c' },
  style: { stroke: '#124c8c', strokeWidth: 3 },
};

const statusText = {
  saved: 'Сохранено',
  dirty: 'Есть несохранённые правки',
  saving: 'Сохраняем…',
  error: 'Ошибка сохранения',
  conflict: 'Конфликт версии. Локальный черновик сохранён у вас.',
};

export function CanvasBoard() {
  const workspace = useOpenWorkspace();
  const graph = useGraph();
  const { addNode, addExampleChain, onConnect, isValidConnection } = useEditGraph();
  const { flush } = useSaveGraph();
  const { run } = useRunGeneration(flush);
  const tone = useMemo(() => {
    if (graph.status === 'error' || graph.status === 'conflict') return 'warn' as const;
    if (graph.status === 'saved') return 'success' as const;
    return 'info' as const;
  }, [graph.status]);

  if (workspace.isPending || !graph.spaceId) {
    return <StatusBanner tone="info">Открываем пространство…</StatusBanner>;
  }
  if (workspace.isError) {
    return <StatusBanner tone="error">{toApiError(workspace.error).message}</StatusBanner>;
  }

  return (
    <GenerationProvider run={run}>
      <section className="workspace">
        <header className="toolbar">
          <div>
            <h1>{graph.spaceTitle}</h1>
            <StatusBanner tone={tone}>{statusText[graph.status]}</StatusBanner>
            {graph.edges.length === 0 ? (
              <p className="hint">
                Пока нет синей линии со стрелкой — ноды не связаны. Поставить рядом недостаточно.
                Зажмите кружок и тяните, либо добавьте готовую цепочку.
              </p>
            ) : null}
            {graph.error ? <StatusBanner tone="error">{graph.error.message}</StatusBanner> : null}
          </div>
          <div className="actions">
            <Button onClick={() => addExampleChain()}>Добавить готовую цепочку</Button>
            <Button variant="secondary" onClick={() => addNode('prompt')}>
              Добавить текст
            </Button>
            <Button variant="secondary" onClick={() => addNode('generator')}>
              Добавить генератор
            </Button>
            <Button variant="secondary" onClick={() => addNode('result')}>
              Добавить результат
            </Button>
            {graph.status === 'conflict' ? (
              <Button
                onClick={() => {
                  void workspace.refetch();
                }}
              >
                Перечитать серверный граф
              </Button>
            ) : null}
          </div>
        </header>
        <div className="canvas">
          <ReactFlow
            nodes={graph.nodes}
            edges={graph.edges}
            onNodesChange={graph.onNodesChange}
            onEdgesChange={graph.onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={edgeOptions}
            connectionLineStyle={edgeOptions.style}
            nodeTypes={nodeTypes}
            defaultViewport={graph.viewport}
            onMoveEnd={(_, viewport) => graph.setViewport(viewport)}
            deleteKeyCode={['Backspace', 'Delete']}
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </section>
    </GenerationProvider>
  );
}
