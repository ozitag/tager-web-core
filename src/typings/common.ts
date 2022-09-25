export type Option<V = string> = {
  value: V;
  label: string;
};

export type Nullable<T> = T | null;

export type Nullish<T> = T | null | undefined;

export type ConstantMap<C extends string> = Readonly<Record<C, C>>;

export type FetchStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'FAILURE';

export type RequestErrorType = {
  statusCode: number;
  errorMessage: string;
};

export interface BaseResourceType {
  data: unknown;
  status: string;
  error: unknown;
  meta: unknown;
}

export interface ResourceType<DataType,
  Status extends string = FetchStatus,
  ErrorType = Nullable<RequestErrorType>,
  MetaType = unknown> extends BaseResourceType {
  data: DataType;
  status: Status;
  error: ErrorType;
  meta: MetaType;
}

export interface PaginatedResourceType<EntityType,
  Status extends string = FetchStatus,
  ErrorType = unknown> extends BaseResourceType {
  data: Array<EntityType>;
  status: Status;
  error: ErrorType;
  meta: Nullable<PaginationMeta>;
}

export type ResourceMapType<Key extends string | number, ResourceData> = Record<Key,
  ResourceType<ResourceData>>;

export type QueryParams = { [key: string]: any };

export type MapEntry<K, V> = { key: K; value: V };

export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

export interface ValidationError {
  code: string;
  message: string;
}

export interface LaravelError {
  message: string;
  exception: string;
  file: string;
  line: number;
  trace: Array<{
    class: string;
    file: string;
    function: string;
    line: number;
    type: string;
  }>;
}

export interface PaginationMeta {
  page: {
    number: number;
    size: number;
    count: number;
  };
  total: number;
}

export type ResponseBody<Data = any, M = any> = {
  data: Data;
  errors?: Record<string, ValidationError>;
  message?: string;
  meta?: M;
} & Partial<LaravelError>;

export interface DataResponseBody<D> {
  data: D;
}

export interface PaginatedDataResponseBody<D> extends DataResponseBody<D> {
  meta: PaginationMeta;
}

export interface ValidationResponseBody {
  message: string;
  errors?: { [key: string]: ValidationError };
}

/** Fields */

export type ButtonFieldValueType = Nullable<{
  label: Nullable<string>;
  link: Nullable<string>;
  isNewTab: boolean;
}>;

export type MapFieldValueType = Nullable<{
  latitude: number;
  longitude: number;
}>;

export type FormDataModel = typeof FormData;
