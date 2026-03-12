import { useDebouncedValue as usePacerDebouncedValue } from '@tanstack/react-pacer';

/**
 * A hook to debounce a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue] = usePacerDebouncedValue(value, { wait: delay });
  return debouncedValue;
}
