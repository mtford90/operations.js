var Operation = require('./operation').Operation;
var OperationQueue = require('./queue').OperationQueue;


if (window) {
    window.op = {
        Operation: Operation,
        OperationQueue: OperationQueue
    }
}