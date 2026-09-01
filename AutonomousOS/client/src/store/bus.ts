type Handler = (payload: any) => void;
const map = new Map<string, Set<Handler>>();
export const bus = {
  on(event: string, h: Handler) {
    if (!map.has(event)) map.set(event, new Set());
    map.get(event)!.add(h);
    return () => map.get(event)!.delete(h);
  },
  emit(event: string, payload?: any) {
    map.get(event)?.forEach((h) => h(payload));
  },
};
