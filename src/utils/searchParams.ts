import { Nullable, QueryParams } from '../typings/common';

type SearchParamValue = Nullable<string>;

export function parseNumberParam(param: SearchParamValue): Nullable<number> {
  if (!param || !param.trim()) return null;

  const number = Number(param);
  return Number.isNaN(number) ? null : number;
}

export function parseDateParam(param: SearchParamValue): Nullable<Date> {
  if (!param || !param.trim()) return null;

  const date = new Date(param);
  const isInvalid = Number.isNaN(date.valueOf());
  return isInvalid ? null : date;
}

export function parseBooleanParam(value: SearchParamValue): Nullable<boolean> {
  if (!value) return null;

  const lowerCaseValue = value.trim().toLowerCase();

  if (!['true', 'false'].includes(lowerCaseValue)) return null;

  return lowerCaseValue === 'true';
}

export function parseEnum<T extends string = string>(
  param: SearchParamValue,
  enumArray: Array<T>
): Nullable<T> {
  if (!param) return null;

  const foundValue = enumArray.find(
    (enumValue) => enumValue.toLowerCase() === param.toLowerCase()
  );
  return foundValue || null;
}

export function parseAbsoluteUrl(absoluteUrl: string): Nullable<URL> {
  try {
    return new URL(absoluteUrl);
  } catch (error) {
    return null;
  }
}

export function dividePathnameAndSearch(url: string): [string, string] {
  const questionMarkIndex = url.indexOf('?');
  if (questionMarkIndex === -1) {
    return [url, ''];
  } else {
    const pathname = url.slice(0, questionMarkIndex);
    const search = url.slice(questionMarkIndex);

    return [pathname, search];
  }
}

export function getSearchFromUrl(url: string): string {
  const [, search] = dividePathnameAndSearch(url);
  return search;
}

export function getSearchParamsFromUrl(url: string): URLSearchParams {
  return new URLSearchParams(getSearchFromUrl(url));
}

export function mergeSearchParamsIntoUrl(
  currentUrl: string,
  params: QueryParams | URLSearchParams
): string {
  const [pathname, search] = dividePathnameAndSearch(currentUrl);
  const searchParams = new URLSearchParams(search);

  if (params instanceof URLSearchParams) {
    params.forEach((key, value) => {
      searchParams.set(key, value);
    });
  } else {
    Object.keys(params).forEach((key) => {
      const value = params[key];

      if (value === null || value === undefined) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, String(value));
      }
    });
  }

  return [pathname, searchParams.toString()].filter(Boolean).join('?');
}

export function convertParamsToString(
  params: QueryParams | URLSearchParams = {}
): string {
  let resultSearchParams: URLSearchParams;

  if (params instanceof URLSearchParams) {
    resultSearchParams = params;
  } else {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) =>
      searchParams.append(key, value)
    );

    resultSearchParams = searchParams;
  }

  const queryString = resultSearchParams.toString();
  return queryString ? '?' + queryString : '';
}
