import express from 'express';
import {LobbyRoom, LocalPresence, Server} from "colyseus";
import {WebSocketTransport} from "@colyseus/ws-transport";
import {createServer} from "http";
import {GameRoom} from "./game.room";

const app = express();
app.use(express.json());
app.use('/', express.static('static'));

// Not found path
app.get('*', (req, res) => {
  res.status(404);
  res.sendFile(__dirname + '/pages/not_found.html');
});

const gameServer = new Server({
  transport: new WebSocketTransport({server: createServer(app), path: process.env.BASE_PATH}),
  presence: new LocalPresence()
});

gameServer.define("lobby", LobbyRoom);

gameServer.define('main_room', GameRoom)
    .enableRealtimeListing();

const port = parseInt(process.env.NODE_SERVER_PORT, 10) || parseInt(process.argv[0], 10) || 3001;
gameServer.listen(port).then( () => {
  return console.log(`server is listening on ${port}`);
});
