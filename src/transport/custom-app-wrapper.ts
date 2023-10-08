import {
    App,
    SSLApp,
    AppOptions,
    HttpRequest, HttpResponse,
    ListenOptions,
    RecognizedString,
    TemplatedApp,
    us_listen_socket, WebSocketBehavior
} from "uWebSockets.js";
import {type} from "@colyseus/schema";

export class CustomAppWrapper implements TemplatedApp {
    app: TemplatedApp;
    basePath: string;
    shouldAppendBasePath: boolean;

    constructor(options?: AppOptions & {isSsl?: boolean, basePath?: string}) {
        this.app = options && options.isSsl ? SSLApp(options) : App(options);
        this.basePath = options ? options.basePath : undefined;
        this.shouldAppendBasePath = false;
    }

    addServerName(hostname: string, options: AppOptions): TemplatedApp {
        return undefined;
    }

    any(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => (void | Promise<void>)): TemplatedApp {
        return undefined;
    }

    connect(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => (void | Promise<void>)): TemplatedApp {
        return undefined;
    }

    del(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => (void | Promise<void>)): TemplatedApp {
        return undefined;
    }

    get(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => (void | Promise<void>)): TemplatedApp {
        return undefined;
    }

    head(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => (void | Promise<void>)): TemplatedApp {
        return undefined;
    }

    listen(host: RecognizedString, port: number, cb: (listenSocket: us_listen_socket) => (void | Promise<void>)): TemplatedApp;
    listen(port: number, cb: (listenSocket: any) => (void | Promise<void>)): TemplatedApp;
    listen(port: number, options: ListenOptions, cb: (listenSocket: (us_listen_socket | false)) => (void | Promise<void>)): TemplatedApp;
    listen(host: RecognizedString | number, port: number | ((listenSocket: any) => (void | Promise<void>)) | ListenOptions, cb?: ((listenSocket: us_listen_socket) => (void | Promise<void>)) | ((listenSocket: (us_listen_socket | false)) => (void | Promise<void>))): TemplatedApp {
        return undefined;
    }

    missingServerName(cb: (hostname: string) => void): TemplatedApp {
        return undefined;
    }

    numSubscribers(topic: RecognizedString): number {
        return 0;
    }

    options(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => (void | Promise<void>)): TemplatedApp {
        return undefined;
    }

    patch(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => (void | Promise<void>)): TemplatedApp {
        return undefined;
    }

    post(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => (void | Promise<void>)): TemplatedApp {
        return undefined;
    }

    publish(topic: RecognizedString, message: RecognizedString, isBinary?: boolean, compress?: boolean): boolean {
        return false;
    }

    put(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => (void | Promise<void>)): TemplatedApp {
        return undefined;
    }

    removeServerName(hostname: string): TemplatedApp {
        return undefined;
    }

    trace(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => (void | Promise<void>)): TemplatedApp {
        return undefined;
    }

    // @ts-ignore
    ws<UserData>(pattern: RecognizedString, behavior: WebSocketBehavior): TemplatedApp {
        return undefined;
    }
}

/**
 * Setup the custom app wrapper functions.
 */
export function setupCustomAppWrapper() {
    const excludedMethods: {[name: string]: boolean} = {
        'trace': true,
        'removeServerName': true,
        'publish': true,
        'numSubscribers': true,
        'missingServerName': true,
        'listen': true,
        'addServerName': true,
    };

    const subProto = CustomAppWrapper.prototype as Record<string,any>;

    // Append basepath before every function
    // @ts-ignore
    for (const name of Object.getOwnPropertyNames(subProto)) {
        const method = subProto[name];
        if (typeof method === "function") {
            subProto[name] = function (...args: any[]): any {
                // tslint:disable-next-line:ban-types
                const fn: Function = this.app && this.app[name] && typeof this.app[name] === "function" ? this.app[name] : undefined;
                if (fn) {
                    if (this.shouldAppendBasePath && this.basePath && !excludedMethods[name] && args && args.length > 0 && typeof args[0] === 'string') {
                        let uri = args[0];
                        uri = uri.startsWith('/') ? uri.substring(1) : uri;
                        args[0] = this.basePath.endsWith('/') ? `${this.basePath}${uri}` : `${this.basePath}/${uri}`;
                    }
                    console.log(args[0])

                    return fn.call(this.app, ...args);
                } else {
                    return undefined;
                }
            };
        }
    }
}