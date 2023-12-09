var ColyseusUtils = {

    colyseusClient: undefined,
    colyseusRoom: undefined,
    roomsAvailable: [],
    playerCount: 0,
    abilityRechargeSeconds: 4,
    baseSolveSeconds: 15,
    forceDifficulty: undefined,
    difficulty: 0,
    skipIntro: false,
    callbacksRegistered: false,
    onUpdateRoomsCallback: (updateType, roomId, room) => {},
    onUpdateScoresCallback: (scores) => {},
    debugMode: false,

    calcSolveTime: () => {
        return ColyseusUtils.baseSolveSeconds - (0.8 * ColyseusUtils.difficulty);
    },

    eventTypes: {
        ATTACK_EVENT: 0,
        COMBAT_STARTED: 2,
        SERVER_COMBAT_STARTED: 'combat_started',
        COMBAT_ENDED: 'combat_ended',
        PLAYER_MOVE: 'player_move',
        JOIN_COMBAT: 'join_combat',
        PLAYER_EVENT: 'player_event',
        JOINED: 'joined',
        LEFT: 'left',
        ENEMY_ATTACK: 'enemy_attack',
        UPDATE_HEALTH: 'update_health',
        GAME_SV_CHANGE: 'game_sv_change',
        MAP_CHANGED: 'map_changed',
    },
    stateChangePaths: {
        PLAYERS: 'players',
        VARIABLES: 'gameSwitches',
        SWITCHES: 'gameVariables',
    },
    errorCodes: {
        DISCONNECTED: 4000,
        ROOM_DELETED: 4212,
    },

    init: async (url, skipIntro) => {
        ColyseusUtils.skipIntro = skipIntro;
        ColyseusUtils.colyseusClient = new Colyseus.Client(url);

        const client = ColyseusUtils.colyseusClient;
        const lobby = await client.joinOrCreate("lobby");

        lobby.onMessage("update_score", (scores) => {
            if (ColyseusUtils.onUpdateScoresCallback) {
                ColyseusUtils.onUpdateScoresCallback(scores);
            }
        });

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

    saveInfo: (token, name, charId, inCombat) => {
      localStorage.setItem('rtoken', JSON.stringify({token, name, charId, isInCombat: !!inCombat}));
    },
    getSavedInfo: () => {
        const token = localStorage.getItem('rtoken');
        return token && token !== 'undefined' ? JSON.parse(token) : undefined;
    },

    leaveRoom: (consented) => {
        if (ColyseusUtils.colyseusRoom) {
            if (consented) {
                ColyseusUtils.saveInfo(undefined, ColyseusUtils.getCurrentPlayer().name, false);
            }

            ColyseusUtils.colyseusRoom.leave(1001);
            ColyseusUtils.colyseusRoom = undefined;
        }
    },

    createRoomAndJoin: async (name, roomName, maxPlayers, difficulty, charId) => {
        ColyseusUtils.leaveRoom();

        const diff = parseInt(difficulty) || 0;
        const max = parseInt(maxPlayers) || 20;
        ColyseusUtils.colyseusRoom = await ColyseusUtils.colyseusClient.create('main_room', {
            name: name,
            charId: charId,
            roomName: roomName,
            maxPlayers: max > 20 ? 20 : max,
            difficulty: diff,
        });
        ColyseusUtils.saveInfo(ColyseusUtils.colyseusRoom.reconnectionToken, name, charId);
        ColyseusUtils.difficulty = diff;
    },

    joinRoom: async (name, roomId, charId) => {
        if (ColyseusUtils.colyseusRoom && roomId !== ColyseusUtils.colyseusRoom.id) {
            ColyseusUtils.leaveRoom();
        }

        ColyseusUtils.colyseusRoom = await ColyseusUtils.colyseusClient.joinById(roomId, {name, charId});
        ColyseusUtils.saveInfo(ColyseusUtils.colyseusRoom.reconnectionToken, name);
        ColyseusUtils.difficulty = parseInt(ColyseusUtils.colyseusRoom.state.difficulty) || 0;
    },

    reconnect: async (name, charId, token) => {
        if (ColyseusUtils.colyseusRoom) {
            ColyseusUtils.leaveRoom();
        }

        ColyseusUtils.colyseusRoom = await ColyseusUtils.colyseusClient.reconnect(token);
        ColyseusUtils.saveInfo(ColyseusUtils.colyseusRoom.reconnectionToken, name, charId);
    },

    disconnect: async () => {
        if (ColyseusUtils.colyseusRoom) {
            await ColyseusUtils.colyseusRoom.leave();
        }
    },

    sendMovement: (map, x, y, isRunning) => {
        ColyseusUtils.colyseusRoom.send(ColyseusUtils.eventTypes.PLAYER_MOVE, {map, x, y, isRunning});
    },

    getPlayers: (all) => {
        if (ColyseusUtils.colyseusRoom.state && ColyseusUtils.colyseusRoom.state.players) {
            const ps = [];
            ColyseusUtils.colyseusRoom.state.players.forEach((k, v) => ps.push({...k, sessionId: v}));

            if (!all) {
                ps.splice(ps.findIndex(p => p.sessionId === ColyseusUtils.colyseusRoom.sessionId), 1);
            }

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
    getEnemyHealthArr: () => {
        const curr = ColyseusUtils.getCurrentCombat();
        return curr ? curr.enemies.map(e => e.enemyHealth) : [];
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

    sendMapChanged: (oldMapId, newMapId) => {
        ColyseusUtils.colyseusRoom.send(ColyseusUtils.eventTypes.MAP_CHANGED, {oldMapId, newMapId});
    },
    onMapChanged: (cb) => {
        if (cb) {
            ColyseusUtils.colyseusRoom.onMessage(ColyseusUtils.eventTypes.MAP_CHANGED, cb);
        }
    },

    sendUpdateHealth: (val) => {
        ColyseusUtils.colyseusRoom.send(ColyseusUtils.eventTypes.UPDATE_HEALTH, val);
    },
    onHealthUpdated: (callback) => {
        if (callback) {
            ColyseusUtils.colyseusRoom.onMessage(ColyseusUtils.eventTypes.UPDATE_HEALTH, (data) => {
                if (data && data.sender && data.sender !== ColyseusUtils.colyseusRoom.sessionId) {
                    callback(data.sender, data.health || 0);
                }
            });
        }
    },
    onCombatStarted: (cb) => {
        if (cb) {
            ColyseusUtils.colyseusRoom.onMessage(ColyseusUtils.eventTypes.SERVER_COMBAT_STARTED, cb);
        }
    },
    joinCombat: () => {
      ColyseusUtils.colyseusRoom.send(ColyseusUtils.eventTypes.JOIN_COMBAT);
    },
    onPlayerJoinedCombat: (callback) => {
      ColyseusUtils.colyseusRoom.onMessage(ColyseusUtils.eventTypes.JOIN_COMBAT,
          (sessionId) => ColyseusUtils.colyseusRoom.sessionId !== sessionId && callback ? callback(sessionId) : undefined);
    },
    sendCombatEnded: (won) => {
        ColyseusUtils.colyseusRoom.send(ColyseusUtils.eventTypes.COMBAT_ENDED, won);
    },
    broadcastEvent: (type, data) => {
        ColyseusUtils.colyseusRoom.send(ColyseusUtils.eventTypes.PLAYER_EVENT, {type, data, sender: ColyseusUtils.colyseusRoom.sessionId});
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
    onPlayerMovement: (callback) => {
        if (callback) {
            ColyseusUtils.colyseusRoom.onStateChange(callback);
        }
    },
    sendGameVariableChanged: (id, value, isVariable) => {
        ColyseusUtils.colyseusRoom.send(ColyseusUtils.eventTypes.GAME_SV_CHANGE, {id, value, isVariable});
    },
    onGameVariablesChanged: (callback) => {
        if (callback) {
            ColyseusUtils.colyseusRoom.onMessage(ColyseusUtils.eventTypes.GAME_SV_CHANGE, (event) => {
                if (event && event.sender && event.sender !== ColyseusUtils.colyseusRoom.sessionId) {
                    callback(event);
                }
            });
        }
    },
    onEnemyAttack: (callback) => {
        if (callback) {
            ColyseusUtils.colyseusRoom.onMessage(ColyseusUtils.eventTypes.ENEMY_ATTACK, (event) => {
                callback(event);
            });
        }
    },
    onDisconnected: (callback) => {
        if (callback) {
          ColyseusUtils.colyseusRoom.onLeave((code) => {
              callback(code);
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
