(() => {
    const uiStorage = {
        switches: {
            abilityRechargeShow0: 72,
            abilityRechargeShow1: 73,
            abilityRechargeShow2: 74,
            answersShow: 77,
            screenMessage: 501,
            showPlayer0: 21,
            showPlayer1: 22,
            showPlayer2: 23,
            showPlayer3: 24,
            showPlayer4: 25,
            showPlayer5: 26,
            showPlayer6: 27,
            showPlayer7: 28,
            showPlayer8: 29,
            showPlayer9: 30,
            showPlayer10: 31,
            showPlayer11: 32,
            showPlayer12: 33,
            showPlayer13: 34,
            showPlayer14: 35,
            showPlayer15: 36,
            showPlayer16: 37,
            showPlayer17: 38,
            showPlayer18: 39,
            showPlayer19: 40,
            showPlayer20: 41,
            showPlayer21: 42,
            showPlayer22: 43,
            showPlayer23: 44,
            showPlayer24: 45,
            showPlayer25: 46,
            showPlayer26: 47,
            showPlayer27: 48,
            showPlayer28: 49,
            showPlayer29: 50,
            showPlayer30: 51,
            showPlayer31: 52,
            showPlayer32: 53,
            showPlayer33: 54,
            showPlayer34: 55,
            showPlayer35: 56,
            showPlayer36: 57,
            showPlayer37: 58,
            showPlayer38: 59,
            showPlayer39: 60,
            showPlayer40: 61,
            showPlayer41: 62,
            showPlayer42: 63,
            showPlayer43: 64,
            showPlayer44: 65,
            showPlayer45: 66,
            showPlayer46: 67,
            showPlayer47: 68,
            showPlayer48: 69,
            showPlayer49: 70,
            showPlayerCombat0: 81,
            showPlayerCombat49: 130,
        },
        variables: {
            screenMessage: 501,
            questionText: 521,
            answerText0: 522,
            answerText1: 523,
            answerText2: 524,
            answerText3: 525,
            questionGaugeValue: 530,
            playerName0: 21,
            playerName1: 22,
            playerName2: 23,
            playerName3: 24,
            playerName4: 25,
            playerName5: 26,
            playerName6: 27,
            playerName7: 28,
            playerName8: 29,
            playerName9: 30,
            playerName10: 31,
            playerName11: 32,
            playerName12: 33,
            playerName13: 34,
            playerName14: 35,
            playerName15: 36,
            playerName16: 37,
            playerName17: 38,
            playerName18: 39,
            playerName19: 40,
            playerName20: 41,
            playerName21: 42,
            playerName22: 43,
            playerName23: 44,
            playerName24: 45,
            playerName25: 46,
            playerName26: 47,
            playerName27: 48,
            playerName28: 49,
            playerName29: 50,
            playerName30: 51,
            playerName31: 52,
            playerName32: 53,
            playerName33: 54,
            playerName34: 55,
            playerName35: 56,
            playerName36: 57,
            playerName37: 58,
            playerName38: 59,
            playerName39: 60,
            playerName40: 61,
            playerName41: 62,
            playerName42: 63,
            playerName43: 64,
            playerName44: 65,
            playerName45: 66,
            playerName46: 67,
            playerName47: 68,
            playerName48: 69,
            playerName49: 70,
        }
    };

    function MathGenerator() {
        throw new Error("This is a static class");
    }

    MathGenerator.init = function () {
    }

    MathGenerator.randomIntFromInterval = function (min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    MathGenerator.genAlternatives = function (result) {
        const ret = [];
        for (let i = 0; i < 4; i++) {
            let counter = 0;
            let random = this.randomIntFromInterval(0, (result === 0 || result <= 4 ? 5 : result)*2);
            while ((random === result || ret.includes(random)) && counter < 1000) {
                counter++;
                random = this.randomIntFromInterval(0, (result === 0 || result <= 4 ? 5 : result)*2);
            }
            ret.push(random);
        }
        const resultIndex = this.randomIntFromInterval(0, 3);
        ret[resultIndex] = result;
        return [ret, resultIndex];
    }

    MathGenerator.gen1 = function () {
        const op1 = this.randomIntFromInterval(0, 10);
        const op2 = this.randomIntFromInterval(0, 10);

        const alternatives = this.genAlternatives(op1+op2);
        return {operands: [op1, '+', op2], result: op1+op2, alternatives: alternatives[0], correctAlternative: alternatives[1]};
    }

    MathGenerator.gen2 = function () {
        let op1 = this.randomIntFromInterval(0, 10);
        let op2 = this.randomIntFromInterval(0, 10);

        if (op2 > op1) {
            const temp = op1;
            op1 = op2
            op2 = temp;
        }

        const alternatives = this.genAlternatives(op1-op2);
        return {operands: [op1, '-', op2], result: op1-op2, alternatives: alternatives[0], correctAlternative: alternatives[1]};
    }

    MathGenerator.gen3 = function () {
        const op1 = this.randomIntFromInterval(0, 10);
        const op2 = this.randomIntFromInterval(0, 10);

        const alternatives = this.genAlternatives(op1*op2);
        return {operands: [op1, '*', op2], result: op1*op2, alternatives: alternatives[0], correctAlternative: alternatives[1]};
    }

    //=============================================================================
    // General
    //=============================================================================

    Scene_Boot.prototype.startNormalGame = function() {
        this._transferred = false;
        const currentPlayer = ColyseusUtils.getCurrentPlayer();
        if (currentPlayer.x !== -1 && currentPlayer.y !== -1) {
            $dataSystem.startX = currentPlayer.x;
            $dataSystem.startY = currentPlayer.y;
        }

        this.checkPlayerLocation();
        DataManager.setupNewGame();
        $gameSystem.disableMenu();

        $gameVariables.setValue(uiStorage.variables.playerName49, ColyseusUtils.getCurrentPlayer().name);
        $gameSwitches.setValue(uiStorage.switches.showPlayer49, true);

        for (let i = 0; i < 50; i++) {
            $gameSwitches.setValue(uiStorage.switches.showPlayerCombat0+i, false);
        }
        $gameSwitches.setValue(uiStorage.switches.showPlayerCombat49, true);

        if (ColyseusUtils.debugMode) {
            for (let i = 0; i < 25; i++) {
                $gameSwitches.setValue(uiStorage.switches.showPlayer0+i, true);
            }
        }

        SceneManager.goto(Scene_Map);
    };

    const _SceneManager_onSceneStart = SceneManager.onSceneStart;
    SceneManager.onSceneStart = function () {
        _SceneManager_onSceneStart.apply(this, arguments);

        $gamePlayer._followers.updateFollowerInfo();
        if (!this._registerCallbacks) {
            ColyseusUtils.onPlayerMovement(() => {
                $gamePlayer._followers.updateFollowerInfo();
            });
            ColyseusUtils.onGameVariablesChanged((event) => {
                if (event && event.data && event.data.isVariable) {
                    $gameVariables.setValue(event.data.id, event.data.value);
                    $gameVariables.onChange();
                } else if (event && event.data && !event.data.isVariable) {
                    $gameSwitches.setValue(event.data.id, !!event.data.value);
                    $gameSwitches.onChange();
                }
            });

            this._registerCallbacks = true;
        }

        if (SceneManager._scene instanceof Scene_Map &&
            ColyseusUtils.hasCombat() && ColyseusUtils.isCurrentPlayerInCombat()) {
            const troopId = ColyseusUtils.getCombatTroopId();
            if (troopId !== -1) {
                BattleManager.setup(ColyseusUtils.getCombatTroopId(), false, false);
                $gamePlayer.makeEncounterCount();
                SceneManager.push(Scene_Battle);
            }
        }

        if (ColyseusUtils.debugMap && !this._transferred) {
            this._transferred = true;
            $gamePlayer.reserveTransfer(ColyseusUtils.debugMap, 0, 0, 0, 0);
            let interval = setInterval(() => {
                if (!$gamePlayer.isTransferring()) {
                    const spawn = DataManager.getEventByName('SPAWN');
                    if (spawn) {
                        $gamePlayer.locate(spawn.x, spawn.y);
                    }
                    clearInterval(interval);
                }
            }, 50);
        }
    }

    const _Game_Switches_setValue = Game_Switches.prototype.setValue;
    Game_Switches.prototype.setValue = function (switchId, value) {
        _Game_Switches_setValue.apply(this, arguments);

        if (switchId > 0 && switchId < $dataSystem.switches.length) {
            ColyseusUtils.sendGameVariableChanged(switchId, value, false);
        }
    }

    const _Game_Variables_setValue = Game_Variables.prototype.setValue;
    Game_Variables.prototype.setValue = function (variableId, value) {
        _Game_Variables_setValue.apply(this, arguments);

        if (variableId > 0 && variableId < $dataSystem.variables.length) {
            ColyseusUtils.sendGameVariableChanged(variableId, value, true);
        }
    }

    Scene_Gameover.prototype.update = function() {
        if (this.isActive() && !this.isBusy() && this.isTriggered()) {
            ColyseusUtils.leaveRoom(true);
        }
        Scene_Base.prototype.update.call(this);
    };

    DataManager.getEventByName = (name) => {
        return $dataMap.events.find(e => e && e.name == name);
    };

    SceneManager.isGameActive = function() {
        return true;
    };

    //=============================================================================
    // Battle
    //=============================================================================

    const _BattleManager_setup = BattleManager.setup;
    BattleManager.setup = function (troopId) {
        _BattleManager_setup.apply(this, arguments);

        this._calledBattleEnded = false;
        this._actionQueue = [];
        this._doingActionFromQueue = false;

        const enemy = $gameTroop._enemies[0];
        if (ColyseusUtils.hasCombat()) {
            const health = ColyseusUtils.getCurrentEnemyHealth();
            enemy.setHp(health);
            ColyseusUtils.joinCombat();
        } else {
            ColyseusUtils.broadcastEvent(ColyseusUtils.eventTypes.COMBAT_STARTED, {enemyMaxHealth: enemy.hp, enemyAttackInterval: enemy._colyseusAttackInterval, troopId});
        }
        ColyseusUtils.saveInfo(ColyseusUtils.colyseusRoom.reconnectionToken, ColyseusUtils.getCurrentPlayer().name, true);
    }

    BattleManager.cleanMultiplayer = function () {
        ColyseusUtils.removeCallback(ColyseusUtils.eventTypes.JOIN_COMBAT);
        ColyseusUtils.removeCallback(ColyseusUtils.eventTypes.PLAYER_EVENT);
        ColyseusUtils.removeCallback(ColyseusUtils.eventTypes.ENEMY_ATTACK);
        ColyseusUtils.saveInfo(ColyseusUtils.colyseusRoom.reconnectionToken, ColyseusUtils.getCurrentPlayer().name, false);

        for (let i = 0; i < 49; i++) {
            $gameSwitches.setValue(uiStorage.switches.showPlayerCombat0+i, false);
        }

        $gameParty.allMembers().forEach(m => {
            m.revive();
            m.gainHp(9999999);
        });

        if (!this._calledBattleEnded) {
            ColyseusUtils.sendCombatEnded();
            this._calledBattleEnded = true;
        }
    };

    const _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function () {
        _BattleManager_endBattle.apply(this, arguments);
        this.cleanMultiplayer();
    }

    const _BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function () {
        _BattleManager_endAction.apply(this, arguments);
        this._doingActionFromQueue = false;
        this.startCustomAction(this._actionQueue.shift(), true);
    }

    const actionsByType = {
        a: {
            event: ColyseusUtils.eventTypes.ATTACK_EVENT,
            setAction: (action, skillId) => skillId ? action.setSkill(skillId) : action.setAttack(),
        },
        g: {
            event: ColyseusUtils.eventTypes.ATTACK_EVENT,
            setAction: (action) => action.setGuard(),
        },
    };

    BattleManager.startCustomAction = function (actionData, force) {
        if (!actionData) {
            return;
        }

        if (force || !this._doingActionFromQueue) {
            this._doingActionFromQueue = true;
            const actionKey = actionData.actionKey;
            const actionDoer = actionData.actionDoer;
            const skillId = actionData.skillId;
            const enemy = actionData.enemy;
            BattleManager._currentActor = actionData.battler;

            const actionByType = actionsByType[actionKey];
            const action = new Game_Action(actionDoer, true);
            actionByType.setAction(action, skillId);
            const damage = action.makeDamageValue($gameTroop._enemies[0]);

            actionDoer._actions = [];
            actionDoer.setAction(0, action);

            if (actionKey === 'g') {
                actionDoer.setGuarding(true);
            }

            if (enemy) {
                action._isEnemyAttack = true;
            }

            BattleManager._subject = actionData.actionDoer;
            BattleManager.startAction();
            actionDoer._actions = [];

            if (!actionData.omitEvent) {
                ColyseusUtils.broadcastEvent(actionByType.event, {skillId: actionData.skillId, damage: damage, isGuard: actionKey === 'g'});
            }
        } else {
            this._actionQueue.push(actionData);
        }
    }

    Game_Action.prototype.isCertainHit = function() {
        // return this.item().hitType === Game_Action.HITTYPE_CERTAIN;
        return true;
    };

    Game_Party.prototype.maxBattleMembers = function() {
        return ColyseusUtils.debugMode ? 25 : ColyseusUtils.inCombatPlayerCount();
    };

    Game_Troop.prototype.setup = function(troopId) {
        this.clear();
        this._troopId = troopId;
        this._enemies = [];
        for (const member of this.troop().members) {
            if ($dataEnemies[member.enemyId]) {
                const enemyId = member.enemyId;
                const x = member.x;
                const y = member.y;
                const enemy = new Game_Enemy(enemyId, x, y);

                if ($dataEnemies[member.enemyId].meta && $dataEnemies[member.enemyId].meta.AttackInterval) {
                    enemy._colyseusAttackInterval = parseInt($dataEnemies[member.enemyId].meta.AttackInterval, 10) || 10;
                } else {
                    enemy._colyseusAttackInterval = 10;
                }

                if ($dataEnemies[member.enemyId].meta && $dataEnemies[member.enemyId].meta.SpecialAttack) {
                    enemy._colyseusSpecialAttack = parseInt($dataEnemies[member.enemyId].meta.SpecialAttack, 10) || 240;
                }

                if (member.hidden) {
                    enemy.hide();
                }
                this._enemies.push(enemy);
            }
        }
        this.makeUniqueNames();
    };

    const _Scene_Battle_initialize = Scene_Battle.prototype.initialize;
    Scene_Battle.prototype.initialize = function () {
        _Scene_Battle_initialize.apply(this, arguments);
    }

    const _Scene_Battle_stop = Scene_Battle.prototype.stop;
    Scene_Battle.prototype.stop = function () {
        _Scene_Battle_stop.apply(this, arguments);
        BattleManager.cleanMultiplayer();
    }

    const _Scene_Battle_terminate = Scene_Battle.prototype.terminate;
    Scene_Battle.prototype.terminate = function () {
        _Scene_Battle_terminate.apply(this, arguments);
        BattleManager.cleanMultiplayer();
    }

    Scene_Battle.prototype.updateCancelButton = function() {
        if (this._cancelButton) {
            this._cancelButton.visible = false;
        }
    };

    const _Scene_Battle_createSpriteset = Scene_Battle.prototype.createSpriteset;
    Scene_Battle.prototype.createSpriteset = function () {
        _Scene_Battle_createSpriteset.apply(this, arguments);

        let spritesSliced = this._spriteset._actorSprites.slice(1);
        $gameVariables.setValue(uiStorage.variables.questionGaugeValue, 100);

        for (let i = 0; i < ColyseusUtils.inCombatPlayerCount()-1; i++) {
            $gameSwitches.setValue(uiStorage.switches.showPlayerCombat0+i, true);
        }

        ColyseusUtils.onPlayerLeft((sess) => {
            const index = ColyseusUtils.getPlayers().findIndex(saved => saved.sessionId === sess);
            if (index >= 0) {
                this._spriteset.removeActor(index);
                spritesSliced = this._spriteset._actorSprites.slice(1);
                $gameSwitches.setValue(uiStorage.switches.showPlayerCombat0+index, false);
            }
        });

        ColyseusUtils.onPlayerJoinedCombat((sessionId) => {
            const index = ColyseusUtils.getPlayers().findIndex(p => p.sessionId === sessionId);
            if (index >= 0) {
                this._spriteset.createNewActor();
                spritesSliced = this._spriteset._actorSprites.slice(1);
                $gameSwitches.setValue(uiStorage.switches.showPlayerCombat0+ColyseusUtils.getPlayers().findIndex(p2 => p2.sessionId === sessionId), true);
            }
        });

        ColyseusUtils.onPlayerEvent(event => {
            if (event.type === ColyseusUtils.eventTypes.ATTACK_EVENT) {
                const battlerIndex = ColyseusUtils.getPlayers().findIndex(p => p.sessionId === event.sender);
                if (battlerIndex >= 0) {
                    this.doAction($gameParty.battleMembers()[battlerIndex+1],
                        event.data && event.data.isGuard ? 'g' : 'a',
                        event.data ? event.data.skillId : undefined,
                        true);
                }
            }
        });

        ColyseusUtils.onEnemyAttack((isSpecial) => {
            if (ColyseusUtils.getCurrentEnemyHealth() > 0) {
                const enemy = $gameTroop._enemies[0];
                this.doAction($gameParty.battleMembers()[0], 'a', isSpecial ? enemy._colyseusSpecialAttack : 240, true, enemy);

                if (this._currentRechargingActionType === 'g' && !this._isAnsweringMath) {
                    [this._attackButton, this._guardButton, this._specialButton].forEach(b => b.visible = true);
                }
            }
        });
    };

    const _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function () {
        _Scene_Battle_createAllWindows.apply(this, arguments);
        this.createCustomButtons();
    }

    const _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function () {
        _Scene_Battle_update.apply(this, arguments);

        if (this._isRechargingButtons) {
            this._buttonsRechargeVal -= 1.66 / ColyseusUtils.abilityRechargeSeconds / (this._currentRechargingActionType === 's' ? 3 : 1);
            this._attackButton.setValue(this._buttonsRechargeVal);
            this._guardButton.setValue(this._buttonsRechargeVal);
            this._specialButton.setValue(this._buttonsRechargeVal);

            if (this._buttonsRechargeVal <= 0) {
                this._buttonsRechargeVal = 100;
                this._isRechargingButtons = false;
                this.setRechargingActions(false, this._currentRechargingActionType);
                this._attackButton.setValue(this._buttonsRechargeVal);
                this._guardButton.setValue(this._buttonsRechargeVal);
                this._specialButton.setValue(this._buttonsRechargeVal);
            }
        }

        if (this._isAnsweringMath) {
            this._mathAnswerVal -= 1.66 / ColyseusUtils.questionSolveSeconds;
            $gameVariables.setValue(uiStorage.variables.questionGaugeValue, this._mathAnswerVal);

            if (this._mathAnswerVal <= 0 || this._answered) {
                $gameSwitches.setValue(uiStorage.switches.answersShow, false);
                $gameVariables.setValue(uiStorage.variables.questionGaugeValue, 100);

                if (this._currentRechargingActionType !== 'g') {
                    [this._attackButton, this._guardButton, this._specialButton].forEach(b => b.visible = true);
                }

                if (this._answeredCorrectly) {
                    this.doAction($gameParty.battleMembers()[0], this._currentRechargingActionType, this._currentRechargingSkillId);
                } else {
                    Object.keys(switchByButton).forEach(k => $gameSwitches.setValue(switchByButton[k], false));
                }

                this._isAnsweringMath = false;
                this._answeredCorrectly = false;
                this._answered = false;
            }
        }
    }

    Scene_Battle.prototype.createCustomButtons = function () {
        this._attackButton = new Sprite_Action_Button("attack");
        this._attackButton.x = (Graphics.boxWidth / 3) + 12 - this._attackButton.width*2;
        this._attackButton.y = Graphics.boxHeight - this._attackButton.height - 8;
        this._attackButton.setValue(100);
        this.addWindow(this._attackButton);

        this._guardButton = new Sprite_Action_Button("guard");
        this._guardButton.x = (Graphics.boxWidth / 3 * 2) + 12 - this._guardButton.width*2;
        this._guardButton.y = Graphics.boxHeight - this._guardButton.height - 8;
        this._guardButton.setValue(100);
        this.addWindow(this._guardButton);

        this._specialButton = new Sprite_Action_Button("special");
        this._specialButton.x = Graphics.boxWidth + 12 - this._specialButton.width*2;
        this._specialButton.y = Graphics.boxHeight - this._specialButton.height - 8;
        this._specialButton.setValue(100);
        this.addWindow(this._specialButton);

        this._attackButton.setClickHandler(this.handleActionButton.bind(this, 'a'));
        this._guardButton.setClickHandler(this.handleActionButton.bind(this, 'g'));
        this._specialButton.setClickHandler(this.handleActionButton.bind(this, 'a', $gameParty.battleMembers()[0].skills()[0].id));

        this._answerButtons = [];
        const pos = [58, 270, 450, 630];
        for (let i = 0; i < 4; i++) {
            const btn = new Sprite_Action_Button("empty");
            btn.shouldUpdateOpacity(false);
            btn.x = pos[i];
            btn.y = 502;
            btn.opacity = 0;
            this.addWindow(btn);
            this._answerButtons.push(btn);
        }
    }

    Scene_Battle.prototype.handleActionButton = function (type, skillId) {
        if (!this._isRechargingButtons) {
            this._buttonsRechargeVal = 100;
            this._currentRechargingActionType = type;
            this._currentRechargingSkillId = skillId;

            if (type !== 'g') {
                this.setRechargingActions(true, type);
            }
            $gameSwitches.setValue(uiStorage.switches.answersShow, true);

            let mathOperation;
            if (type === 'a' && skillId) {
                mathOperation = MathGenerator.gen3();
            } else if (type === 'a') {
                mathOperation = MathGenerator.gen1();
            } else {
                mathOperation = MathGenerator.gen2();
            }

            $gameVariables.setValue(uiStorage.variables.questionText, mathOperation.operands.join(' '));
            $gameVariables.setValue(uiStorage.variables.answerText0, mathOperation.alternatives[0]);
            $gameVariables.setValue(uiStorage.variables.answerText1, mathOperation.alternatives[1]);
            $gameVariables.setValue(uiStorage.variables.answerText2, mathOperation.alternatives[2]);
            $gameVariables.setValue(uiStorage.variables.answerText3, mathOperation.alternatives[3]);

            this._attackButton.visible = false;
            this._guardButton.visible = false;
            this._specialButton.visible = false;

            this._isAnsweringMath = true;
            this._mathAnswerVal = 110;
            $gameVariables.setValue(uiStorage.variables.questionGaugeValue, 110);
            this._answeredCorrectly = false;
            this._answered = false;

            setTimeout(() => {
                for (let i = 0; i < 4; i++) {
                    this._answerButtons[i].setClickHandler(() => {
                        this._answeredCorrectly = i === mathOperation.correctAlternative;
                        this._answered = true;

                        for (let j = 0; j < 4; j++) {
                            this._answerButtons[j].setClickHandler(null);
                        }
                    });
                }
            }, 100);
        }
    }

    const switchByButton = {
        a: uiStorage.switches.abilityRechargeShow0,
        g: uiStorage.switches.abilityRechargeShow1,
        s: uiStorage.switches.abilityRechargeShow2,
    };

    Scene_Battle.prototype.setRechargingActions = function (val, type) {
        this._isRechargingButtons = val;
        Object.keys(switchByButton).forEach(k => $gameSwitches.setValue(switchByButton[k], val));
    }

    Scene_Battle.prototype.doAction = function (battler, actionKey, skillId, omitEvent, enemy) {
        let actionDoer = battler;
        if (enemy) {
            actionDoer = enemy;
        }

        BattleManager.startCustomAction({
            actionKey,
            battler,
            actionDoer,
            omitEvent,
            skillId,
            enemy: enemy,
        });
    }

    const _Sprite_Battler_update = Sprite_Battler.prototype.update;
    Sprite_Battler.prototype.update = function () {
        _Sprite_Battler_update.apply(this, arguments);
        if (this._battler) {
            if (SceneManager._scene instanceof Scene_Battle &&
                SceneManager._scene &&
                SceneManager._scene._ultraHudContainer &&
                SceneManager._scene._ultraHudContainer._mainHUD
            ) {
                const i = this._battler.index();
                let hud = SceneManager._scene._ultraHudContainer._mainHUD.findComponentByName("jogador" + (i === 0 && !this._battler._enemyId ? 49 : i-1));
                if (hud) {
                    hud.x = this._homeX + 2;
                    hud.y = this._homeY - 82;
                }
            }
        }
    }

    const _Sprite_Battler_startMove = Sprite_Battler.prototype.startMove;
    Sprite_Battler.prototype.startMove = function (x, y, duration) {
        if (x === -48 && y === 0 && duration === 12) { // If is step forward, do not do movement
            return;
        }

        _Sprite_Battler_startMove.apply(this, arguments);
    }

    Sprite_Actor.prototype.setBattler = function(battler) {
        Sprite_Battler.prototype.setBattler.call(this, battler);
        if (battler !== this._actor) {
            this._actor = battler;
            if (battler) {
                const index = battler.index();
                this.setHome(478 + index * 12, 200 + (index % 5) * 80);
            } else {
                this._mainSprite.bitmap = null;
                this._battlerName = "";
            }
            this.startEntryMotion();
            this._stateSprite.setup(battler);
        }
    };

    Sprite_Actor.prototype.setActorHome = function(index) {
        this.setHome(478 + index * 12, 200 + (index % 5) * 80);
    };

    Sprite_Actor.prototype.updateBitmap = function() {
        Sprite_Battler.prototype.updateBitmap.call(this);
        // const name = this._actor.battlerName();
        const battlerIndex = this._battler.index();
        const name = "Actor1_" + ((battlerIndex === 0 ? ColyseusUtils.getCurrentPlayer() : (ColyseusUtils.getPlayers()[battlerIndex-1] || {playerSprite: 0})).playerSprite + 1);
        if (this._battlerName !== name) {
            this._battlerName = name;
            this._mainSprite.bitmap = ImageManager.loadSvActor(name);
        }
    };

    const _Sprite_Actor_refreshMotion = Sprite_Actor.prototype.refreshMotion;
    Sprite_Actor.prototype.refreshMotion = function () {
        _Sprite_Actor_refreshMotion.apply(this, arguments);

        const actor = this._actor;
        if (actor && actor.isGuardingAnimation()) {
            this.startMotion("guard");
        }
    }

    const _Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
    Game_BattlerBase.prototype.initMembers = function () {
        _Game_BattlerBase_initMembers.apply(this, arguments);
        this._isGuarding = false;
    }

    Game_BattlerBase.prototype.isGuardingAnimation = function () {
        return this._isGuarding;
    }

    Game_BattlerBase.prototype.setGuarding = function (guarding) {
        this._isGuarding = guarding;
    }

    Game_BattlerBase.prototype.isGuard = function () {
        return this._isGuarding;
    }

    const _Game_Action_initialize = Game_Action.prototype.initialize;
    Game_Action.prototype.initialize = function () {
        _Game_Action_initialize.apply(this, arguments);
        this._isEnemyAttack = false;
    }

    Game_Action.prototype.apply = function (target) {
        const result = target.result();
        this.subject().clearResult();
        result.clear();
        result.used = this.testApply(target);
        result.missed = false;
        result.evaded = false;
        result.physical = this.isPhysical();
        result.drain = this.isDrain();
        if (result.isHit()) {
            if (this.item()) {
                if (this.item().damage.type > 0) {
                    result.critical = Math.random() < this.itemCri(target);
                    const value = this.makeDamageValue(target, result.critical);
                    this.executeDamage(target, value);
                }
                for (const effect of this.item().effects) {
                    this.applyItemEffect(target, effect);
                }
            }
            this.applyItemUserEffect(target);
        }
        this.updateLastTarget(target);

        if (this._isEnemyAttack) {
            target.setGuarding(false);
            ColyseusUtils.sendUpdateHealth($gameParty.allMembers()[0].hp);
        }
    }

    Spriteset_Battle.prototype.createNewActor = function() {
        const sprite = new Sprite_Actor();
        this._actorSprites.push(sprite);
        this._battleField.addChild(sprite);
    };

    Spriteset_Battle.prototype.removeActor = function(index) {
        const sprite = this._actorSprites[index];
        this._actorSprites.splice(index, 1);
        this._battleField.removeChild(sprite);
        sprite.opacity = 0;
        sprite.destroy();
    };

    Window_BattleLog.prototype.callNextMethod = function() {
        if (this._methods.length > 0) {
            const method = this._methods.shift();
            if (method.name && this[method.name]) {
                try {
                    this[method.name].apply(this, method.params);
                } catch (e) {
                    if (e && e.message && e.message.includes('_0x12a960.battler() is undefined')) {
                        console.log('Detected error' + e.message + ', seems skippable...')
                    }
                    else {
                        throw e;
                    }
                }
            } else {
                throw new Error("Method not found: " + method.name);
            }
        }
    };

    //=============================================================================
    // Player and followers
    //=============================================================================

    // const _Game_Player_initialize = Game_Player.prototype.initialize;
    // Game_Player.prototype.initialize = function () {
    //     _Game_Player_initialize.apply(this, arguments);
    //
    //     ColyseusUtils.onHealthUpdated((sender, health) => {
    //         const index = ColyseusUtils.getPlayers().findIndex(p => p.sessionId === sender);
    //         if (index >= 0 && $gameParty[index]) {
    //             $gameParty[index].setHp(health);
    //         }
    //     });
    // }

    const _Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function () {
        _Game_Player_initMembers.apply(this, arguments);
        const currPlayer = ColyseusUtils.getCurrentPlayer();
        this.setCustomChar("Actor1", currPlayer ? currPlayer.playerSprite : 0);
    }

    Game_Player.prototype.setCustomChar = function (name, index) {
        this._customCharName = name;
        this._customCharIndex = index;
        this.refresh();
    }

    Game_Player.prototype.refresh = function() {
        // const actor = $gameParty.leader();
        // const characterName = actor ? actor.characterName() : "";
        // const characterIndex = actor ? actor.characterIndex() : 0;
        this.setImage(this._customCharName, this._customCharIndex);
        this._followers.refresh();
    };

    const _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function () {
        const lastX = this.x;
        const lastY = this.y;

        _Game_Player_update.apply(this, arguments);

        if (this.x !== lastX || this.y !== lastY) {
            ColyseusUtils.sendMovement(0, this.x, this.y, this.realMoveSpeed() === 5);
        }
    }

    const _Game_Follower_initialize = Game_Follower.prototype.initialize;
    Game_Follower.prototype.initialize = function () {
        _Game_Follower_initialize.apply(this, arguments);

        this._targetX = undefined;
        this._targetY = undefined;
        this._externalPlayer = undefined;
        this._isRunning = false;
        this.setTransparent(false);
        this.setThrough(true);
        this._customCharName = "";
        this._customCharIndex = 0;
    }

    Game_Follower.prototype.setCustomChar = function(name, index) {
        this._customCharName = name;
        this._customCharIndex = index;
        this.refresh();
    }

    Game_Follower.prototype.refresh = function() {
        // const characterName = this.isVisible() ? this.actor().characterName() : "";
        // const characterIndex = this.isVisible() ? this.actor().characterIndex() : 0;
        this.setImage(this._customCharName, this._customCharIndex);
    };

    Game_Follower.prototype.update = function() {
        Game_Character.prototype.update.call(this);

        if (this.x === this._targetX) {
            this._targetX = undefined;
        }
        if (this.y === this._targetY) {
            this._targetY = undefined;
        }

        if (this._targetX || this._targetX === 0 || this._targetY || this._targetY === 0) {
            this.chaseCoords(this._targetX, this._targetY);
            this.setMoveSpeed(this._isRunning ? 5 : 4);
        }
    };

    Game_Follower.prototype.chaseCoords = function(x, y) {
        this.moveStraight(this.findDirectionTo(x || this.x, y || this.y));
    };

    const _Game_Followers_initialize = Game_Followers.prototype.initialize;
    Game_Followers.prototype.initialize = function () {
        this._playerMap = {};
        this._hudMap = {};
        this._startingPos = {x: 0, y: 0};
        this._startingPosInit = false;

        _Game_Followers_initialize.apply(this, arguments);
    }

    Game_Followers.prototype.setup = function() {
        this._data = [];

        for (let i = 0; i < 50; i++) {
            const newFollower = new Game_Follower(i+1);
            newFollower.setTransparent(true);
            newFollower.setPosition(this.getStartingPos().x, this.getStartingPos().y);
            newFollower.setCustomChar("", 0);
            this._data.push(newFollower);
        }

        ColyseusUtils.getPlayers().forEach(p => this.onPlayerJoined(p));

        ColyseusUtils.onPlayerJoined((p) => {
            if (p) {
                const follower = this.getBySessionId(p.sessionId);
                if (follower) {
                    // TODO do
                } else {
                    this.onPlayerJoined(p);
                }
            }
        });

        ColyseusUtils.onPlayerLeft((sessionId) => {
            const follower = this.getBySessionId(sessionId);
            if (follower) {
                follower.setTransparent(true);
                follower.setPosition(this.getStartingPos().x, this.getStartingPos().y);
                follower.setCustomChar("", 0);

                const followerIndex = this._data.findIndex(f => f === follower);
                $gameSwitches.setValue(uiStorage.switches.showPlayer0 + followerIndex, false);

                this._playerMap[sessionId] = undefined;
                delete this._playerMap[sessionId];

                this._hudMap[followerIndex] = undefined;
                delete this._hudMap[followerIndex];
            }
        });
    };

    Game_Followers.prototype.updateFollowerInfo = function () {
        const members = $gameParty.allMembers();
        ColyseusUtils.getPlayers().filter(p => p.health >= 0).forEach((p, i) => {
            const m = members[i+1];
            if (m && p.hp !== -1) {
                m.setHp(p.health);
            }
        });
        const currPlayer = ColyseusUtils.getCurrentPlayer();
        if (currPlayer && currPlayer.health !== -1) {
            members[0].setHp(currPlayer.health);
        }

        this.updateMove();
    }

    Game_Followers.prototype.getStartingPos = function () {
        if (!this._startingPosInit && $dataMap && $dataMap.events) {
            const spawnEvent = DataManager.getEventByName('SPAWN');
            this._startingPos = {x: spawnEvent.x, y: spawnEvent.y};
            this._startingPosInit = true;
        }

        return this._startingPos;
    };

    Game_Followers.prototype.onPlayerJoined = function(p) {
        const followerIndex = this._data.findIndex(f => f.isTransparent())
        const follower = this._data[followerIndex];
        follower.setTransparent(false);
        follower._isRunning = p.isRunning;
        follower._externalPlayer = p;
        follower.setPosition(this.getStartingPos().x, this.getStartingPos().y);
        follower.setCustomChar("Actor1", p.playerSprite);

        $gameVariables.setValue(uiStorage.variables.playerName0 + followerIndex, p.name);
        $gameSwitches.setValue(uiStorage.switches.showPlayer0 + followerIndex, true);

        this._playerMap[p.sessionId] = follower;
    };

    Game_Followers.prototype.getBySessionId = function(sessionId) {
        return this._playerMap[sessionId];
    };

    Game_Followers.prototype.getActive = function() {
        return Object.keys(this._playerMap).map(k => this._playerMap[k]);
    };

    Game_Followers.prototype.refresh = function() {
        for (const follower of this.getActive()) {
            follower.refresh();
        }
    };

    Game_Followers.prototype.update = function() {
        if (this.areGathering()) {
            if (!this.areMoving()) {
                // this.updateMove();
            }
            if (this.areGathered()) {
                this._gathering = false;
            }
        }
        this.getActive().forEach((f, i) => {
            f.update();

            if (SceneManager._scene instanceof Scene_Map) {
                let hud = this._hudMap[i];
                if (hud && hud.transform) {
                    hud.x = f.screenX();
                    hud.y = f.screenY() - 54;
                } else {
                    hud = SceneManager._scene._ultraHudContainer._mainHUD.findComponentByName("nome jogador " + i);
                    this._hudMap[i] = hud;
                }
            }
        });
    };

    Game_Followers.prototype.updateMove = function() {
        this.getActive().forEach((gf, i) => {
            const p = ColyseusUtils.getPlayer(gf._externalPlayer.sessionId);
            if (p && p.x !== -1 && p.y !== -1) {
                gf._targetX = p.x !== gf._x ? p.x : undefined;
                gf._targetY = p.y !== gf._y ? p.y : undefined;
                gf._isRunning = p.isRunning;
            }
        });
    };

    Game_Followers.prototype.jumpAll = function() {
        if ($gamePlayer.isJumping()) {
            for (const follower of this.getActive()) {
                const sx = $gamePlayer.deltaXFrom(follower.x);
                const sy = $gamePlayer.deltaYFrom(follower.y);
                follower.jump(sx, sy);
            }
        }
    };

    Game_Followers.prototype.synchronize = function(x, y, d) {
        for (const follower of this.getActive()) {
            follower.locate(x, y);
            follower.setDirection(d);
        }
    };

    const _Scene_Map_initialize = Scene_Map.prototype.initialize;
    Scene_Map.prototype.initialize = function () {
        _Scene_Map_initialize.apply(this, arguments);

        ColyseusUtils.getPlayers().forEach((p, i) => {
            const actor = $gameActors.actor(i+1);
            actor['externalPlayer'] = p;
        });
    }

    //-----------------------------------------------------------------------------
    // Custom button sprite
    //

    function Sprite_Action_Button() {
        this.initialize(...arguments);
    }

    Sprite_Action_Button.prototype = Object.create(Sprite_Clickable.prototype);
    Sprite_Action_Button.prototype.constructor = Sprite_Action_Button;

    Sprite_Action_Button.prototype.initialize = function(buttonType) {
        Sprite_Clickable.prototype.initialize.call(this);
        this._buttonType = buttonType;
        this._clickHandler = null;
        this._coldFrame = null;
        this._hotFrame = null;
        this._buttonData = null;
        this._value = 0;
        this._rechargeFrameCache = null;
        this._shouldUpdateOpacity = true;
        this.setupFrames();
    };

    Sprite_Action_Button.prototype.shouldUpdateOpacity = function (val) {
        this._shouldUpdateOpacity = val;
    }

    Sprite_Action_Button.prototype.setValue = function (val) {
        this._value = val;
    }

    Sprite_Action_Button.prototype.setupFrames = function() {
        const data = this.buttonData();
        this._buttonData = data;
        const x = data.x * this.blockWidth();
        const width = data.w * this.blockWidth();
        const height = this.blockHeight();
        this.loadButtonImage();
        this.setColdFrame(x, 0, width, height);
        this.setHotFrame(x, height, width, height);
        this.updateFrame();
        this.updateOpacity();
    };

    Sprite_Action_Button.prototype.blockWidth = function() {
        return 96;
    };

    Sprite_Action_Button.prototype.blockHeight = function() {
        return 96;
    };

    Sprite_Action_Button.prototype.loadButtonImage = function() {
        this.bitmap = ImageManager.loadSystem("ActionIcons");
    };

    Sprite_Action_Button.prototype.buttonData = function() {
        const buttonTable = {
            attack: {x: 0, w: 1},
            guard: {x: 1, w: 1},
            special: {x: 2, w: 1},
            empty: {x: 3, w: 1},
        };
        return buttonTable[this._buttonType];
    };

    Sprite_Action_Button.prototype.update = function() {
        Sprite_Clickable.prototype.update.call(this);
        this.checkBitmap();
        this.updateFrame();
        this.updateOpacity();
        this.processTouch();

        const rech = this.rechargeFrame();
        if (rech) {
            rech.setGaugeValue(this._value);
        }
    };

    Sprite_Action_Button.prototype.checkBitmap = function() {
        if (this.bitmap.isReady() && this.bitmap.width < this.blockWidth() * 3) {
            // Probably MV image is used
            throw new Error("ButtonSet image is too small");
        }
    };

    Sprite_Action_Button.prototype.updateFrame = function() {
        const frame = this.isPressed() ? this._hotFrame : this._coldFrame;
        if (frame) {
            this.setFrame(frame.x, frame.y, frame.width, frame.height);
        }

        const rech = this.rechargeFrame();
        if (rech) {
            rech.x = this.x + rech.width/2 + 4;
            rech.y = this.y + rech.height/2 + 4;
        }
    };

    Sprite_Action_Button.prototype.rechargeFrame = function () {
        if (this._rechargeFrameCache) {
            return this._rechargeFrameCache;
        }

        if (SceneManager._scene instanceof Scene_Battle &&
            SceneManager._scene &&
            SceneManager._scene._ultraHudContainer &&
            SceneManager._scene._ultraHudContainer._mainHUD
        ) {
            this._rechargeFrameCache = SceneManager._scene._ultraHudContainer._mainHUD.findComponentByName("abilityrecharge" + this._buttonData.x)
            return this._rechargeFrameCache;
        } else {
            return undefined;
        }
    }

    Sprite_Action_Button.prototype.updateOpacity = function() {
        if (this._shouldUpdateOpacity) {
            this.opacity = this._pressed && this._value <= 0 ? 255 : 192;
        }
    };

    Sprite_Action_Button.prototype.setColdFrame = function(x, y, width, height) {
        this._coldFrame = new Rectangle(x, y, width, height);
    };

    Sprite_Action_Button.prototype.setHotFrame = function(x, y, width, height) {
        if (this._value > 0) {
            this._hotFrame = new Rectangle(x, y, width, height);
        }
    };

    Sprite_Action_Button.prototype.setClickHandler = function(method) {
        this._clickHandler = method;
    };

    Sprite_Action_Button.prototype.onClick = function() {
        if (this._clickHandler) {
            this._clickHandler();
        }
    };

    Window_PartyCommand.prototype.open = function() {
    };

    Window_PartyCommand.prototype.activate = function() {
    };

    Window_ActorCommand.prototype.open = function() {
    };

    Window_ActorCommand.prototype.activate = function() {
    };

    Window_BattleStatus.prototype.open = function() {
    };

    Window_BattleStatus.prototype.activate = function() {
    };

    Window_BattleActor.prototype.open = function() {
    };

    Window_BattleActor.prototype.activate = function() {
    };

    //=============================================================================
    // Exports
    //=============================================================================

    const exports = window;

    exports.setMessage = function(message) {
        $gameSwitches.setValue(501, true);
        $gameVariables.setValue(501, message);
    }

    exports.clearMessage = function () {
        $gameSwitches.setValue(501, false);
        $gameVariables.setValue(501, "");
    }

    exports.MathGenerator = MathGenerator;
    exports.uiStorage = uiStorage;
    exports.Sprite_Action_Button = Sprite_Action_Button;
})();