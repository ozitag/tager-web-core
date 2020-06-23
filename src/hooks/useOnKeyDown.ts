import { useEffect, useMemo, useRef } from 'react';

function useOnKeyDown(
  keys: string | Array<string>,
  callback: (event: KeyboardEvent) => void
) {
  const callbackRef = useRef(callback);

  const KEY_SEPARATOR = '|';
  const joinedKeys = Array.isArray(keys) ? keys.join(KEY_SEPARATOR) : keys;

  const memoizedKeys = useMemo(() => joinedKeys.split(KEY_SEPARATOR), [
    joinedKeys,
  ]);

  callbackRef.current = callback;

  useEffect(() => {
    function listener(event: KeyboardEvent) {
      if (memoizedKeys.includes(event.key)) {
        callbackRef.current(event);
      }
    }

    document.addEventListener('keydown', listener);

    return () => document.removeEventListener('keydown', listener);
  }, [memoizedKeys]);
}

export default useOnKeyDown;
