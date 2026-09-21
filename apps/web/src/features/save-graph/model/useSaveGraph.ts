import { useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { DEBOUNCE_MS } from '@/shared/config';
import { toApiError } from '@/shared/api';
import { saveGraph, toApiGraph, useGraph } from '@/entities/graph';

export function useSaveGraph() {
  const { spaceId, status, snapshot, setStatus, setEtag, setError, nodes, edges, viewport } =
    useGraph();
  const inFlight = useRef(false);
  const timer = useRef<number>(0);
  const save = useMutation({
    mutationFn: (input: { spaceId: string; graph: ReturnType<typeof toApiGraph>; etag: string }) =>
      saveGraph(input.spaceId, input.graph, input.etag),
  });
  const saveRef = useRef(save);
  saveRef.current = save;

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    if (!spaceId) return;
    while (inFlight.current) {
      await new Promise((resolve) => window.setTimeout(resolve, 30));
    }

    inFlight.current = true;
    try {
      for (;;) {
        const snap = snapshot();
        if (!snap.etag) return;
        setStatus('saving');
        const result = await saveRef.current.mutateAsync({
          spaceId,
          graph: toApiGraph(snap.nodes, snap.edges, snap.viewport),
          etag: snap.etag,
        });
        if (result.etag) setEtag(result.etag);
        if (snapshot().revision === snap.revision) {
          setStatus('saved');
          return;
        }
      }
    } catch (caught) {
      const error = toApiError(caught);
      setError(error);
      setStatus(error.status === 412 ? 'conflict' : 'error');
      throw error;
    } finally {
      inFlight.current = false;
    }
  }, [setEtag, setError, setStatus, snapshot, spaceId]);

  useEffect(() => {
    if (status !== 'dirty') return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void flush().catch(() => undefined);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer.current);
  }, [status, nodes, edges, viewport, flush]);

  return { flush };
}
