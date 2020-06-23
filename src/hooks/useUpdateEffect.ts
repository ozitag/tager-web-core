import React, { useEffect, useRef } from 'react';

/**
 * Call an effect after a component update, skipping the initial mount.
 *
 * @param effect Effect to call
 * @param deps Effect dependency list
 *
 * Reference:
 * https://github.com/reach/reach-ui/blob/v0.10.4/packages/utils/src/index.tsx#L634-L653
 */
function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) {
      effect();
    } else {
      mounted.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useUpdateEffect;
