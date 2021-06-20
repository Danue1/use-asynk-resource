import { useRef, useState } from "react";

export type FetchResource<T> = (resolve: Resolve) => Promise<CommitResource<T>>;

export type Resolve = <T>(promise: Promise<T>) => Promise<T>;

export type CommitResource<T> = T | (() => T);

export type Resource<T> = {
  readonly read: () => T;
  readonly fetch: (fn: FetchResource<T>) => void;
};

export const useAsyncResource = <T>(fetch: FetchResource<T>): Resource<T> => {
  const isMounted = (): boolean => ref.current === resource;
  const fetchResource = (fn: FetchResource<T>): void =>
    setResource(createInternalResource(fn, isMounted, fetchResource));
  const [resource, setResource] = useState(() =>
    createInternalResource(fetch, isMounted, fetchResource)
  );
  const ref = useRef<Resource<T>>();
  ref.current = resource;
  return resource;
};

const createInternalResource = <T>(
  fn: FetchResource<T>,
  isMounted: () => boolean,
  fetch: (fn: FetchResource<T>) => void
) => {
  const resolve = <T>(promise: Promise<T>): Promise<T> =>
    promise.then(item => {
      if (isMounted()) {
        return item;
      }
      // eslint-disable-next-line
      throw null;
    });
  const resource = createResource(
    fn(resolve).then<T, T>(
      commit => {
        if (isMounted()) {
          return typeof commit === "function" ? (commit as () => T)() : commit;
        }
        return null as unknown as T;
      },
      error => {
        if (isMounted()) {
          throw error;
        }
        return null as unknown as T;
      }
    ),
    fetch
  );
  return resource;
};

export const createResource = <T>(
  promise: Promise<T>,
  fetch: (fn: FetchResource<T>) => void
): Resource<T> => {
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

  return { read, fetch };
};
