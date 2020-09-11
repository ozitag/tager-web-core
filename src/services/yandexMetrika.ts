import { appendScriptCodeToBody, canUseDOM } from '../utils/common';
import { Nullable } from '../typings/common';

/**
 * Reference:
 * https://yandex.ru/support/metrica/code/counter-initialize.html
 */
const SCRIPT_CODE = `
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
`;

/**
 * Reference: Yandex.Metrika Javascript API
 * https://yandex.ru/support/metrica/objects/method-reference.html
 */
class YandexMetrika {
  counterId: string;

  constructor() {
    this.counterId = '';
  }

  getTracker(): Nullable<YandexMetrikaFunction> {
    if (this.counterId && canUseDOM() && window.ym) {
      return window.ym;
    }

    return null;
  }

  isTrackerEnabled(): boolean {
    const ym = this.getTracker();

    return Boolean(ym);
  }

  init(counterId: string) {
    this.counterId = counterId;

    appendScriptCodeToBody(SCRIPT_CODE);

    const ym = this.getTracker();
    if (!ym) return;

    ym(this.counterId, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });
  }

  trackPageView() {
    const ym = this.getTracker();
    if (!ym) return;

    ym(this.counterId, 'hit', window.location.pathname);
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

const yandexMetrika = new YandexMetrika();

export default yandexMetrika;
