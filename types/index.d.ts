export declare type FetchResource<T> = (resolve: Resolve) => Promise<CommitResource<T>>;
export declare type Resolve = <T>(promise: Promise<T>) => Promise<T>;
export declare type CommitResource<T> = {
    readonly default: T;
} | (() => T);
export declare type Resource<T> = {
    readonly read: () => T;
};
export declare const useAsyncResource: <T>(fetch: FetchResource<T>) => {
    fetch: (fn: FetchResource<T>) => void;
    read: () => T;
};
export declare const createResource: <T>(promise: Promise<T>) => Resource<T>;
