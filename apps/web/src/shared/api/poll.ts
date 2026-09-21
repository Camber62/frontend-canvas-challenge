export async function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return;
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
    };
    if (signal) {
      if (signal.aborted) {
        window.clearTimeout(timer);
        onAbort();
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}

export async function pollUntil<T>(options: {
  load: (signal: AbortSignal) => Promise<T>;
  done: (value: T) => boolean;
  intervalMs: number | ((value: T) => number);
  signal?: AbortSignal;
}): Promise<T> {
  const signal = options.signal ?? new AbortController().signal;
  let value = await options.load(signal);
  while (!options.done(value)) {
    const wait =
      typeof options.intervalMs === 'function' ? options.intervalMs(value) : options.intervalMs;
    await delay(wait, signal);
    value = await options.load(signal);
  }
  return value;
}
