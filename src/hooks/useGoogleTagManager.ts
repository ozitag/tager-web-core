import TagManager from 'react-gtm-module';
import { useEffect } from 'react';

function useGoogleTagManager(gtmId: string) {
  useEffect(() => {
    if (!gtmId) return;

    TagManager.initialize({
      gtmId,
    });
  }, [gtmId]);
}

export default useGoogleTagManager;
