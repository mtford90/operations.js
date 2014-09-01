var _ = require('underscore');

var log = require('./log');
var Logger = log.loggerWithName('OperationQueue');


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
            var oldValue = self._running;
            var wasRunning = self._running;
            self._running = v;
            if (!wasRunning && self._running) {
                self._nextOperations();
            }
            if (oldValue != this.running) {
                self._notify(self._notificationDict('running', oldValue, self.running));
            }
        },
        configurable: true,
        enumerable: true
    });
}


OperationQueue.prototype._nextOperations = function () {
    var self = this;
    while((self._runningOperations.length < self.maxConcurrentOperations) && self._queuedOperations.length) {
        var op = self._queuedOperations[0];
        self._runOperation(op);
    }
};

OperationQueue.prototype._notificationDict = function (prop, oldValue, newValue) {
    return {property: prop, old: oldValue, new: newValue};
};

OperationQueue.prototype._notify = function (changes) {
    var self = this;
    if (Object.prototype.toString.call(changes) !== '[object Array]') {
        changes = [changes];
    }
    _.each(this.observers, function (o) {
        _.bind(o, self)(changes);
    });
};

OperationQueue.prototype._runOperation = function (op) {
    var self = this;
    var wasEnqueued = false;
    var previousQueuedOperations = this._queuedOperations.length;
    for (var i=0;i<this._queuedOperations.length;i++) {
        if (this._queuedOperations[i] == op) {
            this._queuedOperations.splice(i, 1);
            wasEnqueued = true;
            break;
        }
    }
    var previousNumRunningOperations = this.numRunningOperations;
    this._runningOperations.push(op);
    op.addObserver(function () {
        var idx = self._runningOperations.indexOf(op);
        var previousNumRunningOperations = self.numRunningOperations;
        self._runningOperations.splice(idx, 1);
        var notification = self._notificationDict('numRunningOperations', previousNumRunningOperations, self.numRunningOperations);
        self._notify(notification);
        self._nextOperations();
    });
    op.start();
    var notifications = [this._notificationDict('numRunningOperations', previousNumRunningOperations, this.numRunningOperations)];
    if (wasEnqueued) {
        notifications.push(this._notificationDict('numQueuedOperations', previousQueuedOperations, this._queuedOperations.length));
    }
    this._notify(notifications);
};

OperationQueue.prototype._logStatus = function () {

};

OperationQueue.prototype._addOperation = function (op) {
    if (this.numRunningOperations < this.maxConcurrentOperations && this.running) {
        this._runOperation(op);
    }
    else {
        var previousQueuedOperations = this._queuedOperations.length;
        this._queuedOperations.push(op);
        this._notify(this._notificationDict('numQueuedOperations', previousQueuedOperations, this._queuedOperations.length));
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

OperationQueue.prototype.stop = function () {
    this.running = false;
};

module.exports.OperationQueue = OperationQueue;