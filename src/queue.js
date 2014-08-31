function OperationQueue (maxConcurrentOperations) {
    var self = this;
    this._queuedOperations = [];
    this.maxConcurrentOperations = maxConcurrentOperations;
    this._runningOperations = [];
    Object.defineProperty(this, 'numRunningOperations', {
        get: function () {
            return self._runningOperations.length;
        },
        configurable: true,
        enumerable: true
    });
}

function callback(queue, op) {
    var idx = queue._runningOperations.indexOf(op);
    queue._runningOperations.splice(idx, 1);
    if (queue._queuedOperations.length) {
        var nextOp = queue._queuedOperations.pop();
        queue._runningOperations.push(nextOp);
        nextOp.start();
    }
}

OperationQueue.prototype._addOperation = function (op) {
    if (this.numRunningOperations < this.maxConcurrentOperations) {
        this._runningOperations.push(op);
        op.completionCallback = _.partial(callback, this, op);
        op.start();
    }
    else {
        this._queuedOperations.push(op);
    }
};

OperationQueue.prototype.addOperation = function (operationOrOperations) {
    if (Object.prototype.toString.call(operationOrOperations) === '[object Array]') {

    }
    else {

    }
};

OperationQueue.prototype._dump = function (asJson) {
    var obj = {};
    return asJson ? JSON.stringify(obj, null, 4) : obj;
};

module.exports.OperationQueue = OperationQueue;