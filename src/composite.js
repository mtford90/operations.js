var BaseOperation = require('./base').BaseOperation;
var _ = require('underscore');

function CompositeOperation(name, operations, completionCallback) {
    if (!this) return new CompositeOperation;
    var self = this;
    this.operations = operations;

    var work = function (done) {
        _.each(self.operations, function (op) {
            op.completionCallback = function () {
                var numOperationsRemaining = self._numOperationsRemaining;
                if (!numOperationsRemaining) {
                    var errors = _.pluck(self.operations, 'error');
                    var results = _.pluck(self.operations, 'result');
                    done(_.some(errors) ? errors : null, _.some(results) ? results : null);
                }
            };
            op.start();
        });
    };

    Object.defineProperty(this, '_numOperationsRemaining', {
        get: function () {
            return _.reduce(self.operations, function (memo, op) {
                if (op.completed) {
                    return memo + 0;
                }
                return memo + 1;
            }, 0);
        },
        enumerable: true,
        configurable: true
    });

    BaseOperation.call(this, name, work, completionCallback);
}

CompositeOperation.prototype = Object.create(BaseOperation.prototype);

CompositeOperation.prototype._dump = function (asJson) {
    var self = this;
    var obj = {
        name: this.name,
        purpose: this.purpose,
        error: this.error,
        completed: this.completed,
        failed: this.failed,
        running: this.running,
        completedOperations: _.reduce(self.operations, function (memo, op) {
            if (op.completed) {
                memo.push(op._dump());
            }
            return memo;
        }, []),
        uncompletedOperations: _.reduce(self.operations, function (memo, op) {
            if (!op.completed) {
                memo.push(op._dump());
            }
            return memo;
        }, [])
    };
    return asJson ? JSON.stringify(obj, null, 4) : obj;
};

module.exports.CompositeOperation = CompositeOperation;