var Operation = require('./operation').Operation;
var OperationQueue = require('./queue').OperationQueue;
var Logger = require('./log');
var _ = require('underscore');


if (typeof window == 'object') {
    //noinspection JSValidateTypes
    op = {
        Operation: Operation,
        OperationQueue: OperationQueue,
        Logger: Logger
    };
}
else {
    exports.Operation = Operation;
    exports.OperationQueue = OperationQueue;
    exports.Logger = Logger;
}