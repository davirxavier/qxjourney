import {MapSchema, Schema, type} from "@colyseus/schema";
import {Client, Room} from "colyseus";

export class Player extends Schema {
    @type("number")
    x = Math.floor(Math.random() * 400);

    @type("number")
    y = Math.floor(Math.random() * 400);
}

export class GameState extends Schema {

    @type({ map: Player })
    players = new MapSchema<Player>();

    something = "This attribute won't be sent to the client-side";

    createPlayer(sessionId: string) {
        this.players.set(sessionId, new Player());
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    movePlayer (sessionId: string, movement: any) {
        if (movement.x) {
            this.players.get(sessionId).x += movement.x * 10;

        } else if (movement.y) {
            this.players.get(sessionId).y += movement.y * 10;
        }
    }

}

export class GameRoom extends Room<GameState> {

    onCreate(options: any): void | Promise<any> {
        console.log("GameRoom created!", options);
        this.setState(new GameState());

        this.onMessage('test', () => {
            this.state.createPlayer('23434324tysfsdjsdfhiudfs' + Math.random());
        });
    }

    onJoin(client: Client) {
        client.send("hello", "world");
        this.state.createPlayer(client.sessionId);
    }

}
