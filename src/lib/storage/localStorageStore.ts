const LOCAL_STORAGE_CHANGE_EVENT = "local-storage-change";

interface StorageChangeDetail {
  readonly key: string;
}

export function notifyStorageChange(key: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<StorageChangeDetail>(LOCAL_STORAGE_CHANGE_EVENT, {
      detail: { key },
    }),
  );
}

export function createLocalStorageStore<T>(
  key: string,
  parse: (raw: string) => T,
  fallback: T,
) {
  let cachedRaw: string | null = null;
  let cachedSnapshot: T = fallback;

  function getSnapshot(): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw === cachedRaw) return cachedSnapshot;

      cachedRaw = raw;
      cachedSnapshot = raw === null ? fallback : parse(raw);
      return cachedSnapshot;
    } catch {
      return fallback;
    }
  }

  function getServerSnapshot(): T {
    return fallback;
  }

  function subscribe(callback: () => void): () => void {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) callback();
    };

    const handleCustom = (e: Event) => {
      const detail = (e as CustomEvent<StorageChangeDetail>).detail;
      if (detail.key === key) callback();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(LOCAL_STORAGE_CHANGE_EVENT, handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(LOCAL_STORAGE_CHANGE_EVENT, handleCustom);
    };
  }

  return { getSnapshot, getServerSnapshot, subscribe };
}
