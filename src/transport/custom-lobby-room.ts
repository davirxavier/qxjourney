import {LobbyRoom, Room} from "colyseus";

export class NoSeatReservationRoom<T> extends Room<T> {
    hasReservedSeat(sessionId: string): boolean {
        return true;
    }
}

export class NoSeatReservationLobbyRoom extends LobbyRoom {
    hasReservedSeat(sessionId: string): boolean {
        return true;
    }
}