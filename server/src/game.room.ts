import {MapSchema, Schema, type} from "@colyseus/schema";
import {Client, Room} from "colyseus";

export class Player extends Schema {

    @type("number")
    mapNum = 0;

    @type("number")
    x = 0;

    @type("number")
    y = 0;

    @type("boolean")
    isRunning = false;

}

export class GameState extends Schema {

    @type({ map: Player })
    players = new MapSchema<Player>();

    something = "This attribute won't be sent to the client-side";

    createPlayer(sessionId: string) {
        const p = new Player();
        this.players.set(sessionId, p);
        return {...p, sessionId};
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    movePlayer (sessionId: string, movement: {map: number, x: number, y: number, isRunning: boolean}) {
        const p = this.players.get(sessionId);
        p.x = movement.x;
        p.y = movement.y;
        p.isRunning = movement.isRunning;
        p.mapNum = movement.map;
    }

}

export class GameRoom extends Room<GameState> {

    onCreate(options: any): void | Promise<any> {
        console.log("GameRoom created!", options);
        this.setState(new GameState());

        this.onMessage('player_move', (client, message) => {
            this.state.movePlayer(client.sessionId, message);
        });
    }

    onJoin(client: Client) {
        client.send("hello", "world");
        this.broadcast('joined', this.state.createPlayer(client.sessionId));
    }

    onLeave(client: Client, consented?: boolean): void | Promise<any> {
        this.state.removePlayer(client.sessionId);
        this.broadcast('left', client.sessionId);
    }

}
