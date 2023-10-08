import {LobbyRoom} from "colyseus";

export class CustomLobbyRoom extends LobbyRoom{
    hasReservedSeat(sessionId: string): boolean {
        return true;
    }
}