var BaseOperation = require('./base').BaseOperation;
var CompositeOperation = require('./composite').CompositeOperation;
var OperationQueue = require('./composite').OperationQueue;


if (window) {
    window.op = {
        BaseOperation: BaseOperation,
        CompositeOperation: CompositeOperation,
        OperationQueue: OperationQueue
    }
}