import { canUseDOM } from '../utils/common';

class FacebookPixel {
  pixelId: string | undefined;

  constructor() {
    this.pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  }

  isTrackerEnabled(): boolean {
    return Boolean(this.pixelId && canUseDOM() && window.fbq);
  }

  init() {
    if (!this.pixelId || !canUseDOM() || !window.fbq) return;

    window.fbq('init', this.pixelId);
  }

  trackPageView() {
    if (!this.pixelId || !canUseDOM() || !window.fbq) return;

    window.fbq('track', 'PageView');
  }
}

export default FacebookPixel;
