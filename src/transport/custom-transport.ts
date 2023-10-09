import uWebSockets from 'uWebSockets.js';

import { DummyServer, spliceOne } from '@colyseus/core';
import {uWebSocketsTransport} from "@colyseus/uwebsockets-transport";
import {CustomAppWrapper} from "./custom-app-wrapper";

// @ts-ignore
export type TransportOptions = Omit<uWebSockets.WebSocketBehavior, "upgrade" | "open" | "pong" | "close" | "message">;

// @ts-ignore
type RawWebSocketClient = uWebSockets.WebSocket & {
    headers: {[key: string]: string},
    connection: { remoteAddress: string },
};

/**
 * Custom transport that adds a basePath option to the uWebSockets transport.
 */
export class CustomTransport extends uWebSocketsTransport {

    // Code copied from the uWebSocketsTransport in the colyseus lib
    // @ts-ignore
    constructor(options?: TransportOptions & {basePath?: string}, appOptions?: uWebSockets.AppOptions) {
        // tslint:disable-next-line:no-duplicate-super
        super();

        const isSsl: boolean = appOptions && appOptions.cert_file_name !== undefined && appOptions.key_file_name !== undefined;
        const app = new CustomAppWrapper({...appOptions, isSsl, basePath: options?.basePath});
        this.app = app;
        app.shouldAppendBasePath = true;

        if (!options.maxBackpressure) {
            options.maxBackpressure = 1024 * 1024;
        }

        if (!options.compression) {
            options.compression = uWebSockets.DISABLED;
        }

        if (!options.maxPayloadLength) {
            options.maxPayloadLength = 1024 * 1024;
        }

        // https://github.com/colyseus/colyseus/issues/458
        // Adding a mock object for Transport.server
        if(!this.server) {
            this.server = new DummyServer();
        }

        this.app.ws('/*', {
            ...options,

            upgrade: (res, req, context) => {
                // get all headers
                const headers: {[id: string]: string} = {};
                req.forEach((key, value) => headers[key] = value);
                console.log("WS upgrade headers: ");
                console.log(headers);

                /* This immediately calls open handler, you must not use res after this call */
                /* Spell these correctly */
                res.upgrade(
                    {
                        url: req.getUrl(),
                        query: req.getQuery(),

                        // compatibility with @colyseus/ws-transport
                        headers,
                        connection: {
                            remoteAddress: Buffer.from(res.getRemoteAddressAsText()).toString()
                        }
                    },
                    req.getHeader('sec-websocket-key'),
                    req.getHeader('sec-websocket-protocol'),
                    req.getHeader('sec-websocket-extensions'),
                    context
                );
            },

            open: async (ws: RawWebSocketClient) => {
                console.log("WS open headers: ");
                console.log(ws.headers);

                // ws.pingCount = 0;
                await this.onConnection(ws);
            },

            // pong: (ws: RawWebSocketClient) => {
            //     ws.pingCount = 0;
            // },

            close: (ws: RawWebSocketClient, code: number, message: ArrayBuffer) => {
                console.log("WS close headers: ");
                console.log(ws.headers);

                // remove from client list
                spliceOne(this.clients, this.clients.indexOf(ws));

                const clientWrapper = this.clientWrappers.get(ws);
                if (clientWrapper) {
                    this.clientWrappers.delete(ws);

                    // emit 'close' on wrapper
                    clientWrapper.emit('close', code);
                }
            },

            message: (ws: RawWebSocketClient, message: ArrayBuffer, isBinary: boolean) => {
                console.log("WS message headers: ");
                console.log(ws.headers);

                // emit 'close' on wrapper
                this.clientWrappers.get(ws)?.emit('message', Buffer.from(message.slice(0)));
            },

        });

        this.registerMatchMakeRequest();
        app.shouldAppendBasePath = false;
    }
}