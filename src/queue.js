var _ = require('underscore');

function OperationQueue (maxConcurrentOperations) {
    var self = this;
    this._queuedOperations = [];
    this.maxConcurrentOperations = maxConcurrentOperations;
    this._runningOperations = [];
    this._running = false;
    this.observers = [];
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
            var wasRunning = self._running;
            self._running = v;
            if (!wasRunning && self._running) {
                self._nextOperations();
            }
        },
        configurable: true,
        enumerable: true
    });
}


OperationQueue.prototype._nextOperations = function () {
    var self = this;
    while((self._runningOperations.length < self.maxConcurrentOperations) && self._queuedOperations.length) {
        var op = self._queuedOperations.pop();
        self._runOperation(op);
    }
};

OperationQueue.prototype._runOperation = function (op) {
    var self = this;
    this._runningOperations.push(op);
    op.addObserver(function () {
        var idx = self._runningOperations.indexOf(op);
        self._runningOperations.splice(idx, 1);
        self._nextOperations();
    });
    op.start();
};

OperationQueue.prototype._addOperation = function (op) {
    if (this.numRunningOperations < this.maxConcurrentOperations && this.running) {
        this._runOperation(op);
    }
    else {
        this._queuedOperations.push(op);
    }
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

OperationQueue.prototype.addObserver = function (o) {
    this.observers.push(o);
};

OperationQueue.prototype.removeObserver = function (o) {
    var idx = this.observers.indexOf(o);
    if (idx > -1) {
        this.observers.splice(idx, 1);
    }
};

OperationQueue.prototype.start = function () {
    this.running = true;
};

OperationQueue.prototype.pause = function () {
    this.running = false;
};

module.exports.OperationQueue = OperationQueue;