import { useEffect, useState } from 'react';

import { scroller } from '../services/scroller';

function useScrollLock(): boolean {
  const [isLocked, setLocked] = useState(scroller.isLocked);

  useEffect(() => {
    const unsubscribe = scroller.subscribe((event) => {
      setLocked(event.isLocked);

      return unsubscribe;
    });
  }, []);

  return isLocked;
}

export default useScrollLock;
