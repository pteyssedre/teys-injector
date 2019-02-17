import "reflect-metadata";

export enum InjectedBy {
    System,
    User,
}

export enum ResolveType {
    Unique,
    New_Instance,
}

export class Injector {

    public static Register<T>(key: string, t: T): void {
        if (!Injector.instance) {
            Injector.instance = new Injector();
        }
        Injector.instance.cache[key] = t;
    }

    public static Resolve<T>(key: string): T | undefined {
        if (!Injector.instance) {
            return undefined;
        }
        const r = Injector.instance.cache[key];
        if (r && r.hasOwnProperty("proto") && r.hasOwnProperty("args")) {
            return new r.proto(...r.args);
        }
        return r;
    }

    private static instance: Injector;

    public cache: { [key: string]: any };

    private constructor() {
        this.cache = {};
    }
}

const injectorMap: { [key: string]: { constructor: any, options: any, instance?: any } } = {};

export function Injectable(options?: any) {
    options = options || {type: ResolveType.Unique, manage: InjectedBy.System};
    options.type = options.type || ResolveType.Unique;
    options.manage = options.manage || InjectedBy.System;
    return function (target: any) {
        const original = target;

        function construct(constructor: any, args: any[]) {
            const c: any = function (this: any) {
                return constructor.apply(this, args);
            };
            c.prototype = constructor.prototype;
            const d = new c(args);
            if (options.key) {
                switch (options.type) {
                    case ResolveType.Unique:
                        Injector.Register(options.key, d);
                        break;
                    case ResolveType.New_Instance:
                        Injector.Register(options.key, {proto: c, args});
                        break;
                }
            }
            Injector.Register("_class_" + target.name.toLowerCase(), d);
            return d;
        }

        const f: any = function (...args: any[]) {
            return construct(original, args);
        };

        f.prototype = original.prototype;
        injectorMap[target.name] = {constructor: f, options};
        return target;
    };
}

export function Inject(name?: string, props?: any) {
    return (target: any, key: string) => {
        let v = Injector.Resolve<any>(name ? name : key);
        if (!v) {
            v = Injector.Resolve("_class_" + key.toLowerCase());
        }
        if (!v) {
            const data = Reflect.getOwnMetadata("design:type", target, key);
            const functionName = /function(.*[a-zA-Z])/g;
            const match = functionName.exec(data.toString());
            if (match && match.length > 0) {
                const n = match[1].trim();
                const injector = injectorMap[n];
                if (!injector) {
                    if (name) {
                        Object.defineProperty(target, key, {
                            get: () => { return Injector.Resolve(name); },
                            set: () => { throw new Error(`cannot set injected property ${key}`)}
                        })
                    } else {
                        throw new Error(`No register was made for ${key}:${n}`)
                    }
                }
                if (injector.options.type === ResolveType.New_Instance) {
                    v = injector.constructor();
                } else {
                    if (!injector.instance) {
                        injector.instance = injector.constructor();
                    }
                    v = injector.instance;
                }
            }
        }
        if (v) {
            if (props) {
                const keys = Object.keys(props);
                for (const k of keys) {
                    v[k] = props[k];
                }
            }
        }
        target[key] = v;
    };
}
