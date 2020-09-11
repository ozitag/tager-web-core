import { useEffect } from 'react';
import { Router } from 'next/router';

import facebookPixel from '../services/facebookPixel';

function useFacebookPixel(pixelId: string): void {
  useEffect(() => {
    if (!pixelId) return;

    facebookPixel.init(pixelId);
    facebookPixel.trackPageView();

    function handleRouteChangeComplete() {
      facebookPixel.trackPageView();
    }

    Router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [pixelId]);
}

export default useFacebookPixel;
