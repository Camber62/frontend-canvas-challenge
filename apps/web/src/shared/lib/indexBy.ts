export function indexBy<T>(items: T[], key: (item: T) => string): Map<string, T> {
  const map = new Map<string, T>();
  for (let i = 0; i < items.length; i++) {
    map.set(key(items[i]), items[i]);
  }
  return map;
}
