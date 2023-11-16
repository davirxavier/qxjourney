import {ArraySchema, MapSchema, Schema, type} from "@colyseus/schema";
import {Client, Delayed, Room, updateLobby} from "colyseus";
import {Events, PlayerEvents} from "./events";
import {AttackEvent, CombatStartedEvent} from "./interfaces";

export class Player extends Schema {

    @type("string")
    name = "Anônimo";

    @type("number")
    mapNum = 0;

    @type("number")
    x = -1;

    @type("number")
    y = 1;

    @type("number")
    playerSprite = -1;

    @type("number")
    health = -1;

    @type("boolean")
    reconnecting = false;

    @type("boolean")
    isRunning = false;

}

export class Combat extends Schema {

    @type("number")
    enemyHealth = 0;

    @type("number")
    enemyAttackInterval = 0;

    @type("number")
    troopId = 0;

    @type("boolean")
    ongoing = false;

}

export class GameState extends Schema {

    @type({ map: Player })
    players = new MapSchema<Player>();

    @type(Combat)
    combat = new Combat();

    @type({array: 'string'})
    playersInCombat = new ArraySchema<string>();

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
        this.playersInCombat.splice(this.playersInCombat.indexOf(sessionId), 1);
    }

    movePlayer(sessionId: string, movement: {map: number, x: number, y: number, isRunning: boolean}) {
        const p = this.players.get(sessionId);
        p.x = movement.x;
        p.y = movement.y;
        p.isRunning = movement.isRunning;
        p.mapNum = movement.map;
    }

    startCombat(enemyData: CombatStartedEvent, sender: string) {
        if (!this.combat.ongoing) {
            this.combat.ongoing = true;
            this.combat.enemyHealth = enemyData.enemyMaxHealth;
            this.combat.enemyAttackInterval = enemyData.enemyAttackInterval;
            this.playersInCombat.clear();
            this.playersInCombat.push(sender);
        }
    }

    endCombat() {
        this.combat.ongoing = false;
        this.combat.enemyHealth = 0;
        this.combat.enemyAttackInterval = 0;
        this.combat.troopId = 0;
    }

    attackEnemy(damage: number): boolean {
        if (this.combat.ongoing) {
            this.combat.enemyHealth -= Math.abs(damage);
            if (this.combat.enemyHealth <= 0) {
                this.combat.enemyHealth = 0;
                return true;
            }
            return false;
        }
        return false;
    }

    joinCombat(sessionId: string) {
        if (!this.playersInCombat.includes(sessionId)) {
            this.playersInCombat.push(sessionId);
        }
    }

    updateHealth(sessionId: string, health: number) {
        const p = this.players.get(sessionId);
        if (p) {
            p.health = health;
        }
    }

}

export class GameRoom extends Room<GameState> {

    async onCreate(options: any): Promise<any> {
        this.clock.start();
        this.setState(new GameState());

        this.onMessage(Events.PLAYER_MOVE, (client, message) => {
            this.state.movePlayer(client.sessionId, message);
        });
        let enemyAttackInterval: Delayed;

        this.onMessage('player_event', (eventClient, message: {type: number, data: any, sender: string}) => {
            if (message && message.type === PlayerEvents.ATTACK) {
                const data = new AttackEvent(message.data);
                if (data.damage) {
                    if (this.state.attackEnemy(data.damage)) {
                        if (enemyAttackInterval) {
                            enemyAttackInterval.clear();
                        }
                    }
                }
            } else if (message && message.type === PlayerEvents.COMBAT_STARTED) {
                const data = new CombatStartedEvent(message.data);
                if (data.enemyMaxHealth) {
                    this.state.startCombat(data, message.sender);

                    const interval = parseInt(data.enemyAttackInterval as any, 10) || 0;
                    if (interval > 0) {
                        this.clock.setTimeout(() => {
                            let specialCounter = 0;
                            enemyAttackInterval = this.clock.setInterval(() => {
                                if (this.state.combat.ongoing && this.state.combat.enemyHealth > 0) {
                                    this.broadcast(Events.ENEMY_ATTACK, {isSpecial: specialCounter >= 4});
                                    specialCounter = specialCounter >= 4 ? 0 : specialCounter+1;
                                } else if (enemyAttackInterval) {
                                    enemyAttackInterval.clear();
                                }
                            }, (interval * 1000) || 0);
                        }, 20);
                    }
                }
            }

            this.clock.setTimeout(() => this.broadcast('player_event', message), 5);
        });

        this.onMessage(Events.JOIN_COMBAT, (client) => {
            this.state.joinCombat(client.sessionId);
            this.broadcast(Events.JOIN_COMBAT, client.sessionId);
        });

        this.onMessage(Events.COMBAT_ENDED, () => {
            this.state.endCombat();
            this.broadcast(Events.COMBAT_ENDED);
        })

        this.onMessage(Events.UPDATE_HEALTH, (client, health: number) => {
            this.state.updateHealth(client.sessionId, health);
        });

        this.maxClients = parseInt(options.maxPlayers, 10) || 99;
        this.setMetadata({
            roomName: options.roomName
        }).then(() => updateLobby(this));
    }

    async onJoin(client: Client, options): Promise<any> {
        client.send(Events.EVENT_LIST, ({...Events}));
        this.broadcast(Events.PLAYER_JOINED, this.state.createPlayer(client.sessionId, options.name));
    }

    async removePlayer(sessionId: string) {
        this.state.removePlayer(sessionId);
        this.broadcast(Events.PLAYER_LEFT, sessionId);
    }

    async onLeave(client: Client, consented?: boolean): Promise<any> {
        if (consented) {
            await this.removePlayer(client.sessionId);
        }
        else {
            const p = this.state.players.get(client.sessionId);
            if (p) {
                p.reconnecting = true;
                this.broadcast(Events.PLAYER_RECONNECTING, client.sessionId);

                try {
                    await this.allowReconnection(client, 300);
                    p.reconnecting = false;
                    this.broadcast(Events.PLAYER_RECONNECTED, client.sessionId);
                } catch (e) {
                    await this.removePlayer(client.sessionId);
                }
            }
        }
    }

}
