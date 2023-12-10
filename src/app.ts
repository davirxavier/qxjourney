import express from 'express';
import expressify from "uwebsockets-express"
import {Server} from "colyseus";
import {GameRoom} from "./game.room";
import {uWebSocketsTransport} from "@colyseus/uwebsockets-transport";
import {CustomLobby} from "./CustomLobby";

const transport = new uWebSocketsTransport({sendPingsAutomatically: true});
const app = expressify(transport.app);

app.use(express.json());
app.use('/game', express.static('./static'));

// Not found path
app.use('*', (req, res) => {
  console.log(`Not found: ${req.baseUrl}`);
  res.status(404);
  res.redirect('/pages/not_found.html');
});

const gameServer = new Server({transport});

gameServer.define("lobby", CustomLobby);

gameServer.define('main_room', GameRoom)
    .enableRealtimeListing();

const port = parseInt(process.env.NODE_SERVER_PORT, 10) || parseInt(process.argv[0], 10) || 3001;
gameServer.listen(port).then(() => {
  return console.log(`server is listening on ${port}`);
});
