import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(stored) : value;
        setStored(next);
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
    },
    [key, stored],
  );

  return [stored, setValue] as const;
}
