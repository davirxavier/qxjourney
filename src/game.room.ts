import {ArraySchema, MapSchema, Schema, type} from "@colyseus/schema";
import {Client, Delayed, Room, updateLobby} from "colyseus";
import {Events, PlayerEvents} from "./events";
import {AttackEvent, CombatStartedEvent, GameSwitchVariableEvent} from "./interfaces";
import {randomIntFromInterval, scale} from "./utils";
import {BehaviorSubject} from "rxjs";

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
    charId = -1;

    @type("number")
    health = -1;

    @type("boolean")
    reconnecting = false;

    @type("boolean")
    isRunning = false;

}

export class Enemy extends Schema {

    @type("number")
    enemyHealth = 0;

    @type("number")
    enemyAttackInterval = 0;

    @type({array: 'number'})
    basicAttacks = new ArraySchema<number>();

    @type({array: 'number'})
    specials = new ArraySchema<number>();

    constructor(initial?: Partial<Enemy>) {
        super();
        if (initial) {
            Object.assign(this, initial);
        }
    }

}

export class Combat extends Schema {

    @type({array: Enemy})
    enemies = new ArraySchema<Enemy>();

    @type("number")
    troopId = -1;

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

    @type({map: 'boolean'})
    gameSwitches = new MapSchema<boolean>();

    @type({map: 'string'})
    gameVariables = new MapSchema<string>();

    @type('number')
    difficulty = 0;

    score = 0;

    createPlayer(sessionId: string, name: string, charId: number) {
        const p = new Player();

        p.name = name;
        p.charId = charId || 0;

        this.players.set(sessionId, p);
        return {...p, sessionId};
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
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

            this.combat.enemies.clear();
            enemyData.enemies.forEach(e => {
                const enemy = new Enemy();
                enemy.enemyHealth = e.enemyMaxHealth;
                enemy.enemyAttackInterval = e.enemyAttackInterval;
                enemy.basicAttacks.push(...e.basicAttacks);
                enemy.specials.push(...e.specials);
                this.combat.enemies.push(enemy);
            });

            this.combat.troopId = enemyData.troopId;
            this.playersInCombat.clear();
            this.playersInCombat.push(sender);
        }
    }

    endCombat() {
        this.combat.ongoing = false;
        this.combat.enemies.clear();
        this.combat.troopId = -1;
    }

    attackEnemy(damage: number): boolean {
        if (this.combat.ongoing) {
            this.combat.enemies.forEach(e => {
                e.enemyHealth -= Math.abs(damage);
            });
            return this.combat.enemies.every(e => e.enemyHealth <= 0);
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

    setSwitchOrVar(data: GameSwitchVariableEvent) {
        if (data.isVariable && typeof data.value === 'string') {
            this.gameVariables.set(data.id.toString(), data.value);
        } else if (typeof data.value === 'boolean') {
            this.gameSwitches.set(data.id.toString(), data.value);
        }
    }

}

export class GameRoom extends Room<GameState> {

    async onCreate(options: any): Promise<any> {
        this.clock.start();
        this.setState(new GameState());
        this.state.difficulty = parseInt(options.difficulty);

        this.onMessage(Events.PLAYER_MOVE, (client, message) => {
            this.state.movePlayer(client.sessionId, message);
        });
        let enemyAttackInterval: Delayed[];

        this.onMessage('player_event', (eventClient, message: {type: number, data: any, sender: string}) => {
            if (message && message.type === PlayerEvents.ATTACK) {
                const data = new AttackEvent(message.data);
                if (data.damage) {
                    this.state.score += Math.ceil(scale(data.timeUsed || 0, [0, 1], [10, 100]));
                    if (this.state.attackEnemy(data.damage)) {
                        if (enemyAttackInterval) {
                            enemyAttackInterval.forEach(i => i.clear());
                        }
                    }
                }
            } else if (message && message.type === PlayerEvents.COMBAT_STARTED) {
                const data = new CombatStartedEvent(message.data);
                if (data.enemies && data.enemies.length > 0) {
                    this.state.startCombat(data, message.sender);
                    enemyAttackInterval = [];

                    this.state.combat.enemies.forEach((e, i) => {
                        const interval = parseInt(e.enemyAttackInterval as any, 10) || 0;
                        if (interval > 0) {
                            let specialCounter = 0;
                            setTimeout(() => {
                                enemyAttackInterval[i] = this.clock.setInterval(() => {
                                    if (this.state.combat.ongoing && e.enemyHealth > 0) {
                                        const isSpecial = specialCounter >= 4;
                                        const attackArr = isSpecial ? e.specials : e.basicAttacks;

                                        this.broadcast(Events.ENEMY_ATTACK, {
                                            enemy: i,
                                            attack: attackArr[randomIntFromInterval(0, attackArr.length)],
                                            target: this.state.playersInCombat[randomIntFromInterval(0, this.state.playersInCombat.length)],
                                            isSpecial,
                                        });
                                        specialCounter = specialCounter >= 4 ? 0 : specialCounter+1;
                                    } else if (enemyAttackInterval[i]) {
                                        enemyAttackInterval[i].clear();
                                    }
                                }, (scale(this.state.difficulty, [0, 8], [interval*1000*2.2, interval*1000])) || 0);
                            }, scale(this.state.difficulty, [0, 8], [5000, 0]));
                        }
                    });
                }
            }

            this.clock.setTimeout(() => this.broadcast('player_event', message), 5);
        });

        this.onMessage(Events.JOIN_COMBAT, (client) => {
            this.state.joinCombat(client.sessionId);
            this.broadcast(Events.JOIN_COMBAT, client.sessionId);
        });

        this.onMessage(Events.COMBAT_ENDED, (client, won) => {
            if (won) {
                this.state.endCombat();
                this.broadcast(Events.COMBAT_ENDED);
            } else {
                this.disconnect(PlayerEvents.GAME_OVER);
            }
        })

        this.onMessage(Events.UPDATE_HEALTH, (client, health: number) => {
            this.state.updateHealth(client.sessionId, health);
        });

        this.onMessage(Events.GAME_SV_CHANGE, (client, data: GameSwitchVariableEvent) => {
            if (data && data.id) {
                this.state.setSwitchOrVar(data);
                this.broadcast(Events.GAME_SV_CHANGE, {sender: client.sessionId, data: data});
            }
        });

        this.maxClients = parseInt(options.maxPlayers, 10) || 99;
        this.setMetadata({
            roomName: options.roomName,
        }).then(() => updateLobby(this));
    }

    async onJoin(client: Client, options): Promise<any> {
        client.send(Events.EVENT_LIST, ({...Events}));
        this.broadcast(Events.PLAYER_JOINED, this.state.createPlayer(client.sessionId, options.name, parseInt(options.charId) || 0));
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
