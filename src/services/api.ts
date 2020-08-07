import {
  BodyParam,
  HttpMethod,
  HttpRequestFunction,
  RequestOptions,
} from '../typings/api';
import { ConstantMap, Nullable, QueryParams } from '../typings/common';
import { isBrowser, isomorphicLog, isNotNullish } from '../utils/common';
import { convertParamsToString } from '../utils/searchParams';

import cookie from './cookie';
import RequestError from './RequestError';

export type OAuthTokenResponseBody = {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
};

const HTTP_METHODS: ConstantMap<HttpMethod> = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

const ACCESS_TOKEN_FIELD = 'accessToken';
const REFRESH_TOKEN_FIELD = 'refreshToken';

type ApiConfigType = {
  useRefreshToken?: boolean;
};

type ApiResponseMiddlewareOptionsType = { startTime: number };

type ApiResponseMiddlewareType = (
  response: Response,
  request: Request,
  options: ApiResponseMiddlewareOptionsType
) => Promise<Response>;

class ApiService {
  private accessToken: Nullable<string>;
  private refreshToken: Nullable<string>;
  private refreshRequest: Nullable<Promise<boolean>>;
  private unauthorizedErrorHandler: Nullable<() => void>;
  private config: ApiConfigType;

  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.refreshRequest = null;
    this.unauthorizedErrorHandler = null;
    this.config = {};
  }

  public setConfig(config: ApiConfigType): void {
    this.config = { ...this.config, ...config };
  }

  /** Set refresh token on server side */
  public setUnauthorizedErrorHandler(unauthorizedErrorHandler: () => void) {
    this.unauthorizedErrorHandler = unauthorizedErrorHandler;
  }

  private handleUnauthorizedError(): void {
    if (this.unauthorizedErrorHandler) {
      this.unauthorizedErrorHandler();
    }
  }

  /** Set access token on server side */
  public setAccessToken(accessToken: Nullable<string>) {
    if (isBrowser()) {
      if (accessToken !== null) {
        cookie.set(ACCESS_TOKEN_FIELD, accessToken);
      } else {
        cookie.remove(ACCESS_TOKEN_FIELD);
      }
    } else {
      this.accessToken = accessToken;
    }
  }

  /** Set refresh token on server side */
  public setRefreshToken(refreshToken: Nullable<string>) {
    if (isBrowser()) {
      if (refreshToken !== null) {
        cookie.set(REFRESH_TOKEN_FIELD, refreshToken);
      } else {
        cookie.remove(REFRESH_TOKEN_FIELD);
      }
    } else {
      this.accessToken = refreshToken;
    }
  }

  public getAccessToken(): Nullable<string> {
    if (isBrowser()) {
      return cookie.get(ACCESS_TOKEN_FIELD);
    } else {
      return this.accessToken;
    }
  }

  public getRefreshToken(): Nullable<string> {
    if (isBrowser()) {
      return cookie.get(REFRESH_TOKEN_FIELD);
    } else {
      return this.refreshToken;
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
      headers.append('Authorization', `Bearer ${accessToken}`);
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

  logRequest(request: Request): void {
    const formattedLog = `--> ${request.method} ${request.url}`;
    isomorphicLog(formattedLog);
  }

  async logResponse(
    res: Response,
    req: Request,
    options: ApiResponseMiddlewareOptionsType
  ): Promise<Response> {
    const endTime = Date.now();
    const requestDuration = endTime - options.startTime;

    const formattedLog = `<-- ${req.method} ${res.status} ${requestDuration}ms ${res.url}`;
    isomorphicLog(formattedLog);
    return res;
  }

  private makeRefreshRequest(): Promise<boolean> {
    const url = this.getRequestUrl('/oauth/user/token');
    const options = this.configureOptions({
      method: HTTP_METHODS.POST,
      body: {
        grant_type: 'refresh_token',
        client_id: 1,
        refresh_token: this.getRefreshToken(),
      },
    });

    const request = new Request(url, options);

    return fetch(request)
      .then<OAuthTokenResponseBody>(this.handleErrors.bind(this))
      .then((body) => {
        this.setAccessToken(body.access_token);
        this.setRefreshToken(body.refresh_token);

        return true;
      })
      .catch((error) => {
        isomorphicLog(error);

        this.setAccessToken(null);
        this.setRefreshToken(null);

        return false;
      })
      .finally(() => {
        this.refreshRequest = null;
      });
  }

  private async refreshMiddleware(
    response: Response,
    request: Request
  ): Promise<Response> {
    if (response.status !== 401 || !this.getRefreshToken()) return response;

    if (!this.refreshRequest) {
      this.refreshRequest = this.makeRefreshRequest();
    }

    const isSuccess = await this.refreshRequest;

    if (isSuccess) {
      /** TODO make middlewares like axios, via config with "retry" option */
      const newRequest = request.clone();
      newRequest.headers.set(
        'Authorization',
        `Bearer ${this.getAccessToken()}`
      );

      this.logRequest(newRequest);

      const middlewareOptions: ApiResponseMiddlewareOptionsType = {
        startTime: Date.now(),
      };

      return fetch(newRequest).then((response) =>
        this.logResponse(response, newRequest, middlewareOptions)
      );
    } else {
      return response;
    }
  }

  private async unauthorizedMiddleware(response: Response): Promise<Response> {
    if (response.status === 401) {
      this.handleUnauthorizedError();
    }

    return response;
  }

  createRequest({
    method,
    path,
    body,
    params,
    absoluteUrl,
    fetchOptions,
  }: RequestOptions): Request {
    const url = absoluteUrl || this.getRequestUrl(path, params);
    const options = this.configureOptions({ method, body, fetchOptions });

    return new Request(url, options);
  }

  runResponseMiddlewares(
    response: Response,
    request: Request,
    options: ApiResponseMiddlewareOptionsType
  ): Promise<Response> {
    const middlewareList: Array<ApiResponseMiddlewareType> = [
      this.logResponse.bind(this),
    ];

    if (this.config.useRefreshToken) {
      middlewareList.push(this.refreshMiddleware.bind(this));
    }

    middlewareList.push(this.unauthorizedMiddleware.bind(this));

    return middlewareList.reduce(
      (promise, middleware) =>
        promise.then((response) => middleware(response, request, options)),
      Promise.resolve(response)
    );
  }

  executeRequest(request: Request) {
    this.logRequest(request);

    const middlewareOptions: ApiResponseMiddlewareOptionsType = {
      startTime: Date.now(),
    };

    return fetch(request)
      .then((response) =>
        this.runResponseMiddlewares(response, request, middlewareOptions)
      )
      .then(this.handleErrors.bind(this));
  }

  bindHttpMethod(method: HttpMethod): HttpRequestFunction {
    return (options: Omit<RequestOptions, 'method'>) => {
      const request = this.createRequest({ ...options, method });
      return this.executeRequest(request);
    };
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
