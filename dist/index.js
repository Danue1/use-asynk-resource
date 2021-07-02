"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResource = exports.useAsyncResource = void 0;
var react_1 = require("react");
var useAsyncResource = function (fetch) {
    var isMounted = function () { return ref.current === resource; };
    var fetchResource = function (fn) {
        return setResource(__assign(__assign({}, createInternalResource(fn, isMounted)), { fetch: fetchResource }));
    };
    var _a = react_1.useState(function () { return (__assign(__assign({}, createInternalResource(fetch, isMounted)), { fetch: fetchResource })); }), resource = _a[0], setResource = _a[1];
    var ref = react_1.useRef();
    ref.current = resource;
    return resource;
};
exports.useAsyncResource = useAsyncResource;
var createInternalResource = function (fn, isMounted) {
    var resolve = function (promise) {
        return promise.then(function (item) {
            if (isMounted()) {
                return item;
            }
            // eslint-disable-next-line
            throw null;
        });
    };
    return exports.createResource(fn(resolve).then(function (commit) {
        if (isMounted()) {
            return typeof commit === "function"
                ? commit()
                : commit.default;
        }
        return null;
    }, function (error) {
        if (isMounted()) {
            throw error;
        }
        return null;
    }));
};
var createResource = function (promise) {
    var status = "pending";
    var result;
    var suspender = promise.then(function (ret) {
        status = "done";
        result = ret;
    }, function (error) {
        status = "error";
        result = error;
    });
    var read = function () {
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
    return { read: read };
};
exports.createResource = createResource;
