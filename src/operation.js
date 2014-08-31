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
    this.purpose = '';
    Object.defineProperty(this, 'failed', {
        get: function () {
            return !!self.error;
        },
        enumerable: true,
        configurable: true
    });
}

Operation.prototype.start = function () {
    if (!this.running && !this.completed) {
        this.running = true;
        var self = this;
        if (this.work) {
            this.work(function (err, payload) {
                self.result = payload;
                self.error = err;
                self.completed = true;
                self.running = false;
                if (self.completion) {
                    self.completion.call(this);
                }
            });
        }
        else {
            self.result = null;
            self.error = null;
            self.completed = true;
            self.running = false;
            if (self.completion) {
                self.completion.call(this);
            }
        }

    }
};

Operation.prototype._dump = function (asJson) {
    var obj = {
        purpose: this.purpose,
        name: this.name,
        error: this.error,
        completed: this.completed,
        failed: this.failed,
        running: this.running
    };
    return asJson ? JSON.stringify(obj, null, 4) : obj;
};

module.exports.Operation = Operation;