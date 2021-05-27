import { RefObject, useEffect } from 'react';
import { scroller } from '../services/scroller';

function useScrollLockForRef<T extends HTMLElement>(
  elementRef: RefObject<T>
): void {
  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    scroller.lock(element);

    return () => {
      scroller.unlock(element);
    };
  }, []);
}

export default useScrollLockForRef;
