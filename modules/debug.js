/*
    Debug Stuff
*/

var config, isDebugLvl, sty;

config = require("../config");

sty = require("sty");

isDebugLvl = function(lvl) {
    return config.debug.level <= lvl;
};

exports.error = function(msg) {
    if (!isDebugLvl(config.debug.levels.error)) {
        return;
    }
    console.log(("" + (sty.bgwhite(sty.black(config.appName))) + " " + (sty.red(sty.bold('ERROR:'))) + " ") + msg);
};

exports.warn = function(msg) {
    if (!isDebugLvl(config.debug.levels.warn)) {
        return;
    }
    console.log(("" + (sty.bgwhite(sty.black(config.appName))) + " " + (sty.yellow('WARNING:')) + " ") + msg);
};

exports.info = function(msg) {
    if (!isDebugLvl(config.debug.levels.info)) {
        return;
    }
    console.log(("" + (sty.bgwhite(sty.black(config.appName))) + " " + (sty.cyan('INFO:')) + " ") + msg);
};

exports.infoSuccess = function(msg) {
    if (!isDebugLvl(config.debug.levels.info)) {
        return;
    }
    exports.info(("" + (sty.green('SUCCESS: '))) + msg);
};

exports.infoFail = function(msg) {
    if (!isDebugLvl(config.debug.levels.info)) {
        return;
    }
    return exports.info(("" + (sty.red('FAIL: '))) + msg);
};
