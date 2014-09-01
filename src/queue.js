var _ = require('underscore');

var log = require('./log');
var Logger = log.loggerWithName('OperationQueue');


function OperationQueue (maxConcurrentOperations) {
    var self = this;
    this._queuedOperations = [];
    this.maxConcurrentOperations = maxConcurrentOperations;
    this._runningOperations = [];
    this._running = false;
    this._onStart = [];
    this._onStop = [];
    this.logLevel = null;

    Object.defineProperty(this, 'numRunningOperations', {
        get: function () {
            return self._runningOperations.length;
        },
        configurable: true,
        enumerable: true
    });

    Object.defineProperty(this, 'running', {
        get: function () {
            return self._running;
        },
        set: function (v) {
            var oldValue = self._running;
            var wasRunning = self._running;
            self._running = v;
            if (!wasRunning && self._running) {
                self._nextOperations();
                self._logStart();
            }
            else if (wasRunning && !self._running) {
                self._logStop();
            }
            if (oldValue != this.running) {
                if (this.running) {
                    _.each(self._onStart, function (c) {
                        _.bind(c, self)();
                    })
                }
                else {
                    _.each(self._onStop, function (c) {
                        _.bind(c, self)();
                    })
                }
            }
        },
        configurable: true,
        enumerable: true
    });

    Object.defineProperty(this, 'loggingOveridden', {
        get: function () {
            if (self.logLevel) {
                return self.logLevel <= log.Level.info;
            }
            return false;
        },
        enumerable: true,
        configurable: true
    })
}

OperationQueue.prototype._nextOperations = function () {
    var self = this;
    while((self._runningOperations.length < self.maxConcurrentOperations) && self._queuedOperations.length) {
        var op = self._queuedOperations[0];
        self._runOperation(op);
    }
};


OperationQueue.prototype._runOperation = function (op) {
    var self = this;
    for (var i=0;i<this._queuedOperations.length;i++) {
        if (this._queuedOperations[i] == op) {
            this._queuedOperations.splice(i, 1);
            break;
        }
    }
    this._runningOperations.push(op);
    op.onCompletion(function () {
        var idx = self._runningOperations.indexOf(op);
        self._runningOperations.splice(idx, 1);
        self._nextOperations();
        self._logStatus();
    });
    op.start();
    this._logStatus();
};

OperationQueue.prototype._logStatus = function () {
    var logFunc = this._getLogFunc();
    if (Logger.info.isEnabled || this.loggingOveridden) {
        var numRunning = this.numRunningOperations;
        var numQueued = this._queuedOperations.length;
        var name = this.name || "Unnamed Queue";
        if (numRunning && numQueued) {
            logFunc('"' + name +'" now has ' + numRunning.toString() + ' operations running and ' + numQueued.toString() + ' operations queued');
        }
        else if (numRunning) {
            logFunc('"' + name +'" now has ' + numRunning.toString() + ' operations running');
        }
        else if (numQueued) {
            logFunc('"' + name +'" now has ' + numQueued.toString() + ' operations queued');
        }
        else {
            logFunc('"' + name +'" has no operations running or queued');
        }
    }
};

OperationQueue.prototype._logStart = function () {
    var logFunc = this._getLogFunc();
    if (Logger.info.isEnabled || this.loggingOveridden) {
        var name = this.name || "Unnamed Queue";
        logFunc('"' + name +'" is now running');
    }
};

OperationQueue.prototype._getLogFunc = function () {
    if (this.logLevel) {
        return _.bind(Logger.override, Logger, log.Level.info, this.logLevel);
    }
    return Logger.info;
};


OperationQueue.prototype._logStop = function () {
    var logFunc = this._getLogFunc();
    if (Logger.info.isEnabled || this.loggingOveridden) {
        var name = this.name || "Unnamed Queue";
        logFunc('"' + name +'" is no longer running');
    }
};

OperationQueue.prototype._addOperation = function (op) {
    if (this.numRunningOperations < this.maxConcurrentOperations && this.running) {
        this._runOperation(op);
    }
    else {
        this._queuedOperations.push(op);
    }
    this._logStatus();
};

OperationQueue.prototype.addOperation = function (operationOrOperations) {
    var self = this;
    if (Object.prototype.toString.call(operationOrOperations) === '[object Array]') {
        _.each(operationOrOperations, function (op) {self._addOperation(op)});
    }
    else {
        this._addOperation(operationOrOperations);
    }
};

OperationQueue.prototype.start = function () {
    this.running = true;
};

OperationQueue.prototype.stop = function () {
    this.running = false;
};

OperationQueue.prototype.onStart = function (o) {
    this._onStart.push(o);
};
OperationQueue.prototype.onStop = function (o) {
    this._onStop.push(o);
};

module.exports.OperationQueue = OperationQueue;