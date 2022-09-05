import express from 'express';
import {LocalPresence, Server} from "colyseus";
import {WebSocketTransport} from "@colyseus/ws-transport";
import {createServer} from "http";
import {GameRoom} from "./game.room";

const app = express();
app.use(express.json());
app.use('/jogo', express.static('../client'));

app.get('/', (req, res) => {
  res.status(200);
  res.send('Hello World!');
});

const gameServer = new Server({
  transport: new WebSocketTransport({server: createServer(app)}),
  presence: new LocalPresence()
});

gameServer.define('main_room', GameRoom).enableRealtimeListing();

const port = parseInt(process.env.PORT) || 3001;
gameServer.listen(port).then( () => {
  return console.log(`server is listening on ${port}`);
});
