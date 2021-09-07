import {
  BodyParam,
  HttpMethod,
  HttpRequestFunction,
  RequestOptions,
} from '../typings/api';
import {
  ConstantMap,
  FormDataModel,
  Nullable,
  QueryParams,
  ResponseBody,
} from '../typings/common';
import {
  isBrowser,
  isomorphicLog,
  isNotNullish,
  isNonNullObjectGuard,
} from '../utils/common';
import { convertParamsToString } from '../utils/searchParams';

import cookie from './cookie';
import RequestError from './RequestError';

const IsomorphicFormData = isBrowser()
  ? FormData
  : (require('form-data') as FormDataModel);

export type OAuthTokenResponseBody = {
  tokenType: string;
  expiresAt: number;
  accessToken: string;
  refreshToken: string;
  scopes: Array<string>;
};

const HTTP_METHODS: ConstantMap<HttpMethod> = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

type ApiBaseUrl = { ssr: string | undefined; csr: string | undefined } | string;

type ApiConfigType = {
  useRefreshToken?: boolean;
  baseUrl?: ApiBaseUrl;
};

type ApiResponseMiddlewareOptionsType = { startTime: number };

type ApiResponseMiddlewareType = (
  response: Response,
  request: Request,
  options: ApiResponseMiddlewareOptionsType
) => Promise<Response>;

const DEFAULT_CONFIG: ApiConfigType = {
  useRefreshToken: false,
  baseUrl: {
    csr: process.env.NEXT_PUBLIC_CSR_API_URL,
    ssr: process.env.NEXT_PUBLIC_SSR_API_URL,
  },
};

export class ApiService {
  /** Server side only */
  private accessToken: Nullable<string>;
  private refreshToken: Nullable<string>;

  private refreshRequest: Nullable<Promise<boolean>>;
  private unauthorizedErrorHandler: Nullable<() => void>;
  private config: ApiConfigType;

  private language: Nullable<string>;

  constructor(config?: ApiConfigType) {
    /** Server side only */
    this.accessToken = null;
    this.refreshToken = null;

    this.refreshRequest = null;
    this.unauthorizedErrorHandler = null;
    this.config = config || DEFAULT_CONFIG;

    this.language = process.env.NEXT_PUBLIC_LANGUAGE ?? null;
  }

  public setConfig(config: ApiConfigType): void {
    this.config = { ...this.config, ...config };
  }

  public getBaseUrl(): string | undefined {
    const baseUrl = this.config.baseUrl ?? DEFAULT_CONFIG.baseUrl;

    if (isNonNullObjectGuard(baseUrl)) {
      return isBrowser() ? baseUrl.csr : baseUrl.ssr;
    }

    return baseUrl;
  }

  public getLanguage(): Nullable<string> {
    return this.language;
  }

  public setLanguage(lang: Nullable<string>): void {
    this.language = lang;
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
  public setAccessToken(accessToken: Nullable<string>, remember = true) {
    if (isBrowser()) {
      if (accessToken !== null) {
        if(remember){
          cookie.set(ACCESS_TOKEN_COOKIE, accessToken, undefined, 365);
        } else{
          cookie.set(ACCESS_TOKEN_COOKIE, accessToken);
        }
      } else {
        cookie.remove(ACCESS_TOKEN_COOKIE);
      }
    } else {
      this.accessToken = accessToken;
    }
  }

  /** Set refresh token on server side */
  public setRefreshToken(refreshToken: Nullable<string>, remember = true) {
    if (isBrowser()) {
      if (refreshToken !== null) {
        if(remember){
          cookie.set(REFRESH_TOKEN_COOKIE, refreshToken, undefined, 365);
        } else{
          cookie.set(REFRESH_TOKEN_COOKIE, refreshToken);
        }
      } else {
        cookie.remove(REFRESH_TOKEN_COOKIE);
      }
    } else {
      this.refreshToken = refreshToken;
    }
  }

  public getAccessToken(): Nullable<string> {
    if (isBrowser()) {
      return cookie.get(ACCESS_TOKEN_COOKIE);
    } else {
      return this.accessToken;
    }
  }

  public getRefreshToken(): Nullable<string> {
    if (isBrowser()) {
      return cookie.get(REFRESH_TOKEN_COOKIE);
    } else {
      return this.refreshToken;
    }
  }

  private configureHeaders(body?: BodyParam): Headers {
    const headers = new Headers();

    const isFormData = body instanceof IsomorphicFormData;
    if (!isFormData) {
      headers.append('Content-Type', 'application/json');
    }

    const accessToken = this.getAccessToken();

    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`);
    }

    if (this.language) {
      headers.append('Accept-Language', this.language);
    }

    headers.append('Accept', 'application/json');

    return headers;
  }

  private configureBody(body?: BodyParam) {
    if (!body) return null;

    if (body instanceof IsomorphicFormData) {
      return body;
    }

    return JSON.stringify(body);
  }

  private getRequestUrl(pathname = '', queryParams?: QueryParams) {
    const baseUrl = this.getBaseUrl();

    const search = convertParamsToString(queryParams);
    return [baseUrl, pathname, search].filter(isNotNullish).join('');
  }

  configureOptions({
    method,
    body,
    fetchOptions,
  }: {
    method: HttpMethod;
    body?: BodyParam | undefined;
    fetchOptions?: RequestInit | undefined;
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

  logRequest(request: Request, comment?: string): void {
    let formattedLog = `--> ${request.method} ${request.url}`;

    if (comment) {
      formattedLog = formattedLog + ` - ${comment}`;
    }

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
    const url = this.getRequestUrl('/auth/user');
    const options = this.configureOptions({
      method: HTTP_METHODS.POST,
      body: {
        clientId: 1,
        grantType: 'refresh_token',
        refreshToken: this.getRefreshToken(),
      },
    });

    const request = new Request(url, options);

    this.logRequest(request, 'Refresh token');

    const middlewareOptions: ApiResponseMiddlewareOptionsType = {
      startTime: Date.now(),
    };

    return fetch(request)
      .then((response) =>
        this.logResponse(response, request, middlewareOptions)
      )
      .then<ResponseBody<OAuthTokenResponseBody>>((response) =>
        this.handleErrors(response)
      )
      .then((body) => {
        this.setAccessToken(body.data.accessToken);
        this.setRefreshToken(body.data.refreshToken);

        return true;
      })
      .catch((error) => {
        if (!(error instanceof RequestError)) {
          isomorphicLog(error);
        }

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

  bindHttpMethodToRequest(method: HttpMethod): HttpRequestFunction {
    return (options: Omit<RequestOptions, 'method'>) => {
      const request = this.createRequest({ ...options, method });
      return this.executeRequest(request);
    };
  }

  getRequest() {
    return {
      get: this.bindHttpMethodToRequest(HTTP_METHODS.GET),
      post: this.bindHttpMethodToRequest(HTTP_METHODS.POST),
      put: this.bindHttpMethodToRequest(HTTP_METHODS.PUT),
      delete: this.bindHttpMethodToRequest(HTTP_METHODS.DELETE),
      patch: this.bindHttpMethodToRequest(HTTP_METHODS.PATCH),
    } as const;
  }
}

export const api = new ApiService();

export const request = api.getRequest();
