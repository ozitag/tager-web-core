import { appendScriptCodeToBody, canUseDOM } from '../utils/common';
import { Nullable } from '../typings/common';

/** Reference: https://developers.facebook.com/docs/facebook-pixel/implementation */
const SCRIPT_CODE = `
 !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
`;

class FacebookPixel {
  pixelId: string;

  constructor() {
    this.pixelId = '';
  }

  getTracker(): Nullable<facebook.Pixel.Event> {
    if (this.pixelId && canUseDOM() && window.fbq) {
      return window.fbq;
    }

    return null;
  }

  init(pixelId: string) {
    this.pixelId = pixelId;

    appendScriptCodeToBody(SCRIPT_CODE);

    const tracker = this.getTracker();
    if (!tracker) return;

    tracker('init', this.pixelId);
  }

  trackPageView() {
    const tracker = this.getTracker();
    if (!tracker) return;

    tracker('track', 'PageView');
  }
}

const facebookPixel = new FacebookPixel();

export default facebookPixel;
