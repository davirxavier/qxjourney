var ColyseusUtils = {

    colyseusClient: undefined,
    colyseusRoom: undefined,
    roomsAvailable: [],
    onUpdateRoomsCallback: (updateType, roomId, room) => {},

    init: async (url) => {
        ColyseusUtils.colyseusClient = new Colyseus.Client(url);

        const client = ColyseusUtils.colyseusClient;
        const lobby = await client.joinOrCreate("lobby");

        lobby.onMessage("rooms", (rooms) => {
            ColyseusUtils.roomsAvailable = rooms;

            if (ColyseusUtils.onUpdateRoomsCallback) {
                ColyseusUtils.onUpdateRoomsCallback("a");
            }
        });

        lobby.onMessage("+", ([roomId, room]) => {
            const allRooms = ColyseusUtils.roomsAvailable;

            const roomIndex = allRooms.findIndex((room) => room.roomId === roomId);
            if (roomIndex !== -1) {
                allRooms[roomIndex] = room;
            } else {
                allRooms.push(room);
            }

            if (ColyseusUtils.onUpdateRoomsCallback) {
                ColyseusUtils.onUpdateRoomsCallback("+", roomId, room);
            }
        });

        lobby.onMessage("-", (roomId) => {
            ColyseusUtils.roomsAvailable = ColyseusUtils.roomsAvailable.filter((room) => room.roomId !== roomId);

            if (ColyseusUtils.onUpdateRoomsCallback) {
                ColyseusUtils.onUpdateRoomsCallback("-", roomId);
            }
        });
    },

    leaveRoom: () => {
        if (ColyseusUtils.colyseusRoom) {
            ColyseusUtils.colyseusRoom.leave(1001);
            ColyseusUtils.colyseusRoom = undefined;
        }
    },

    createRoomAndJoin: async (name, roomName, maxPlayers) => {
        ColyseusUtils.leaveRoom();

        ColyseusUtils.colyseusRoom = await ColyseusUtils.colyseusClient.create('main_room', {
            name: name,
            roomName: roomName,
            maxPlayers: maxPlayers
        });
    },

    joinRoom: async (name, roomId) => {
        if (ColyseusUtils.colyseusRoom && roomId !== ColyseusUtils.colyseusRoom.id) {
            ColyseusUtils.leaveRoom();
        }

        ColyseusUtils.colyseusRoom = await ColyseusUtils.colyseusClient.joinById(roomId, {name: name});
    },

    sendMovement: (map, x, y, isRunning) => {
        ColyseusUtils.colyseusRoom.send('player_move', {map, x, y, isRunning});
    },

    getPlayers: () => {
        if (ColyseusUtils.colyseusRoom.state && ColyseusUtils.colyseusRoom.state.players) {
            const ps = [];
            ColyseusUtils.colyseusRoom.state.players.forEach((k, v) => ps.push({...k, sessionId: v}));
            ps.splice(ps.findIndex(p => p.sessionId === ColyseusUtils.colyseusRoom.sessionId), 1);
            ps.sort((p1, p2) => p1.sessionId.localeCompare(p2.sessionId));
            return ps;
        } else {
            return [];
        }
    },

    getPlayer: (sessId) => {
        if (ColyseusUtils.colyseusRoom.state && ColyseusUtils.colyseusRoom.state.players) {
            return ColyseusUtils.getPlayers().find(p => p.sessionId === sessId);
        } else {
            return undefined;
        }
    },

    onStateChange: (callback) => {
        ColyseusUtils.colyseusRoom.onStateChange(callback);
    },

    onPlayerJoined: (callback) => {
        ColyseusUtils.colyseusRoom.onMessage('joined', callback);
    },
    onPlayerLeft: (callback) => {
        ColyseusUtils.colyseusRoom.onMessage('left', callback);
    }
};
