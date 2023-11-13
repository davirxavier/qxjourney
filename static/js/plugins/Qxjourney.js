(() => {
    const exports = window;

    exports.setMessage = function(message) {
        $gameSwitches.setValue(501, true);
        $gameVariables.setValue(501, message);
    }

    exports.clearMessage = function () {
        $gameSwitches.setValue(501, false);
        $gameVariables.setValue(501, "");
    }

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

    exports.MathGenerator = MathGenerator;
})();