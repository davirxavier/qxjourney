import express from 'express';
import {LocalPresence, Server} from "colyseus";
import {WebSocketTransport} from "@colyseus/ws-transport";
import {createServer} from "http";
import {GameRoom} from "./game.room";

const app = express();
app.use(express.json());
app.use('/', express.static('static'));

app.get('/', (req, res) => {
  res.redirect('/game');
});

// Not found path
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/pages/not_found.html');
});

const gameServer = new Server({
  transport: new WebSocketTransport({server: createServer(app)}),
  presence: new LocalPresence()
});

gameServer.define('main_room', GameRoom).enableRealtimeListing();

const port = parseInt(process.env.NODE_SERVER_PORT) || parseInt(process.argv[0]) || 3001;
gameServer.listen(port).then( () => {
  return console.log(`server is listening on ${port}`);
});
