import express from 'express';
import expressify from "uwebsockets-express"
import {LobbyRoom, LocalPresence, Server} from "colyseus";
import {GameRoom} from "./game.room";
import {CustomTransport} from "./transport/custom-transport";
import {setupCustomAppWrapper} from "./transport/custom-app-wrapper";
import {processBasePathUrl} from "./utils";
import {CustomLobbyRoom} from "./transport/custom-lobby-room";

setupCustomAppWrapper();

const basePath = processBasePathUrl(process.env.BASE_PATH);
const transport = new CustomTransport({basePath: basePath + '/ws'});
const app = expressify(transport.app);

console.log('Setting up with base path: ' + basePath);

app.use(express.json());
app.use(basePath + '/game', express.static('static'));

// Not found path
app.use('*', (req, res) => {
  console.log(`Not found: ${req.baseUrl}`);
  res.status(404);
  res.sendFile(__dirname + '/pages/not_found.html');
});

const gameServer = new Server({
  transport,
  presence: new LocalPresence()
});

gameServer.define("lobby", CustomLobbyRoom);

gameServer.define('main_room', GameRoom)
    .enableRealtimeListing();

const port = parseInt(process.env.NODE_SERVER_PORT, 10) || parseInt(process.argv[0], 10) || 3001;
gameServer.listen(port).then( () => {
  return console.log(`server is listening on ${port}`);
});
