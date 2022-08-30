import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import path from 'path';
import express from 'express';

export default Arena({
    getId: () => "Your Colyseus App",

    initializeGameServer: (gameServer) => {
    },

    initializeExpress: (app) => {
        app.use('/colyseus', monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
