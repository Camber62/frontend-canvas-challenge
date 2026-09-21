import { useGraph } from '../model/GraphContext';

export function RemoveNodeButton({ id }: { id: string }) {
  const { removeNode } = useGraph();
  return (
    <button
      type="button"
      className="rf-remove nodrag nopan"
      aria-label="Удалить ноду"
      onClick={(event) => {
        event.stopPropagation();
        removeNode(id);
      }}
    >
      ×
    </button>
  );
}
