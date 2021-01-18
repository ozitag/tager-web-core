import { useIsomorphicLayoutEffect } from '../utils/react';

function useFixedVhProperty() {
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

    return () =>
      window.removeEventListener('orientationchange', updateVhProperty);
  }, []);
}

export default useFixedVhProperty;
