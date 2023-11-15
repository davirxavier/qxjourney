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
            let random = this.randomIntFromInterval(0, result*2);
            while (random === result || ret.includes(random)) {
                random = this.randomIntFromInterval(0, result*2);
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
        const op1 = this.randomIntFromInterval(0, 10);
        const op2 = this.randomIntFromInterval(0, 10);

        const alternatives = this.genAlternatives(op1-op2);
        return {operands: [op1, '-', op2], result: op1-op2, alternatives: alternatives[0], correctAlternative: alternatives[1]};
    }

    MathGenerator.gen3 = function () {
        const op1 = this.randomIntFromInterval(0, 10);
        const op2 = this.randomIntFromInterval(0, 10);

        const alternatives = this.genAlternatives(op1*op2);
        return {operands: [op1, '*', op2], result: op1*op2, alternatives: alternatives[0], correctAlternative: alternatives[1]};
    }

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

    Scene_Boot.prototype.startNormalGame = function() {
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

        if (ColyseusUtils.hasCombat() && ColyseusUtils.isCurrentPlayerInCombat()) {
            new Game_Interpreter().command301([0, ColyseusUtils.getCombatTroopId(), false, false]);
        } else {
            SceneManager.goto(Scene_Map);
        }
    };

    Scene_Gameover.prototype.update = function() {
        if (this.isActive() && !this.isBusy() && this.isTriggered()) {
            DataManager.setupNewGame();
            SceneManager.goto(Scene_Map);
        }
        Scene_Base.prototype.update.call(this);
    };
})();