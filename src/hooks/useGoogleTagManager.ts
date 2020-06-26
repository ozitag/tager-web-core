import TagManager from 'react-gtm-module';
import { useEffect } from 'react';

function useGoogleTagManager() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID) {
      TagManager.initialize({
        gtmId: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
      });
    }
  }, []);
}

export default useGoogleTagManager;
