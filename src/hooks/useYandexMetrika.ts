import { useEffect } from 'react';
import { Router } from 'next/router';
import yandexMetrika from '../services/YandexMetrika';

function useYandexMetrika(counterId: string): void {
  useEffect(() => {
    if (!counterId) return;

    yandexMetrika.init(counterId);
    yandexMetrika.trackPageView();

    function handleRouteChangeComplete() {
      yandexMetrika.trackPageView();
    }
    Router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [counterId]);
}

export default useYandexMetrika;
