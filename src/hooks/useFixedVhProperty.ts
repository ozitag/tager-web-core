import { useIsomorphicLayoutEffect } from '../utils/react';


function useFixedVhProperty(options?: { shouldListenResize?: boolean }) {
  useIsomorphicLayoutEffect(() => {
    function updateVhProperty() {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty('--vh', `${vh}px`);
        });
      });
    }

    updateVhProperty();

    window.addEventListener('orientationchange', updateVhProperty);

    if (options?.shouldListenResize) {
      window.addEventListener('resize', updateVhProperty);
    }

    return () =>
        window.removeEventListener('orientationchange', updateVhProperty);

    if (options?.shouldListenResize) {
      window.removeEventListener('resize', updateVhProperty);
    }

  }, []);
}

export default useFixedVhProperty;
