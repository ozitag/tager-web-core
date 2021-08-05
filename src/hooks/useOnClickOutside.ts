import { useEffect, RefObject, MutableRefObject } from 'react';

/**
 * Initial source: https://usehooks.com/useOnClickOutside
 */

type Event = MouseEvent | TouchEvent;

function useOnClickOutside(
  ref:
    | RefObject<HTMLElement>
    | MutableRefObject<HTMLElement | undefined>
    | null,
  handler: (event: Event) => void,
  type?: 'custom'
): void {
  useEffect(() => {
    function listener(this: Document, event: Event) {
      if (type === 'custom') {
        handler(event);
      } else {
        // Do nothing if clicking ref's element or descendent elements
        if (
          !ref ||
          !ref.current ||
          ref.current.contains(event.target as Node)
        ) {
          return;
        }

        handler(event);
      }
    }

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, type]);
  // Add ref and handler to effect dependencies
  // It's worth noting that because passed in handler is a new ...
  // ... function on every render that will cause this effect ...
  // ... callback/cleanup to run every render. It's not a big deal ...
  // ... but to optimize you can wrap handler in useCallback before ...
  // ... passing it into this hook.
}

export default useOnClickOutside;
