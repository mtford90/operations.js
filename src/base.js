function BaseOperation(name, work, completionCallback) {
    if (!this) return new BaseOperation(name, work, completionCallback);
    var self = this;
    this.name = name;
    this.work = work;
    this.error = null;
    this.completed = false;
    this.result = null;
    this.running = false;
    this.completionCallback = completionCallback;
    this.purpose = '';
    Object.defineProperty(this, 'failed', {
        get: function () {
            return !!self.error;
        },
        enumerable: true,
        configurable: true
    });
}

BaseOperation.prototype.start = function () {
    if (!this.running && !this.completed) {
        this.running = true;
        var self = this;
        this.work(function (err, payload) {
            self.result = payload;
            self.error = err;
            self.completed = true;
            self.running = false;
            if (self.completionCallback) {
                self.completionCallback.call(this);
            }
        });
    }
};

BaseOperation.prototype._dump = function (asJson) {
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

module.exports.BaseOperation = BaseOperation;