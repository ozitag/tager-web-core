import { canUseDOM } from '../utils/common';

/**
 * Reference: Yandex.Metrika Javascript API
 * https://yandex.ru/support/metrica/objects/method-reference.html
 */
class YandexMetrika {
  counterId: string | undefined;

  constructor() {
    this.counterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_COUNTER_ID;
  }

  isTrackerEnabled(): boolean {
    return Boolean(this.counterId && canUseDOM() && window.ym);
  }

  init() {
    if (!this.counterId || !canUseDOM() || !window.ym) return;

    window.ym(this.counterId, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });
  }

  trackPageView() {
    if (!this.counterId || !canUseDOM() || !window.ym) return;

    window.ym(this.counterId, 'hit', window.location.pathname);
  }
}

export default YandexMetrika;
