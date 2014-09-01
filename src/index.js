var Operation = require('./operation').Operation;
var OperationQueue = require('./queue').OperationQueue;
var Logger = require('./log');


if (window) {
    window.op = {
        Operation: Operation,
        OperationQueue: OperationQueue,
        Logger: Logger
    }
}