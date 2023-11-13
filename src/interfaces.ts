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
    enemyMaxHealth: number;
    enemyAttackInterval: number;
    troopId: number;
}