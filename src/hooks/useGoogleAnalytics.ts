import { useEffect } from 'react';
import { Router } from 'next/router';

import googleAnalytics from '../services/googleAnalytics';

function useGoogleAnalytics(trackingId: string): void {
  useEffect(() => {
    if (!trackingId) return;

    googleAnalytics.init(trackingId);
    googleAnalytics.trackPageView();

    function handleRouteChangeComplete() {
      googleAnalytics.trackPageView();
    }

    Router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [trackingId]);
}

export default useGoogleAnalytics;
