export type FetchResource<T> = (resolve: Resolve) => Promise<CommitResource<T>>;

export type Resolve = <T>(promise: Promise<T>) => Promise<T>;

export type CommitResource<T> = T | (() => T);

export type Resource<T> = {
  readonly read: () => T;
  readonly fetch: (fn: FetchResource<T>) => void;
};

export const useAsyncResource: <T>(fetch: FetchResource<T>) => Resource<T>;

export const createResource: <T>(
  promise: Promise<T>,
  fetch: (fn: FetchResource<T>) => void
) => Resource<T>;
