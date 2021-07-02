import { useRef, useState } from "react";

export type FetchResource<T> = (resolve: Resolve) => Promise<CommitResource<T>>;

export type Resolve = <T>(promise: Promise<T>) => Promise<T>;

export type CommitResource<T> = { readonly default: T } | (() => T);

export type Resource<T> = {
  readonly read: () => T;
};

export const useAsyncResource = <T>(fetch: FetchResource<T>) => {
  const isMounted = (): boolean => ref.current === resource;
  const fetchResource = (fn: FetchResource<T>): void =>
    setResource({
      ...createInternalResource(fn, isMounted),
      fetch: fetchResource,
    });
  const [resource, setResource] = useState(() => ({
    ...createInternalResource(fetch, isMounted),
    fetch: fetchResource,
  }));
  const ref = useRef<Resource<T>>();
  ref.current = resource;
  return resource;
};

const createInternalResource = <T>(
  fn: FetchResource<T>,
  isMounted: () => boolean
): Resource<T> => {
  const resolve = <T>(promise: Promise<T>): Promise<T> =>
    promise.then(item => {
      if (isMounted()) {
        return item;
      }
      // eslint-disable-next-line
      throw null;
    });
  return createResource(
    fn(resolve).then<T, T>(
      commit => {
        if (isMounted()) {
          return typeof commit === "function"
            ? (commit as () => T)()
            : commit.default;
        }
        return null as unknown as T;
      },
      error => {
        if (isMounted()) {
          throw error;
        }
        return null as unknown as T;
      }
    )
  );
};

export const createResource = <T>(promise: Promise<T>): Resource<T> => {
  let status: "pending" | "done" | "error" = "pending";
  let result: T;

  const suspender = promise.then(
    ret => {
      status = "done";
      result = ret;
    },
    error => {
      status = "error";
      result = error;
    }
  );

  const read = (): T => {
    switch (status) {
      case "pending": {
        throw suspender;
      }
      case "done": {
        return result;
      }
      case "error": {
        throw result;
      }
    }
  };

  return { read };
};
