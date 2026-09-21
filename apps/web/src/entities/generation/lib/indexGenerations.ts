import type { Generation } from '../model/types';

export function latestByResult(list: Generation[]): Map<string, Generation> {
  const map = new Map<string, Generation>();
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!map.has(item.resultNodeId)) map.set(item.resultNodeId, item);
  }
  return map;
}
