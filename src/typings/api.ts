import { QueryParams } from './common';

export type BodyParam = object | FormData;

export type JsonParseResult =
  | { [key: string]: any }
  | Array<any>
  | number
  | boolean
  | null;

export type ParsedResponseBody = JsonParseResult | string | null;

export type RequestOptions = {
  path?: string;
  body?: BodyParam;
  params?: QueryParams;
  absoluteUrl?: string;
  fetchOptions?: RequestInit;
};

export type HttpRequestFunction = <T = ParsedResponseBody>(
  options: RequestOptions
) => Promise<T>;

export type ValidationError = { code: string; message: string };
