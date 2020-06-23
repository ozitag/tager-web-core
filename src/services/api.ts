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
    const search = convertParamsToString(queryParams);
    return [process.env.NEXT_PUBLIC_API_URL, pathname, search]
      .filter(isNotNullish)
      .join('');
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

  logRequest(res: Response, options: RequestInit): Response {
    const formattedLog = `${options.method} ${res.status} ${res.url}`;
    isomorphicLog(formattedLog);
    return res;
  }

  async makeRequest(
    method: HttpMethod,
    { path, body, params, absoluteUrl, fetchOptions }: RequestOptions
  ) {
    const url = absoluteUrl || this.getRequestUrl(path, params);
    const options = this.configureOptions({ method, body, fetchOptions });

    return fetch(url, options)
      .then((response) => this.logRequest(response, options))
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
