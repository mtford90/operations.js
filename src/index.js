var Operation = require('./operation').Operation;
var CompositeOperation = require('./composite').CompositeOperation;
var OperationQueue = require('./composite').OperationQueue;


if (window) {
    window.op = {
        Operation: Operation,
        CompositeOperation: CompositeOperation,
        OperationQueue: OperationQueue
    }
}