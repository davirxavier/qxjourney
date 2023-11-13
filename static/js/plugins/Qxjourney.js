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

})();