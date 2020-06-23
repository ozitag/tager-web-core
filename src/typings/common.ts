export type Option<V = string> = {
  value: V;
  label: string;
};

export type Nullable<T> = T | null;

export type Nullish<T> = T | null | undefined;

export type ConstantMap<C extends string> = Readonly<Record<C, C>>;

export type FetchStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'FAILURE';

export type LoadableData<T, E = string> = {
  data: T;
  status: FetchStatus;
  error: Nullable<E>;
};
export type QueryParams = { [key: string]: any };
