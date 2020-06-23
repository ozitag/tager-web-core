import { useEffect, useRef } from 'react';

/**
 * Returns the previous value of a reference after a component update.
 *
 * @param value
 *
 * Reference:
 * https://github.com/reach/reach-ui/blob/v0.10.4/packages/utils/src/index.tsx#L621-L632
 */
function usePrevious<ValueType = any>(value: ValueType) {
  const ref = useRef<ValueType | null>(null);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default usePrevious;
