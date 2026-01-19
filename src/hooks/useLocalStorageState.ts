import { useEffect, useState } from "react";
import { loadJson, saveJson } from "../utils/storage";

export function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => loadJson(key, initial));

  useEffect(() => {
    saveJson(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
