const ColyseusUtils = {

    colyseusClient: undefined,
    colyseusRoom: undefined,

    init: async () => {
        ColyseusUtils.colyseusClient = new Colyseus.Client('ws://localhost:3000');
        return ColyseusUtils.colyseusClient.joinOrCreate("main_room").then(rc => {
            ColyseusUtils.colyseusRoom = rc;
        });
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
            return ColyseusUtils.getPlayers().find(p => p.sessionId == sessId);
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
