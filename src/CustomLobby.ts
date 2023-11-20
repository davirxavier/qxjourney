import {Client, Delayed, LobbyRoom} from "colyseus";

import { matchMaker } from "colyseus";

export class CustomLobby extends LobbyRoom {

    clientIntervals: {[id: string]: Delayed} = {};

    async onCreate(options: any) {
        await super.onCreate(options);
    }

    async onJoin(client: Client, options: any) {
        await super.onJoin(client, options);
        this.clientIntervals[client.sessionId] = this.clock.setInterval(() => {
            const scores = {};
            for (const r of this.rooms) {
                scores[r.roomId] = matchMaker.getRoomById(r.roomId)?.state.score;
            }
            client.send('update_score', scores);
        }, 2000);
    }

    async onLeave(client: Client) {
        await super.onLeave(client);
        if (this.clientIntervals[client.sessionId]) {
            this.clientIntervals[client.sessionId].clear();
        }
    }
}