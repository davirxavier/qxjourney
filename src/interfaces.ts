export abstract class PartialClass<T> {
    constructor(partial?: Partial<T>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}

export class AttackEvent extends PartialClass<AttackEvent>{
    damage: number;
    skillId: number;
}

export class CombatStartedEvent extends PartialClass<CombatStartedEvent> {
    enemies: {
        enemyMaxHealth: number,
        enemyAttackInterval: number,
        basicAttacks: number[],
        specials: number[],
    }[];
    troopId: number;
}

export class GameSwitchVariableEvent extends PartialClass<GameSwitchVariableEvent> {
    id: number;
    isVariable: boolean;
    value: string | boolean;
}