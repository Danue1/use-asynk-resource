import { useRef, useState } from "react";

export const useAsyncResource = fetch => {
  const isMounted = () => ref.current === resource;
  const fetchResource = fn =>
    setResource(createInternalResource(fn, isMounted, fetchResource));
  const [resource, setResource] = useState(() =>
    createInternalResource(fetch, isMounted, fetchResource)
  );
  const ref = useRef();
  ref.current = resource;
  return resource;
};

const createInternalResource = (fn, isMounted, fetch) => {
  const resolve = promise =>
    promise.then(item => {
      if (isMounted()) {
        return item;
      }
      // eslint-disable-next-line
      throw null;
    });
  const resource = createResource(
    fn(resolve).then(
      commit => {
        if (isMounted()) {
          return typeof commit === "function" ? commit() : commit.default;
        }
        return null;
      },
      error => {
        if (isMounted()) {
          throw error;
        }
        return null;
      }
    ),
    fetch
  );
  return resource;
};

export const createResource = (fn, fetch) => {
  let status = "pending";
  let result;

  const promise = typeof fn === "function" ? fn() : fn;
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

  const read = () => {
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
