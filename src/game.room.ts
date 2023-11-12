import {MapSchema, Schema, type} from "@colyseus/schema";
import {Client, Room, updateLobby} from "colyseus";
import {Events} from "./events";

export class Player extends Schema {

    @type("string")
    name = "Anônimo";

    @type("number")
    mapNum = 0;

    @type("number")
    x = 0;

    @type("number")
    y = 0;

    @type("number")
    playerSprite = -1;

    @type("boolean")
    isRunning = false;

}

export class GameState extends Schema {

    @type({ map: Player })
    players = new MapSchema<Player>();

    something = "This attribute won't be sent to the client-side";

    createPlayer(sessionId: string, config: string) {
        const p = new Player();

        const split = config.split(';;;');
        p.name = split[0];
        p.playerSprite = split[1] ? parseInt(split[1], 10) || this.players.size : this.players.size;

        this.players.set(sessionId, p);
        return {...p, sessionId};
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    movePlayer(sessionId: string, movement: {map: number, x: number, y: number, isRunning: boolean}) {
        const p = this.players.get(sessionId);
        p.x = movement.x;
        p.y = movement.y;
        p.isRunning = movement.isRunning;
        p.mapNum = movement.map;
    }

}

export class GameRoom extends Room<GameState> {

    onCreate(options: any): void | Promise<any> {
        this.setState(new GameState());

        this.onMessage(Events.PLAYER_MOVE, (client, message) => {
            this.state.movePlayer(client.sessionId, message);
        });

        this.onMessage('player_event', (eventClient, message) => this.broadcast('player_event', message));

        this.maxClients = parseInt(options.maxPlayers, 10) || 99;
        this.setMetadata({
            roomName: options.roomName
        }).then(() => updateLobby(this));
    }

    onJoin(client: Client, options) {
        client.send(Events.EVENT_LIST, ({...Events}));
        this.broadcast(Events.PLAYER_JOINED, this.state.createPlayer(client.sessionId, options.name));
    }

    onLeave(client: Client, consented?: boolean): void | Promise<any> {
        this.state.removePlayer(client.sessionId);
        this.broadcast(Events.PLAYER_LEFT, client.sessionId);
    }

}
