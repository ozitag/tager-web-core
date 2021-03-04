import { ServerResponse } from 'http';
import round from 'lodash/round';

import { FETCH_STATUSES } from '../constants/common';
import {
  ResourceType,
  Nullable,
  FetchStatus,
  Nullish,
  PaginationMeta,
  PaginatedResourceType,
} from '../typings/common';

/** https://github.com/zeit/next.js/issues/5354#issuecomment-520305040 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function isServer(): boolean {
  return !isBrowser();
}

/**
 * Reference:
 * https://github.com/reach/reach-ui/blob/v0.10.4/packages/utils/src/index.tsx#L159-L165
 */
export function canUseDOM() {
  return (
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined'
  );
}

export function isResSent(res: ServerResponse): boolean {
  return res.finished || res.headersSent;
}

export function isomorphicLog(message: any): void {
  const isError = message instanceof Error;
  const log = isError ? console.error : console.log;

  if (isBrowser()) {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) return;

    if (isError) {
      log(message);
    } else {
      log(`%c ${message}`, 'color: green');
    }
  } else {
    log(
      require('util').inspect(message, {
        colors: true,
      })
    );
  }
}

export function getNumberSign(value: number): string {
  return value === 0 ? '' : value > 0 ? '+' : '-';
}
/** 12345678 => "12 345 678" */
export function formatNumber(
  value: number,
  options?: { precision?: number; withSign?: boolean }
): string {
  let result =
    typeof options?.precision === 'number'
      ? round(value, options.precision).toFixed(options.precision)
      : value.toString();

  result = result.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ').replace('.', ',');

  if (options?.withSign) {
    result = getNumberSign(value) + result;
  }

  return result;
}

export function generateNumberArray(length: number): Array<number> {
  return Array.from({ length }, (_, index) => index);
}

export function isStringGuard(value: any): value is string {
  return typeof value === 'string';
}

export function isObjectGuard(value: any): value is object | null {
  return typeof value === 'object';
}

export function isNonNullObjectGuard(value: any): value is object {
  return isObjectGuard(value) && Boolean(value);
}

export function isEnum<T extends string>(
  value: any,
  enumArray: Array<T>
): value is T {
  return enumArray.includes(value);
}

export function isNotNullish<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

export function notFalsy<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return Boolean(value);
}

export function convertSrcSet(sources: Array<string>): string {
  return sources
    .slice(0, 2)
    .map((url, index) => `${url} ${index + 1}x`)
    .join(', ');
}

/** Source: https://github.com/killmenot/valid-data-url/blob/master/index.js#L24 */
const DATA_URL_REGEX = /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@/?%\s]*?)$/i;

export function getImageTypeFromUrl(url: string | null): string | null {
  if (!url) return null;

  const isValidDataUrl = DATA_URL_REGEX.test(url);

  if (isValidDataUrl) {
    const parts = url.trim().match(DATA_URL_REGEX);
    return parts ? parts[1] : null;
  }

  const dotPositionIndex = url.lastIndexOf('.');

  if (dotPositionIndex === -1) return null;

  const extension = url.slice(dotPositionIndex + 1);

  switch (extension) {
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
  }

  return null;
}

export function createResource<DataType>(
  data: DataType,
  status: FetchStatus,
  error?: Nullable<string>
): ResourceType<DataType> {
  return {
    data,
    status,
    error: error ?? null,
    meta: null,
  };
}

export function createResourceLoader<DataType>(initialData: DataType) {
  return {
    getInitialResource(): ResourceType<DataType> {
      return createResource(initialData, FETCH_STATUSES.IDLE, null);
    },
    pending(data?: DataType): ResourceType<DataType> {
      const resourceData = data === undefined ? initialData : data;
      return createResource(resourceData, FETCH_STATUSES.LOADING);
    },
    fulfill(payload: DataType): ResourceType<DataType> {
      return createResource(payload, FETCH_STATUSES.SUCCESS);
    },
    reject(error?: Nullable<string>): ResourceType<DataType> {
      return createResource(initialData, FETCH_STATUSES.FAILURE, error);
    },
    cancel(): ResourceType<DataType> {
      return createResource(initialData, FETCH_STATUSES.IDLE);
    },
  };
}

export function createPaginatedResourceLoader<EntityType, ErrorType = unknown>(
  initialData: Array<EntityType> = []
) {
  return {
    getInitialResource(): PaginatedResourceType<EntityType> {
      return {
        data: initialData,
        status: FETCH_STATUSES.IDLE,
        error: null,
        meta: null,
      };
    },
    pending(data?: Array<EntityType>): PaginatedResourceType<EntityType> {
      const resourceData = data === undefined ? initialData : data;
      return {
        data: resourceData,
        status: FETCH_STATUSES.LOADING,
        error: null,
        meta: null,
      };
    },
    fulfill(
      payload: Array<EntityType>,
      meta: PaginationMeta
    ): PaginatedResourceType<EntityType> {
      return {
        data: payload,
        status: FETCH_STATUSES.SUCCESS,
        error: null,
        meta,
      };
    },
    reject(error?: ErrorType): PaginatedResourceType<EntityType> {
      return {
        data: initialData,
        status: FETCH_STATUSES.FAILURE,
        error: error ?? null,
        meta: null,
      };
    },
    cancel(): PaginatedResourceType<EntityType> {
      return {
        data: initialData,
        status: FETCH_STATUSES.IDLE,
        error: null,
        meta: null,
      };
    },
  };
}

export function trimEndSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function getOrigin(): string {
  return isBrowser()
    ? window.location.origin
    : trimEndSlash(process.env.NEXT_PUBLIC_ORIGIN ?? '');
}

/**
 * Protocols: https://url.spec.whatwg.org/#url-miscellaneous
 */
export function isAbsoluteUrl(url: string): boolean {
  const PROTOCOL_LIST = ['ftp', 'file', 'http', 'https', 'ws', 'wss'];
  return PROTOCOL_LIST.some((protocol) => url.startsWith(protocol + ':'));
}

export function getAbsoluteUrl(urlOrPath: string): string {
  if (isAbsoluteUrl(urlOrPath)) return urlOrPath;

  return getOrigin() + urlOrPath;
}

export function parseUrl(absoluteUrl: string): Nullable<URL> {
  try {
    return new URL(absoluteUrl);
  } catch (error) {
    return null;
  }
}

export function shouldGetResourceDataFromCache(
  resource: ResourceType<unknown>,
  shouldInvalidate: Nullish<boolean>
): boolean {
  const isLoading = resource.status === FETCH_STATUSES.LOADING;
  const isInvalidatingNotNeeded =
    resource.status === FETCH_STATUSES.SUCCESS && !shouldInvalidate;

  return isInvalidatingNotNeeded || isLoading;
}

export function appendScriptCodeToBody(scriptCode: string): void {
  if (!canUseDOM()) return;

  const script = document.createElement('script');
  script.text = scriptCode;
  document.body.appendChild(script);
}
