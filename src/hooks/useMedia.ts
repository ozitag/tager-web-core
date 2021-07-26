import { useState } from 'react';

import { useIsomorphicLayoutEffect } from '../utils/react';

/** Source: https://github.com/streamich/react-use/blob/master/src/useMedia.ts */
function useMedia(query: string, defaultState = false): boolean {
  const [state, setState] = useState(defaultState);

  useIsomorphicLayoutEffect(() => {
    let mounted = true;
    const mql = window.matchMedia(query);
    const onChange = () => {
      if (!mounted) {
        return;
      }
      setState(mql.matches);
    };

    mql.addListener(onChange);
    setState(mql.matches);

    return () => {
      mounted = false;
      mql.removeListener(onChange);
    };
  }, [query]);

  return state;
}

export default useMedia;
