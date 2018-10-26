import "reflect-metadata";
export declare enum InjectedBy {
    System = 0,
    User = 1
}
export declare enum ResolveType {
    Unique = 0,
    New_Instance = 1
}
export declare class Injector {
    static Register<T>(key: string, t: T): void;
    static Resolve<T>(key: string): T | undefined;
    private static instance;
    cache: {
        [key: string]: any;
    };
    private constructor();
}
export declare function Injectable(options?: any): (target: any) => any;
export declare function Inject(name?: string, props?: any): (target: any, key: string) => void;
