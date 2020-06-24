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

interface YandexMetrikaFunction {
  (
    counterId: string,
    event: 'init',
    options?: {
      accurateTrackBounce?: boolean;
      childIframe?: boolean;
      clickmap?: boolean;
      ecommerce?: boolean | string | Array<any>;
      params?: object | Array<any>;
      userParams?: object;
      trackHash?: boolean;
      trackLinks?: boolean;
      trustedDomains?: Array<string>;
      type?: number;
      ut?: string;
      webvisor?: boolean;
      triggerEvent?: boolean;
    }
  ): void;
  (
    counterId: string,
    event: 'addFileExtension',
    extensions: string | Array<string>
  ): void;
  (
    counterId: string,
    event: 'extLink',
    url: string,
    options?: {
      callback?: Function;
      ctx?: object;
      params?: { order_price?: number; currency: string };
      title?: string;
    }
  ): void;
  (
    counterId: string,
    event: 'file',
    url: string,
    options?: {
      callback?: Function;
      ctx?: object;
      params?: { order_price?: number; currency: string };
      referer?: string;
      title?: string;
    }
  ): void;
  (
    counterId: string,
    event: 'getClientID',
    callback: (clientId: string) => void
  ): void;
  (
    counterId: string,
    event: 'hit',
    url: string,
    options?: {
      callback?: Function;
      ctx?: object;
      params?: { order_price?: number; currency: string };
      referer?: string;
      title?: string;
    }
  ): void;
  (
    counterId: string,
    event: 'notBounce',
    options?: {
      callback?: Function;
      ctx?: object;
    }
  ): void;
  (counterId: string, event: 'params', parameters: object | Array<any>): void;
  (
    counterId: string,
    event: 'reachGoal',
    target: string,
    params?: object,
    callback?: Function,
    ctx?: object
  ): void;
  (counterId: string, event: 'replacePhones'): void;
  (counterId: string, event: 'setUserID', userId: string): void;
  (
    counterId: string,
    event: 'userParams',
    parameters: Record<string, any>
  ): void;
}

declare global {
  interface Window {
    ym?: YandexMetrikaFunction;
  }
}

export default YandexMetrika;
