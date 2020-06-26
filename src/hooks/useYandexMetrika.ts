import { useEffect, useRef } from 'react';
import { Router } from 'next/router';

import YandexMetrika from '../services/YandexMetrika';

function useYandexMetrika() {
  const yandexTrackerRef = useRef(new YandexMetrika());

  useEffect(() => {
    const { current: yandexTracker } = yandexTrackerRef;
    if (!yandexTracker.isTrackerEnabled()) return;

    yandexTracker.init();
    yandexTracker.trackPageView();

    function handleRouteChangeComplete() {
      yandexTracker.trackPageView();
    }
    Router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, []);

  return yandexTrackerRef.current;
}

export default useYandexMetrika;
