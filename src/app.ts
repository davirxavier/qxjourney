import express from 'express';
import expressify from "uwebsockets-express"
import {LobbyRoom, LocalPresence, Server} from "colyseus";
import {GameRoom} from "./game.room";
import {uWebSocketsTransport} from "@colyseus/uwebsockets-transport";

const transport = new uWebSocketsTransport({});
const app = expressify(transport.app);

app.use(express.json());
app.use('/', express.static('static'));

// Not found path
app.use('*', (req, res) => {
  console.log(`Not found: ${req.url}`);
  res.status(404);
  res.sendFile(__dirname + '/pages/not_found.html');
});

const gameServer = new Server({
  transport,
  presence: new LocalPresence()
});

gameServer.define("lobby", LobbyRoom);

gameServer.define('main_room', GameRoom)
    .enableRealtimeListing();

const port = parseInt(process.env.NODE_SERVER_PORT, 10) || parseInt(process.argv[0], 10) || 3001;
gameServer.listen(port).then( () => {
  return console.log(`server is listening on ${port}`);
});
