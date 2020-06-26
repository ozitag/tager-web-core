import { BodyParam, HttpRequestFunction, RequestOptions } from '../typings/api';
import { ConstantMap, Nullable, QueryParams } from '../typings/common';
import { isBrowser, isomorphicLog, isNotNullish } from '../utils/common';
import { convertParamsToString } from '../utils/searchParams';

import cookie from './cookie';
import RequestError from './RequestError';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const HTTP_METHODS: ConstantMap<HttpMethod> = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

class ApiService {
  private accessToken: Nullable<string>;

  constructor() {
    this.accessToken = null;
  }

  /** Set access token on server side */
  public setAccessToken(accessToken: Nullable<string>) {
    this.accessToken = accessToken;
  }

  public getAccessToken() {
    if (isBrowser()) {
      return cookie.get('accessToken');
    } else {
      return this.accessToken;
    }
  }

  private configureHeaders(body?: BodyParam): Headers {
    const headers = new Headers();

    const isFormData = isBrowser() && body instanceof FormData;
    if (!isFormData) {
      headers.append('Content-Type', 'application/json');
    }

    const accessToken = this.getAccessToken();

    if (accessToken) {
      headers.append('Authorization', `JWT ${accessToken}`);
    }

    headers.append('Accept', 'application/json');

    return headers;
  }

  private configureBody(body?: BodyParam) {
    if (!body) return undefined;

    if (body instanceof FormData) {
      return body;
    }

    return JSON.stringify(body);
  }

  private getRequestUrl(pathname = '', queryParams?: QueryParams) {
    const baseUrl = isBrowser()
      ? process.env.NEXT_PUBLIC_CSR_API_URL
      : process.env.NEXT_PUBLIC_SSR_API_URL;

    const search = convertParamsToString(queryParams);
    return [baseUrl, pathname, search].filter(isNotNullish).join('');
  }

  configureOptions({
    method,
    body,
    fetchOptions,
  }: {
    method: HttpMethod;
    body?: BodyParam;
    fetchOptions?: RequestInit;
  }): RequestInit {
    return {
      headers: this.configureHeaders(body),
      method,
      mode: 'cors',
      body: this.configureBody(body),
      ...fetchOptions,
    };
  }

  getContent(response: Response) {
    const contentType = response.headers.get('content-type');

    if (
      contentType &&
      contentType.toLowerCase().startsWith('application/json')
    ) {
      return response.json().catch((error: any) => {
        /** empty json body will throw "SyntaxError: Unexpected end of input" */
        if (error instanceof SyntaxError) {
          return response.text();
        } else {
          isomorphicLog(
            `Unknown error while parsing response body: ${error.toString()}`
          );

          return error.toString();
        }
      });
    }

    return response.text();
  }

  handleErrors(response: Response) {
    return this.getContent(response).then((content) => {
      if (response.ok) {
        return content;
      }

      return Promise.reject(
        new RequestError(
          {
            code: response.status,
            text: response.statusText,
          },
          content
        )
      );
    });
  }

  logRequest(url: string, options: RequestInit): void {
    const formattedLog = `--> ${options.method} ${url}`;
    isomorphicLog(formattedLog);
  }

  logResponse(res: Response, options: RequestInit): Response {
    const formattedLog = `<-- ${options.method} ${res.status} ${res.url}`;
    isomorphicLog(formattedLog);
    return res;
  }

  async makeRequest(
    method: HttpMethod,
    { path, body, params, absoluteUrl, fetchOptions }: RequestOptions
  ) {
    const url = absoluteUrl || this.getRequestUrl(path, params);
    const options = this.configureOptions({ method, body, fetchOptions });

    this.logRequest(url, options);

    return fetch(url, options)
      .then((response) => this.logResponse(response, options))
      .then(this.handleErrors.bind(this));
  }

  bindHttpMethod(method: HttpMethod): HttpRequestFunction {
    return this.makeRequest.bind(this, method);
  }
}

export const api = new ApiService();

export const request = {
  get: api.bindHttpMethod(HTTP_METHODS.GET),
  post: api.bindHttpMethod(HTTP_METHODS.POST),
  put: api.bindHttpMethod(HTTP_METHODS.PUT),
  delete: api.bindHttpMethod(HTTP_METHODS.DELETE),
  patch: api.bindHttpMethod(HTTP_METHODS.PATCH),
} as const;
