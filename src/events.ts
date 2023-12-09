export const Events = {
    PLAYER_MOVE: 'player_move',
    PLAYER_JOINED: 'joined',
    PLAYER_LEFT: 'left',
    PLAYER_RECONNECTING: 'player_reconnecting',
    PLAYER_RECONNECTED: 'player_reconnected',
    EVENT_LIST: 'list',
    COMBAT_ENDED: 'combat_ended',
    ENEMY_ATTACK: 'enemy_attack',
    JOIN_COMBAT: 'join_combat',
    UPDATE_HEALTH: 'update_health',
    GAME_SV_CHANGE: 'game_sv_change',
    MAP_CHANGED: 'map_changed',
    COMBAT_STARTED: 'combat_started',
};

export const PlayerEvents = {
    ATTACK: 0,
    GUARD: 1,
    COMBAT_STARTED: 2,
    GAME_OVER: 1501,
};