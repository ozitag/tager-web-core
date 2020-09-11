import ReactGA from 'react-ga';

const googleAnalytics = {
  init(trackingId: string) {
    ReactGA.initialize(trackingId);
  },
  trackPageView() {
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
  },
  trackEvent(category: string, action: string) {
    ReactGA.event({ category, action });
  },
  trackException(description: string, fatal: boolean = false) {
    ReactGA.exception({ description, fatal });
  },
};

export default googleAnalytics;
