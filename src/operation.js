var _ = require('underscore');
var log = require('./log');
var Logger = log.loggerWithName('Operation');

function Operation() {
    if (!this) {
        return new (Function.prototype.bind.apply(Operation, arguments));
    }
    var self = this;
    if (arguments.length) {
        if (typeof(arguments[0]) == 'string') {
            this.name = arguments[0];
            this.work = arguments[1];
            this.completion = arguments[2];
        }
        else if (typeof(arguments[0]) == 'function' ||
            Object.prototype.toString.call(arguments[0]) === '[object Array]' ||
            arguments[0] instanceof Operation) {
            this.work = arguments[0];
            this.completion = arguments[1];
        }
    }
    this.error = null;
    this.completed = false;
    this.result = null;
    this.running = false;
    this.cancelled = false;
    this.dependencies = [];
    this._mustSucceed = [];
    this.observers = [];

    Object.defineProperty(this, 'failed', {
        get: function () {
            return  !!self.error || self.failedDueToDependency;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(this, 'composite', {
        get: function () {
            return self.work instanceof Operation ||
                Object.prototype.toString.call(self.work) === '[object Array]'
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(this, 'numOperationsRemaining', {
        get: function () {
            if (self.work instanceof Operation) {
                return self.work.completed ? 0 : 1
            }
            else if (Object.prototype.toString.call(self.work) === '[object Array]') {
                return _.reduce(self.work, function (memo, op) {
                    if (!op.completed) {
                        return memo + 1;
                    }
                    return memo;
                }, 0);
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(this, 'canRun',  {
        get: function () {
            if (self.dependencies.length) {
                return _.reduce(self.dependencies, function (memo, dep) {
                    var mustSucceed = self._mustSucceed.indexOf(dep) > -1;
                    var canRun = memo && dep.completed;
                    if (mustSucceed && canRun) {
                        canRun = canRun && !(dep.failed || dep.cancelled);
                    }
                    return canRun;
                }, true);
            }
            return true;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(this, 'failedDueToDependency', {
        get: function () {
            if (self.dependencies.length) {
                return _.reduce(self.dependencies, function (memo, dep) {
                    var mustSucceed = self._mustSucceed.indexOf(dep) > -1;
                    return memo || ((dep.failed || dep.cancelled) && mustSucceed)
                }, false);
            }
            return false;
        },
        enumerable: true,
        configurable: true
    })

}

Operation.prototype._startSingle = function () {
    var self = this;
    this.work(function (err, payload) {
        self.result = payload;
        self.error = err;
        self.completed = true;
        self.running = false;
        self._complete();
    });
};

Operation.prototype._startComposite = function () {
    var self = this;
    var operations = self.work instanceof Operation ? [self.work] : self.work;
    _.each(operations, function (op) {
        op.completion = function () {
            var numOperationsRemaining = self.numOperationsRemaining;
            if (!numOperationsRemaining) {
                var errors = _.pluck(operations, 'error');
                var results = _.pluck(operations, 'result');
                self.result = _.some(results) ? results : null;
                self.error = _.some(errors) ? errors : null;
                self.completed = true;
                self.running = false;
                self._complete();
            }
        };
        op.start();
    });
};

Operation.prototype._complete = function () {
    this.completed = true;
    if (this.completion) {
        _.bind(this.completion, this)();
    }
    _.each(this.observers, function (o) {o()});
};

Operation.prototype.__start = function () {
    var name = this.name || 'Unnamed';
    Logger.info('"' + name + '" has started.');
    if (this.work) {
        if (this.composite) {
            this._startComposite();
        }
        else {
            this._startSingle();
        }
    }
    else {
        this.result = null;
        this.error = null;
        this.running = false;
        this._complete();
    }
};

Operation.prototype.start = function () {
    var self = this;
    if (!this.running && !this.completed) {
        this.running = true;
        if (this.canRun) {
            this.__start();
        }
        else {
            _.each(this.dependencies, function (dep) {
                dep.addObserver(function () {
                    if (self.canRun) {
                        self.__start();
                    }
                })
            });
        }
    }
};

Operation.prototype.addDependency = function () {
    var self = this;
    if (arguments.length == 1) {
        this.dependencies.push(arguments[0]);
    }
    else if (arguments.length) {
        var args = arguments;
        var lastArg = args[args.length - 1];
        var mustSucceed = false;
        if (typeof(lastArg) == 'boolean') {
            args = Array.prototype.slice.call(args, 0, args.length - 1);
            mustSucceed = lastArg;
        }
        _.each(args, function (arg) {
            self.dependencies.push(arg);
        });
        if (mustSucceed) {
            _.each(args, function (arg) {
                self._mustSucceed.push(arg);
            })
        }
    }

};

Operation.prototype.addObserver = function (o) {
    this.observers.push(o);
};

Operation.prototype.removeObserver = function (o) {
    var idx = this.observers.indexOf(o);
    if (idx > -1) {
        this.observers.splice(idx, 1);
    }
};

Operation.prototype.cancel = function () {
    this.cancelled = true;
    this.running = false;
    if (this.composite) {
        _.each(this.work, function (subop) {
            subop.cancel();
        });
    }
    this._complete();
};

module.exports.Operation = Operation;