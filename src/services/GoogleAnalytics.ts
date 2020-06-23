import ReactGA from 'react-ga';

import { canUseDOM } from '../utils/common';

class GoogleAnalytics {
  trackingId: string | undefined;

  constructor() {
    this.trackingId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID;
  }

  isTrackerEnabled(): boolean {
    return Boolean(this.trackingId && canUseDOM());
  }

  init() {
    if (!this.trackingId || !canUseDOM()) return;

    ReactGA.initialize(this.trackingId);
  }

  trackPageView() {
    if (!canUseDOM()) return;

    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
  }

  trackEvent(category: string, action: string) {
    if (!canUseDOM()) return;

    ReactGA.event({ category, action });
  }

  trackException(description: string, fatal: boolean = false) {
    if (!canUseDOM()) return;

    ReactGA.exception({ description, fatal });
  }
}

export default GoogleAnalytics;
