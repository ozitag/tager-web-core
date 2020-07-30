export type Option<V = string> = {
  value: V;
  label: string;
};

export type Nullable<T> = T | null;

export type Nullish<T> = T | null | undefined;

export type ConstantMap<C extends string> = Readonly<Record<C, C>>;

export type FetchStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'FAILURE';

export type ResourceType<T, E = string> = {
  data: T;
  status: FetchStatus;
  error: Nullable<E>;
};

export type ResourceMapType<Key extends string | number, ResourceData> = Record<
  Key,
  ResourceType<ResourceData>
>;

export type QueryParams = { [key: string]: any };

export type MapEntry<K, V> = { key: K; value: V };

export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

export type ValidationError = { code: string; message: string };

export type LaravelError = {
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
};

export type ResponseBody<Data = any> = {
  data: Data;
  errors?: Record<string, ValidationError>;
  message?: string;
} & Partial<LaravelError>;
