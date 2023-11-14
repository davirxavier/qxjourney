var ColyseusUtils = {

    colyseusClient: undefined,
    colyseusRoom: undefined,
    roomsAvailable: [],
    playerCount: 0,
    abilityRechargeSeconds: 7,
    attackDamage: 10,
    specialDamage: 50,
    onUpdateRoomsCallback: (updateType, roomId, room) => {},
    debugMode: false,

    eventTypes: {
        ATTACK_EVENT: 0,
        GUARD_EVENT: 1,
        COMBAT_STARTED: 2,
        COMBAT_ENDED: 'combat_ended',
        PLAYER_MOVE: 'player_move',
        JOIN_COMBAT: 'join_combat',
        PLAYER_EVENT: 'player_event',
        JOINED: 'joined',
        LEFT: 'left',
        ENEMY_ATTACK: 'enemy_attack'
    },

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

    saveInfo: (token, name) => {
      localStorage.setItem('rtoken', JSON.stringify({token, name}));
    },
    getSavedInfo: () => {
        const token = localStorage.getItem('rtoken');
        return token && token !== 'undefined' ? JSON.parse(token) : undefined;
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
        ColyseusUtils.saveInfo(ColyseusUtils.colyseusRoom.reconnectionToken, name);
    },

    joinRoom: async (name, roomId) => {
        if (ColyseusUtils.colyseusRoom && roomId !== ColyseusUtils.colyseusRoom.id) {
            ColyseusUtils.leaveRoom();
        }

        ColyseusUtils.colyseusRoom = await ColyseusUtils.colyseusClient.joinById(roomId, {name: name});
        ColyseusUtils.saveInfo(ColyseusUtils.colyseusRoom.reconnectionToken, name);
    },

    reconnect: async (name, token) => {
        if (ColyseusUtils.colyseusRoom) {
            ColyseusUtils.leaveRoom();
        }

        ColyseusUtils.colyseusRoom = await ColyseusUtils.colyseusClient.reconnect(token);
        ColyseusUtils.saveInfo(ColyseusUtils.colyseusRoom.reconnectionToken, name);
    },

    sendMovement: (map, x, y, isRunning) => {
        ColyseusUtils.colyseusRoom.send(ColyseusUtils.eventTypes.PLAYER_MOVE, {map, x, y, isRunning});
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

    getPlayerCount: () => {
        return ColyseusUtils.getPlayers().length + 1;
    },

    getCurrentPlayer: () => {
        if (ColyseusUtils.colyseusRoom.state && ColyseusUtils.colyseusRoom.state.players) {
            return ColyseusUtils.colyseusRoom.state.players.get(ColyseusUtils.colyseusRoom.sessionId);
        } else {
            return undefined;
        }
    },

    getCurrentCombat: () => {
        if (ColyseusUtils.colyseusRoom.state && ColyseusUtils.colyseusRoom.state.combat) {
            return ColyseusUtils.colyseusRoom.state.combat;
        } else {
            return undefined;
        }
    },
    hasCombat: () => {
        const curr = ColyseusUtils.getCurrentCombat();
        return curr ? curr.ongoing : false;
    },
    getCombatTroopId: () => {
        const curr = ColyseusUtils.getCurrentCombat();
        return curr ? curr.troopId : -1;
    },
    getCurrentEnemyHealth: () => {
        const curr = ColyseusUtils.getCurrentCombat();
        return curr ? curr.enemyHealth : -1;
    },

    isPlayerInCombat: (index) => {
        const p = ColyseusUtils.getPlayers()[index];
        return p && ColyseusUtils.colyseusRoom.state &&
            ColyseusUtils.colyseusRoom.state.playersInCombat &&
            ColyseusUtils.colyseusRoom.state.playersInCombat.includes(p.sessionId);
    },
    inCombatPlayerCount: () => {
        return ColyseusUtils.colyseusRoom.state.playersInCombat.length;
    },
    isCurrentPlayerInCombat: () => {
        return ColyseusUtils.colyseusRoom.state &&
            ColyseusUtils.colyseusRoom.state.playersInCombat &&
            ColyseusUtils.colyseusRoom.state.playersInCombat.includes(ColyseusUtils.colyseusRoom.sessionId);
    },

    joinCombat: () => {
      ColyseusUtils.colyseusRoom.send(ColyseusUtils.eventTypes.JOIN_COMBAT);
    },
    onPlayerJoinedCombat: (callback) => {
      ColyseusUtils.colyseusRoom.onMessage(ColyseusUtils.eventTypes.JOIN_COMBAT,
          (sessionId) => ColyseusUtils.colyseusRoom.sessionId !== sessionId && callback ? callback(sessionId) : undefined);
    },
    sendCombatEnded: () => {
        ColyseusUtils.colyseusRoom.send(ColyseusUtils.eventTypes.COMBAT_ENDED);
    },
    broadcastEvent: (type, data) => {
        ColyseusUtils.colyseusRoom.send(ColyseusUtils.eventTypes.PLAYER_EVENT, {type, data, sender: ColyseusUtils.colyseusRoom.sessionId});
    },
    onStateChange: (callback) => {
        ColyseusUtils.colyseusRoom.onStateChange(callback);
    },
    onPlayerJoined: (callback) => {
        ColyseusUtils.colyseusRoom.onMessage(ColyseusUtils.eventTypes.JOINED, callback);
    },
    onPlayerLeft: (callback) => {
        ColyseusUtils.colyseusRoom.onMessage(ColyseusUtils.eventTypes.LEFT, callback);
    },
    onPlayerEvent: (callback) => {
        if (callback) {
          ColyseusUtils.colyseusRoom.onMessage(ColyseusUtils.eventTypes.PLAYER_EVENT, (event) => {
              if (event && event.sender && event.sender !== ColyseusUtils.colyseusRoom.sessionId) {
                  callback(event);
              }
          });
        }
    },
    onEnemyAttack: (callback) => {
        if (callback) {
            ColyseusUtils.colyseusRoom.onMessage(ColyseusUtils.eventTypes.ENEMY_ATTACK, (event) => {
                const isSpecial = event && event.isSpecial;
                callback(isSpecial);
            });
        }
    },

    removeCallback: (name, index) => {
        if (ColyseusUtils.colyseusRoom &&
            ColyseusUtils.colyseusRoom.onMessageHandlers &&
            ColyseusUtils.colyseusRoom.onMessageHandlers.events) {
            const arr = ColyseusUtils.colyseusRoom.onMessageHandlers.events[name];
            if (arr && index) {
                arr.splice(index, 1);
            } else {
                ColyseusUtils.colyseusRoom.onMessageHandlers.events[name] = undefined;
                delete ColyseusUtils.colyseusRoom.onMessageHandlers.events[name];
            }
        }
    },
};
