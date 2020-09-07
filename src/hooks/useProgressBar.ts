import { useEffect } from 'react';
import NProgress, { NProgressOptions } from 'nprogress';
import { Nullable } from '../typings/common';
import { Router } from 'next/router';

function useProgressBar(options: Partial<NProgressOptions>) {
  useEffect(() => {
    const defaultOptions: Partial<NProgressOptions> = { showSpinner: false };

    NProgress.configure({ ...defaultOptions, ...options });

    let timeoutId: Nullable<number | NodeJS.Timeout> = null;
    const TIMEOUT = 500;

    function resetTimeoutIfNeeded() {
      if (timeoutId) {
        if (typeof timeoutId === 'number') {
          clearTimeout(timeoutId);
        } else {
          clearTimeout(timeoutId);
        }
        timeoutId = null;
      }
    }

    Router.events.on('routeChangeStart', () => {
      resetTimeoutIfNeeded();
      timeoutId = setTimeout(() => NProgress.start(), TIMEOUT);
    });
    Router.events.on('routeChangeComplete', () => {
      resetTimeoutIfNeeded();
      NProgress.done();
    });
    Router.events.on('routeChangeError', () => {
      resetTimeoutIfNeeded();
      NProgress.done();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default useProgressBar;
