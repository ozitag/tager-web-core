import { useEffect, useRef } from 'react';
import { Router } from 'next/router';

import GoogleAnalytics from '../services/GoogleAnalytics';

function useGoogleAnalytics() {
  const googleTrackerRef = useRef(new GoogleAnalytics());

  useEffect(() => {
    const { current: googleTracker } = googleTrackerRef;

    googleTracker.init();
    googleTracker.trackPageView();

    function handleRouteChangeComplete() {
      googleTracker.trackPageView();
    }

    Router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, []);

  return googleTrackerRef.current;
}

export default useGoogleAnalytics;
