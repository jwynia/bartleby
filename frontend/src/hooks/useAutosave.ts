import { useEffect, useRef, useCallback } from 'react';

interface UseAutosaveOptions<T> {
  value: T;
  onSave: (value: T) => void;
  delay?: number;
  enabled?: boolean;
}

/**
 * Hook for debounced autosaving
 * Saves after the specified delay of inactivity
 */
export function useAutosave<T>({
  value,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutosaveOptions<T>) {
  const timeoutRef = useRef<number | null>(null);
  const previousValueRef = useRef<T>(value);
  const isSavingRef = useRef(false);
  const onSaveRef = useRef(onSave);

  // Keep onSave ref up to date
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const save = useCallback(() => {
    if (!enabled || isSavingRef.current) return;

    // Only save if value has changed
    if (previousValueRef.current !== value) {
      isSavingRef.current = true;
      onSaveRef.current(value);
      previousValueRef.current = value;
      isSavingRef.current = false;
    }
  }, [value, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = window.setTimeout(save, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, enabled, save]);

  // Save on unmount
  useEffect(() => {
    return () => {
      const currentValue = value;
      const previousValue = previousValueRef.current;
      if (enabled && previousValue !== currentValue) {
        onSaveRef.current(currentValue);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { save };
}
