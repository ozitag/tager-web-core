import { useEffect, useState } from 'react';

import { canUseDOM } from '../utils/common';

/** Source: https://github.com/streamich/react-use/blob/master/src/useMedia.ts */
function useMedia(query: string, defaultState: boolean = false) {
  const [state, setState] = useState(
    canUseDOM() ? () => window.matchMedia(query).matches : defaultState
  );

  useEffect(() => {
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
