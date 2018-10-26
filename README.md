# teys-injector
Simple injector syntax for Typescript code. It allows you to set dependency

```typescript
import { Injectable, Inject } from "teys-injector";

@Injectable()
class Service {
    
    method1(): boolean {
        return false;
    }
}
```

```typescript
import { Inject } from "teys-injector";

class OtherClass {
    
    @Inject()
    svc: Service;
    
    method2() {
        return this.svc.method1();
    }
}
```

You can also register manually values and resolve them
```typescript
import { Injector } from "teys-injector";

Injector.Register("user", { username: 'default' });
```

```typescript
import { Injector } from "teys-injector";

const defaultUser = Injector.Resolve<User>("user");

```

## Not supported yet

 - Injectable constructor parameters 