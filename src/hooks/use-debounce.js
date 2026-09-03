import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // schedule a single timeout for this value change
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // cleanup WILL cancel the previous timeout whenever `value` or `delay` changes
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
