function Logger (name) {
    this.name = name;
}

Logger.Level = {
    trace: 0,
    debug: 1,
    info: 2,
    warning: 3,
    warn: 3,
    error: 4
};

Logger.LevelText = {};
Logger.LevelText [Logger.Level.trace] = 'TRACE';
Logger.LevelText [Logger.Level.debug] = 'DEBUG';
Logger.LevelText [Logger.Level.info] = 'INFO ';
Logger.LevelText [Logger.Level.warning] = 'WARN ';
Logger.LevelText [Logger.Level.error] = 'ERROR';

Logger.levelAsText = function (level) {
    return this.LevelText[level];
};

Logger.loggerWithName = function (name) {
    return new Logger(name);
};

Logger.logLevels = {};

Logger.logLevel = function (name) {
    var level = this.logLevels[name];
    return level ? level : this.Level.trace;
};

Logger.prototype.performLog = function (logFunc, level, message, otherArguments) {
    var currentLevel = Logger.logLevel(this.name);
    if (currentLevel <= level) {
        logFunc = _.partial(logFunc, Logger.levelAsText(level) + ' [' + this.name + ']: ' + message);
        var args = [];
        for (var i=0; i<otherArguments.length; i++) {
            args[i] = otherArguments[i];
        }
        args.splice(0, 1);
        logFunc.apply(logFunc, args);
    }
};

Logger.prototype.trace = function (message) {
    this.performLog(console.debug, Logger.Level.trace, message, arguments);
};
Logger.prototype.debug = function (message) {
    this.performLog(console.debug, Logger.Level.debug, message, arguments);
};

Logger.prototype.log = function (message) {
    this.performLog(console.log, Logger.Level.info, message, arguments);
};

Logger.prototype.info = function (message) {
    this.performLog(console.info, Logger.Level.info, message, arguments);
};

Logger.prototype.warn = function (message) {
    this.performLog(console.warn, Logger.Level.warning, message, arguments);
};

Logger.prototype.warning = Logger.prototype.warn;

Logger.prototype.error = function (message) {
    this.performLog(console.error, Logger.Level.error, message, arguments);
};

module.exports = Logger;