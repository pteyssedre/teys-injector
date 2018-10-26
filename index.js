"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var InjectedBy;
(function (InjectedBy) {
    InjectedBy[InjectedBy["System"] = 0] = "System";
    InjectedBy[InjectedBy["User"] = 1] = "User";
})(InjectedBy = exports.InjectedBy || (exports.InjectedBy = {}));
var ResolveType;
(function (ResolveType) {
    ResolveType[ResolveType["Unique"] = 0] = "Unique";
    ResolveType[ResolveType["New_Instance"] = 1] = "New_Instance";
})(ResolveType = exports.ResolveType || (exports.ResolveType = {}));
var Injector = /** @class */ (function () {
    function Injector() {
        this.cache = {};
    }
    Injector.Register = function (key, t) {
        if (!Injector.instance) {
            Injector.instance = new Injector();
        }
        Injector.instance.cache[key] = t;
    };
    Injector.Resolve = function (key) {
        var _a;
        if (!Injector.instance) {
            return undefined;
        }
        var r = Injector.instance.cache[key];
        if (r && r.hasOwnProperty("proto") && r.hasOwnProperty("args")) {
            return new ((_a = r.proto).bind.apply(_a, [void 0].concat(r.args)))();
        }
        return r;
    };
    return Injector;
}());
exports.Injector = Injector;
var injectorMap = {};
function Injectable(options) {
    options = options || { type: ResolveType.Unique, manage: InjectedBy.System };
    options.type = options.type || ResolveType.Unique;
    options.manage = options.manage || InjectedBy.System;
    return function (target) {
        var original = target;
        function construct(constructor, args) {
            var c = function () {
                return constructor.apply(this, args);
            };
            c.prototype = constructor.prototype;
            var d = new c(args);
            if (options.key) {
                switch (options.type) {
                    case ResolveType.Unique:
                        Injector.Register(options.key, d);
                        break;
                    case ResolveType.New_Instance:
                        Injector.Register(options.key, { proto: c, args: args });
                        break;
                }
            }
            Injector.Register("_class_" + target.name.toLowerCase(), d);
            return d;
        }
        var f = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return construct(original, args);
        };
        f.prototype = original.prototype;
        injectorMap[target.name] = { constructor: f, options: options };
        return target;
    };
}
exports.Injectable = Injectable;
function Inject(name, props) {
    return function (target, key) {
        var v = Injector.Resolve(name ? name : key);
        if (!v) {
            v = Injector.Resolve("_class_" + key.toLowerCase());
        }
        if (!v) {
            var data = Reflect.getOwnMetadata("design:type", target, key);
            var functionName = /function(.*[a-zA-Z])/g;
            var match = functionName.exec(data.toString());
            if (match && match.length > 0) {
                var name_1 = match[1].trim();
                var injector = injectorMap[name_1];
                if (injector.options.type === ResolveType.New_Instance) {
                    v = injector.constructor();
                }
                else {
                    if (!injector.instance) {
                        injector.instance = injector.constructor();
                    }
                    v = injector.instance;
                }
            }
        }
        if (v) {
            if (props) {
                var keys = Object.keys(props);
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var k = keys_1[_i];
                    v[k] = props[k];
                }
            }
        }
        target[key] = v;
    };
}
exports.Inject = Inject;
