import { useEffect, useRef } from 'react';
import { Router } from 'next/router';

import FacebookPixel from '../services/FacebookPixel';

function useFacebookPixel() {
  const facebookPixelRef = useRef(new FacebookPixel());

  useEffect(() => {
    const { current: facebookPixel } = facebookPixelRef;
    if (!facebookPixel.isTrackerEnabled()) return;

    facebookPixel.init();
    facebookPixel.trackPageView();

    function handleRouteChangeComplete() {
      facebookPixel.trackPageView();
    }

    Router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, []);

  return facebookPixelRef.current;
}

export default useFacebookPixel;
