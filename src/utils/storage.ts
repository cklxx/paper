const memoryStore = new Map<string, string>();

type Store = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

function getStore(): Store | Map<string, string> {
  if (typeof window === "undefined") return memoryStore;
  try {
    return window.localStorage;
  } catch {
    return memoryStore;
  }
}

export function loadJson<T>(key: string, fallback: T): T {
  const store = getStore();
  const raw = "getItem" in store ? store.getItem(key) : store.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson<T>(key: string, value: T) {
  const store = getStore();
  const raw = JSON.stringify(value);
  if ("setItem" in store) {
    store.setItem(key, raw);
    return;
  }
  store.set(key, raw);
}
